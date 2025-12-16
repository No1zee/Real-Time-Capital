import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { TourProvider } from "@/components/tour/tour-provider";
import { TipProvider } from "@/components/tips/tip-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Suspense fallback={null}>
            <TourProvider user={user}>
              <TipProvider>
                {children}
                <Toaster position="top-center" richColors />
                <SpeedInsights />
              </TipProvider>
            </TourProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
