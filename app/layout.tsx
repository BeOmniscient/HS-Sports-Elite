import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "HS Sports Elite | Northern NJ High School Sports", template: "%s | HS Sports Elite" },
  description: "Northern NJ's premier source for high school sports news, scores, standings, and athlete profiles.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://highschoolsportselite.com"),
  openGraph: {
    siteName: "HS Sports Elite",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  keywords: ["NJ high school sports", "Northern NJ sports", "Bergen County sports", "NJSIAA", "high school football NJ"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
