import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineScope — AI Movie Insight Builder",
  description:
    "Enter any IMDb movie ID to get AI-powered sentiment analysis, audience insights, cast details, and more.",
  keywords: ["movies", "IMDb", "sentiment analysis", "AI", "film insights"],
  openGraph: {
    title: "CineScope — AI Movie Insight Builder",
    description: "AI-powered movie sentiment analysis and audience insights",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-navy-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
