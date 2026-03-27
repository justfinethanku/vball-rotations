import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VBall Rotations",
  description: "Interactive volleyball rotation learning tool — learn 5-1 and 6-2 systems with animated court diagrams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} antialiased min-h-full bg-gray-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
