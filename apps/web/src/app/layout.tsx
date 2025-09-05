import type { Metadata } from "next";
import "./globals.css";
import SwRegistrar from "@/components/SwRegistrar";

export const metadata: Metadata = {
  title: "Mozaik",
  description: "Plan, research, and execute with Mozaik.",
  themeColor: "#0b0b10",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <SwRegistrar />
        {children}
      </body>
    </html>
  );
}
