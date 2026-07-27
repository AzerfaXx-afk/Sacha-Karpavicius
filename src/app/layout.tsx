import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";
import { SiteProvider } from "@/context/site-context";
import GlobalAudioSignal from "@/components/global-audio-signal";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SACHA KARPAVICIUS",
  description:
    "High-end portfolio of Sacha Karpavicius — Visual Storyteller, Fashion Photographer & Art Director.",
  icons: {
    icon: "/logo.png",
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
        <SiteProvider>
          <SmoothScrollProvider>
            <main className="flex-1 flex flex-col">{children}</main>
          </SmoothScrollProvider>
          <GlobalAudioSignal />
        </SiteProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (let registration of registrations) {
                      registration.unregister().then(function() {
                        console.log('Local Service Worker unregistered to prevent HMR issues.');
                      });
                    }
                  });
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(reg) {
                      console.log('SW registered:', reg.scope);
                    }).catch(function(err) {
                      console.log('SW registration failed:', err);
                    });
                  });
                }
              }
            `
          }}
        />
      </body>
    </html>
  );
}
