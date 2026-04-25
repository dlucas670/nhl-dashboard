import type { Metadata } from "next";
import "./globals.css";
import Header from './components/Header'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: "Stat Grinder",
  description: "Assign NHL, NFL, MLB & NBA teams to stat categories. Chase the lowest score. Free to play — how well do you actually know your stats?",
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "Stat Grinder",
    description: "Assign NHL, NFL, MLB & NBA teams to stat categories. Chase the lowest score. Free to play — how well do you actually know your stats?",
    url: "https://statgrinder.com",
    siteName: "Stat Grinder",
    images: [
      {
        url: "https://statgrinder.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stat Grinder — Sports Analytics Trivia",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stat Grinder",
    description: "Assign NHL, NFL, MLB & NBA teams to stat categories. Chase the lowest score. Free to play — how well do you actually know your stats?",
    images: ["https://statgrinder.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
