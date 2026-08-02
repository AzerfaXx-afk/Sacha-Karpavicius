import type { Metadata, Viewport } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";
import { SiteProvider } from "@/context/site-context";
import GlobalAudioSignal from "@/components/global-audio-signal";
import PwaInstallPrompt from "@/components/pwa-install-prompt";

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
  icons: {
    icon: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sacha K. App",
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
      className={`${syne.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <SiteProvider>
          <SmoothScrollProvider>
            <main className="flex-1 flex flex-col">{children}</main>
          </SmoothScrollProvider>
          <GlobalAudioSignal />
          <PwaInstallPrompt />
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
