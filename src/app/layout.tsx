import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = { title:"Pangaan OS", description:"Pangaan's internal single source of truth" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${GeistSans.variable} ${GeistMono.variable}`} style={{fontFamily:"var(--font-geist-sans), Arial, sans-serif"}}>{children}</body></html>;
}
