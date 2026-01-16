import React from 'react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-20 text-center">
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Protect Your Sight with AI
      </h1>
      <p className="text-xl text-text-dim mb-10 max-w-2xl">
        VisionGuard AI uses advanced face mesh technology to monitor your posture,
        screen distance, and enforce the 20-20-20 rule—all in your browser.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-primary/50 transition-all">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Vision Detective Pro</h3>
          <p className="text-text-dim text-sm mb-6">Real-time monitoring of posture and distance.</p>
          <button className="w-full py-3 bg-primary text-black font-bold rounded-xl transition-transform hover:scale-105">
            Start Monitoring
          </button>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-accent/50 transition-all">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-bold mb-2">Vision Analytics</h3>
          <p className="text-text-dim text-sm mb-6">Track your eye health habits over time.</p>
          <button className="w-full py-3 bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-transform hover:scale-105">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
