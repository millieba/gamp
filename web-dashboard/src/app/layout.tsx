import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

export const metadata: Metadata = {
  title: "Web Dashboard",
  description: "Motivational GitHub badge dashboard",
};

const montserrat = Montserrat({
  subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "vietnamese"],
  display: "swap",
  weight: ["400", "700"],
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
