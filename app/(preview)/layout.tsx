import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { AI } from "./actions";


export const metadata: Metadata = {
  metadataBase: new URL("https://ai-sdk-preview-rsc-genui.vercel.dev"),
  title: "پیش‌نمایش رابط‌های کاربری تولیدی",
  description: "رابط کاربری تولیدی با React Server Components و Vercel AI SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Toaster position="top-center" richColors />
        <AI>{children}</AI>
      </body>
    </html>
  );
}
