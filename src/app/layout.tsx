import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WatchPoint",
  description: "Monitor websites for changes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen">{children}</body>
    </html>
  );
}
