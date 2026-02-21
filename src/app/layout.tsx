import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forex Calculator Pro - Professional Trading Tools",
  description: "Professional forex trading calculators including position size, pip value, margin, profit/loss, and AI-powered market analysis. Available in English and Arabic.",
  keywords: ["Forex", "Calculator", "Trading", "Position Size", "Pip Value", "Margin", "AI Analysis", "فوركس", "حاسبة"],
  authors: [{ name: "Forex Calculator Pro" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Forex Calculator Pro",
    description: "Professional trading tools for forex traders",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forex Calculator Pro",
    description: "Professional trading tools for forex traders",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
