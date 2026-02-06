import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryProvider } from "@/components/shared/query-provider";

export const metadata: Metadata = {
  title: "KakaoBook - AI 기반 지식 노트북",
  description:
    "소스를 업로드하고 AI와 채팅하고, 인포그래픽과 슬라이드를 자동 생성하세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
