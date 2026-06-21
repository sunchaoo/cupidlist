import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FriendsProvider } from "@/context/FriendsContext";
import { AppShell } from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CupidList · Be the matchmaker",
  description:
    "Organize your single friends and introduce them with a tap. Your friendly matchmaking sidekick.",
};

export const viewport: Viewport = {
  themeColor: "#f43f73",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-slate-800 antialiased">
        <FriendsProvider>
          <AppShell>{children}</AppShell>
        </FriendsProvider>
      </body>
    </html>
  );
}
