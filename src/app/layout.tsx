import type { Metadata, Viewport } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";
import { SiteProvider } from "@/context/site-context";
import GlobalAudioSignal from "@/components/global-audio-signal";
import PwaInstallPrompt from "@/components/pwa-install-prompt";
import PostProcessing from "@/components/post-processing";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "SACHA KARPAVICIUS",
  description:
    "High-end portfolio of Sacha Karpavicius — Visual Storyteller, Fashion Photographer & Art Director.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SACHA KARPAVICIUS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${syne.variable} ${inter.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <SiteProvider>
          <SmoothScrollProvider>
            <main className="flex-1 flex flex-col">{children}</main>
          </SmoothScrollProvider>
          <GlobalAudioSignal />
          <PwaInstallPrompt />
          <PostProcessing />
        </SiteProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('SW registered:', reg.scope);
                }).catch(function(err) {
                  console.log('SW registration failed:', err);
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
