import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { TourProvider } from "@/components/tour/tour-provider";
import { TipProvider } from "@/components/tips/tip-provider";

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
        <Providers>
          <Suspense fallback={null}>
            <TourProvider>
              <TipProvider>
                {children}
                <Toaster position="top-center" richColors />
              </TipProvider>
            </TourProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
