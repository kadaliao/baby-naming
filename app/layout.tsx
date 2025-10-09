import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "宝宝取名助手 - AI智能起名",
  description: "基于唐诗、五行八字与AI的智能起名工具，结合传统文化与现代科技，为您的宝宝取一个好听又有意义的名字",
  keywords: ["宝宝取名", "起名", "五行八字", "唐诗起名", "AI起名", "中国传统文化"],
  authors: [{ name: "Baby Naming Team" }],
  openGraph: {
    title: "宝宝取名助手 - AI智能起名",
    description: "基于唐诗、五行八字与AI的智能起名工具",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
