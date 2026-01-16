import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VisionGuard AI - Your Personal Eye Care Sentinel",
  description: "Stop eye strain with AI. Real-time screen distance monitoring and 20-20-20 rule enforcement. No wearables needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex h-screen overflow-hidden`}>
        <div className="bg-glow"></div>
        <Sidebar />
        <main className="flex-1 flex flex-col relative h-full">
          <header className="h-20 px-10 flex items-center justify-between border-b border-white/10 bg-black/20">
            <div className="tool-title">
              <h2 className="text-2xl font-semibold">VisionGuard AI</h2>
            </div>
            <div className="flex items-center gap-5">
              <div className="px-4 py-1.5 rounded-full bg-safe/10 text-safe text-xs border border-safe/20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-safe rounded-full shadow-[0_0_10px_#00ff88]"></div>
                System Healthy
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto relative">
            {children}
          </div>
          <footer className="py-6 border-t border-zinc-900 text-center text-zinc-600 text-sm bg-black">
            &copy; 2024 VisionGuard AI. All rights reserved.
          </footer>
        </main>
      </body>
    </html>
  );
}
