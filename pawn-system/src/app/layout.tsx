import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { auth } from "@/auth";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "./providers";
import { TourProvider } from "@/components/tour/tour-provider";
import { TipProvider } from "@/components/tips/tip-provider";
import { AIProvider } from "@/components/ai/ai-provider";
import { AIAssistant } from "@/components/ai/ai-assistant";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Local Geist font configuration
const geistSans = GeistSans;
const geistMono = GeistMono;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Cashpoint",
  description: "Pawn Shop Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5BX9Z4TBY9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-5BX9Z4TBY9');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Suspense fallback={null}>
            <TourProvider user={user}>
              <AIProvider userRole={(user as any)?.role || "GUEST"}>
                <TipProvider>
                  {children}
                  <AIAssistant />
                  <SpeedInsights />
                </TipProvider>
              </AIProvider>
            </TourProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
