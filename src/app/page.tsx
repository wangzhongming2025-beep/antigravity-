import React from 'react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8 animate-bounce">
            Intelligence Meets Vision
          </div>

          <h1 className="text-6xl md:text-8xl font-black font-outfit tracking-tighter mb-8 leading-[0.9]">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent">
              Eye Protection.
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            VisionGuard AI transforms your webcam into a medical-grade sentinel.
            Real-time monitoring, intelligent reminders, and predictive analytics—all in your browser.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="/sight/dashboard.html" className="group relative px-10 py-5 bg-white text-black font-black rounded-2xl overflow-hidden hover:scale-105 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)]">
              <span className="relative z-10 flex items-center gap-2">
                Start Monitoring Now
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </span>
            </a>
            <a href="#products" className="px-10 py-5 bg-zinc-900 text-white font-bold rounded-2xl border border-white/10 hover:bg-zinc-800 transition-all hover:border-white/20">
              Explore Tools
            </a>
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-full -z-20 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at center, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
      </section>

      {/* Product Gateway Grid */}
      <section id="products" className="py-24 px-6 bg-gradient-to-b from-transparent to-black/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Sight Health Pro */}
            <div className="group relative p-1px rounded-3xl overflow-hidden bg-gradient-to-br from-primary/50 to-transparent p-[1px]">
              <div className="bg-[#0c0e12] p-10 rounded-[23px] h-full flex flex-col items-start">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                  📏
                </div>
                <h3 className="text-3xl font-black font-outfit mb-4">VisionGuard Pro</h3>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                  Advanced AI distance sensing and posture alerts. Perfect for software engineers and students spending 8+ hours on screens.
                </p>
                <div className="flex flex-wrap gap-2 mb-10">
                  {['Realtime AI', 'PostCheck', '20-20-20'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-zinc-500">
                      {tag}
                    </span>
                  ))}
                </div>
                <a href="/sight/index.html" className="mt-auto px-6 py-3 bg-primary text-black font-bold rounded-xl flex items-center gap-2 hover:brightness-110 transition-all">
                  Access Sight Panel
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </a>
              </div>
            </div>

            {/* AI Remix Tool */}
            <div className="group relative p-1px rounded-3xl overflow-hidden bg-gradient-to-br from-accent/50 to-transparent p-[1px]">
              <div className="bg-[#0c0e12] p-10 rounded-[23px] h-full flex flex-col items-start">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                  🪄
                </div>
                <h3 className="text-3xl font-black font-outfit mb-4">AI Remix Tool</h3>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                  Generate viral content instantly. Specialized for XHS washing, persona building, and product-focused viral logic.
                </p>
                <div className="flex flex-wrap gap-2 mb-10">
                  {['Viral Logic', 'Remix AI', 'SEO Optimized'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-zinc-500">
                      {tag}
                    </span>
                  ))}
                </div>
                <a href="/antigeren/xhs_generator.html" className="mt-auto px-6 py-3 bg-accent text-white font-bold rounded-xl flex items-center gap-2 hover:brightness-125 transition-all">
                  Open Remix Station
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Academy Feature */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-zinc-900/40 border border-white/5 p-12 text-center md:text-left md:flex items-center gap-12">
          <div className="flex-1 mb-8 md:mb-0">
            <span className="text-primary font-black text-[10px] uppercase tracking-widest mb-4 block">New From Academy</span>
            <h2 className="text-3xl font-black font-outfit text-white mb-6">Mastering Myopia Management</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Explore our latest evidence-based guide on Ortho-K, Atropine, and how AI-driven lifestyle changes can slow nearsightedness in children.
            </p>
            <a href="/sight/article_myopia_management.html" className="inline-block text-white font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors">
              Read the full report
            </a>
          </div>
          <div className="w-full md:w-64 aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl shadow-inner">
            📚
          </div>
        </div>
      </section>

    </div>
  );
}
