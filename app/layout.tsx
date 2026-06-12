import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "allfoods — 급식 식자재 입찰·가격 인텔리전스",
  description:
    "경북 학교급식 식자재 입찰 공고와 농산물 도매가를 한 화면에서. 나라장터·KAMIS 실시간 + AI 입찰 분석.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
