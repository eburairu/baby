import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { OfflineSyncIndicator } from "@/components/OfflineSyncIndicator";
import { SplashScreenWrapper } from "@/components/ui/splash-screen-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Botoro - 家族で共有する育児記録アプリ",
    template: "%s | Botoro",
  },
  description: "授乳・睡眠・おむつ記録をリアルタイムで家族共有。AIによる育児サマリーで赤ちゃんの成長をもっと身近に。招待制のプライベートな育児記録アプリです。",
  keywords: ["育児記録", "授乳記録", "睡眠記録", "おむつ記録", "家族共有", "赤ちゃん", "育児アプリ"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Botoro",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192x192.svg",
  },
  openGraph: {
    title: "Botoro - 家族で共有する育児記録アプリ",
    description: "授乳・睡眠・おむつ記録をリアルタイムで家族共有。AIサマリーで育児をもっと楽しく。",
    locale: "ja_JP",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          #initial-splash {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: oklch(0.98 0.012 350);
          }
          .dark #initial-splash {
            background-color: oklch(0.18 0.04 280);
          }
          #initial-splash-title {
            font-size: 2rem;
            font-weight: 800;
            background: linear-gradient(to right, #f472b6, #fb7185, #e879f9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased`}
      >
        <div id="initial-splash" aria-hidden="true">
          <span id="initial-splash-title">Botoro</span>
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          )}
          <ServiceWorkerRegister />
          <OfflineSyncIndicator />
          <SplashScreenWrapper />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
