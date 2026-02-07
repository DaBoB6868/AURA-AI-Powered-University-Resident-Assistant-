import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { initializeDocuments } from "@/lib/initialize-documents";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dorm RA Bot",
  description: "Community Guide Assistant - Ask questions about dorm policies",
};

// Initialize documents on server startup
initializeDocuments().catch((error) => {
  console.error("Failed to initialize documents:", error);
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
