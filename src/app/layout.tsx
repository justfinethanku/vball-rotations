import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

const siteUrl = "https://vball.mohammadhameed.dev";
const title = "VBall Rotations — Interactive Volleyball Rotation Tool";
const description =
  "Free interactive volleyball rotation tool. Visualize 5-1 and 6-2 systems with animated court diagrams, player movements, and phase breakdowns. Built for players, coaches, and fans.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "volleyball rotations",
    "volleyball rotation tool",
    "5-1 volleyball system",
    "6-2 volleyball system",
    "volleyball court diagram",
    "volleyball positions",
    "volleyball setter rotation",
    "volleyball coaching tool",
    "volleyball rotation chart",
    "interactive volleyball",
    "volleyball formation",
    "volleyball lineup",
    "volleyball strategy",
    "libero rotation",
    "volleyball serve receive",
  ],
  authors: [{ name: "Mohammad Hameed", url: "https://mohammadhameed.dev" }],
  creator: "Mohammad Hameed",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: "VBall Rotations",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VBall Rotations — Interactive Volleyball Rotation Tool",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  other: {
    "google-site-verification": "",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "VBall Rotations",
              url: siteUrl,
              description,
              applicationCategory: "SportsApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Mohammad Hameed",
                url: "https://mohammadhameed.dev",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-full bg-gray-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
