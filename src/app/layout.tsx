import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SACHA KARPAVICIUS | Visual Storyteller",
  description:
    "High-end portfolio of Sacha Karpavicius — Visual Storyteller, Fashion Photographer & Art Director.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <SmoothScrollProvider>
          <main className="flex-1 flex flex-col">{children}</main>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
