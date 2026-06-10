import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { MessageProvider } from "@/providers/message-provider";
import MessageDisplay from "@/components/ui/MessageDisplay";
import BackToTopButton from "./components/BackToTopButton";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// app/layout.tsx
export const metadata = {
  title: "Bolão Copa 2026",
  description: "Sistema de apostas",
  other: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        figtree.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <MessageProvider>
          {/* <MessageDisplay /> */}
          {children}
          <BackToTopButton position="bottom-center" />
        </MessageProvider>
      </body>
    </html>
  );
}
