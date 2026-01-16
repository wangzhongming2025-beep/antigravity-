import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "VisionGuard AI | Professional Eye Health Sentinel",
  description: "Advanced AI-powered eye protection. Monitor screen distance, posture, and eye strain in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-[#05070a] text-zinc-100 antialiased min-h-screen relative overflow-x-hidden`}>
        {/* Background Ambient Glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse"></div>
        </div>

        {/* Global Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(0,242,255,0.4)] group-hover:scale-110 transition-transform">
                V
              </div>
              <span className="font-outfit font-bold text-xl tracking-tight hidden sm:block">VisionGuard AI</span>
            </div>

            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                <a href="#products" className="hover:text-primary transition-colors">Products</a>
                <a href="/sight/blog.html" className="hover:text-primary transition-colors">Academy</a>
                <a href="/sight/dashboard.html" className="hover:text-primary transition-colors">Dashboard</a>
              </div>
              <a href="/sight/dashboard.html" className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95">
                Launch App
              </a>
            </div>
          </div>
        </nav>

        <main className="relative pt-20">
          {children}
        </main>

        <footer className="py-20 border-t border-white/5 bg-black/40">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-zinc-500 text-sm font-outfit uppercase tracking-[0.2em]">© 2026 VisionGuard AI • Precision Eye Protection</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
