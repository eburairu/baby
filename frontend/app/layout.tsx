import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SplashScreen } from "@/components/ui/splash-screen";
import Script from "next/script";

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

export const metadata: Metadata = {
  title: {
    default: "Baby App - 家族で共有する育児記録アプリ",
    template: "%s | Baby App",
  },
  description: "授乳・睡眠・おむつ記録をリアルタイムで家族共有。AIによる育児サマリーで赤ちゃんの成長をもっと身近に。招待制のプライベートな育児記録アプリです。",
  keywords: ["育児記録", "授乳記録", "睡眠記録", "おむつ記録", "家族共有", "赤ちゃん", "育児アプリ"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Baby App",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192x192.svg",
  },
  openGraph: {
    title: "Baby App - 家族で共有する育児記録アプリ",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
          <SplashScreen />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
