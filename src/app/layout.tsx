// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopProgress } from "@/components/ui/top-progress";
import whiteLogo from "@/images/Logos/white logo.svg";
import blackLogo from "@/images/Logos/black logo.svg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCTC Portal | Taekwondo Tournament Rosters",
  description:
    "Manage athlete rosters for the Minnesota Collegiate Taekwondo Championship — Spring and Fall editions.",
  icons: {
    icon: [
      { url: blackLogo.src, type: "image/svg+xml" },
      {
        url: whiteLogo.src,
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: blackLogo.src,
    apple: blackLogo.src,
  },
};

export const viewport: Viewport = {
  themeColor: "#a33030",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <TopProgress />
        {children}
      </body>
    </html>
  );
}