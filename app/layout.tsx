import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Is My Idea Great or Not?",
  description: "Submit an idea. Get judged. Brutally. No market research was performed.",
  openGraph: {
    title: "Is My Idea Great or Not?",
    description: "Submit an idea. Get judged. Brutally.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-black focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
