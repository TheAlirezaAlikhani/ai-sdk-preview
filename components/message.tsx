"use client";

import { motion } from "framer-motion";
import { BotIcon, UserIcon } from "./icons";
import { ReactNode } from "react";
import { StreamableValue, useStreamableValue } from "@ai-sdk/rsc";
import { Markdown } from "./markdown";

export const TextStreamMessage = ({
  content,
}: {
  content: StreamableValue;
}) => {
  const [text] = useStreamableValue(content);

  return (
    <motion.div
      className={`flex flex-row-reverse gap-2 px-2 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >

      <div className="flex flex-col gap-1 w-full">
        <div className=" text-[13px] text-zinc-800 dark:text-zinc-300 flex flex-col gap-4 text-right">
          <Markdown>{text}</Markdown>
        </div>
      </div>
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        <BotIcon />
      </div>
    </motion.div>
  );
};

export const Message = ({
  role,
  content,
}: {
  role: "assistant" | "user";
  content: string | ReactNode;
}) => {
  return (
    <motion.div
      className={`flex flex-row-reverse gap-2 px-2 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >

      <div className="flex flex-col gap-1 w-full">
        <div className="text-[13px] text-zinc-800 dark:text-zinc-300 flex flex-col gap-4 text-right">
          {content}
        </div>
      </div>
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>
    </motion.div>
  );
};
