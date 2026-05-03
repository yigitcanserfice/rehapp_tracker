import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fizik Tedavi Takip",
  description: "Kisisel fizik tedavi programi takip uygulamasi"
};

export const viewport: Viewport = {
  themeColor: "#f7faf8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
