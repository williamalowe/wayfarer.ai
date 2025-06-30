import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manropeFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wayfarer AI",
  description: "Your AI travel planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manropeFont.variable} min-h-screen antialiased bg-[#ffff] text-black`}
      >
        {children}
      </body>
    </html>
  );
}
