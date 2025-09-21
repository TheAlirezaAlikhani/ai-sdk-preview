import { Message, TextStreamMessage } from "@/components/message";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

import { CoreMessage, generateId } from "ai";
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from "@ai-sdk/rsc";
import { ReactNode } from "react";
import { z } from "zod";
import { CameraView } from "@/components/camera-view";
import { HubView } from "@/components/hub-view";
import { UsageView } from "@/components/usage-view";

export interface Hub {
  climate: Record<"low" | "high", number>;
  lights: Array<{ name: string; status: boolean }>;
  locks: Array<{ name: string; isLocked: boolean }>;
}

let hub: Hub = {
  climate: {
    low: 23,
    high: 25,
  },
  lights: [
    { name: "ایوان", status: true },
    { name: "آشپزخانه", status: false },
    { name: "گاراژ", status: true },
  ],
  locks: [{ name: "در پشتی", isLocked: true }],
};

const sendMessage = async (message: string) => {
  "use server";

  const openrouter = createOpenRouter({
    apiKey: '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',
  });

  const messages = getMutableAIState<typeof AI>("messages");

  messages.update([
    ...(messages.get() as CoreMessage[]),
    { role: "user", content: message },
  ]);

  const contentStream = createStreamableValue("");
  const textComponent = <TextStreamMessage content={contentStream.value} />;

  const { value: stream } = await streamUI({
    model: openrouter.chat('x-ai/grok-4-fast:free'),
    system: `\
      - تو یک دستیار خانه هوشمند هستی
      - شما به زبان فارسی حرف میزنید
    `,
    messages: messages.get() as CoreMessage[],
    text: async function* ({ content, done }: { content: string; done: boolean }) {
      if (done) {
        messages.done([
          ...(messages.get() as CoreMessage[]),
          { role: "assistant", content },
        ]);

        contentStream.done();
      } else {
        contentStream.update(content);
      }

      return textComponent;
    },
    tools: {
      viewCameras: {
        description: "مشاهده دوربین‌های فعال فعلی",
        inputSchema: z.object({}),
        generate: async function* ({}) {
          return <Message role="assistant" content={<CameraView />} />;
        },
      },
      viewHub: {
        description:
          "مشاهده هاب که شامل خلاصه سریع فعلی و اقدامات برای دما، چراغ‌ها و قفل‌ها است",
        inputSchema: z.object({}),
        generate: async function* ({}) {
          return <Message role="assistant" content={<HubView hub={hub} />} />;
        },
      },
      updateHub: {
        description: "به‌روزرسانی هاب با مقادیر جدید",
        inputSchema: z.object({
          hub: z.object({
            climate: z.object({
              low: z.number(),
              high: z.number(),
            }),
            lights: z.array(
              z.object({ name: z.string(), status: z.boolean() }),
            ),
            locks: z.array(
              z.object({ name: z.string(), isLocked: z.boolean() }),
            ),
          }),
        }),
        generate: async function* ({ hub: newHub }: { hub: Hub }) {
          hub = newHub;
          return <Message role="assistant" content={<HubView hub={hub} />} />;
        },
      },
      viewUsage: {
        description: "مشاهده مصرف فعلی برق، آب یا گاز",
        inputSchema: z.object({
          type: z.enum(["electricity", "water", "gas"]),
        }),
        generate: async function* ({ type }: { type: "electricity" | "water" | "gas" }) {
          return (
            <Message role="assistant" content={<UsageView type={type} />} />
          );
        },
      },
    },
  });

  return stream;
};

export type UIState = Array<ReactNode>;

export type AIState = {
  chatId: string;
  messages: Array<CoreMessage>;
};

export const AI = createAI<AIState, UIState>({
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  initialUIState: [],
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ state, done }) => {
    "use server";

    if (done) {
      // save to database
    }
  },
});
