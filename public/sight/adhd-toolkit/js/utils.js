/* ── Shared utilities ── */

const Storage = {
  get(key, fallback = null) {
    try {
      const data = localStorage.getItem('adhd_' + key);
      return data ? JSON.parse(data) : fallback;
    } catch { return fallback; }
  },

  set(key, value) {
    try { localStorage.setItem('adhd_' + key, JSON.stringify(value)); } catch {}
  },

  remove(key) {
    try { localStorage.removeItem('adhd_' + key); } catch {}
  }
};

/* ── Sound notification (Web Audio) ── */
function playNotification() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);

    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 880;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.5);
    }, 200);
  } catch {}
}

/* ── Format time (MM:SS) ── */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ── Current date string ── */
function dateStr() {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
}

/* ── Safe ID ── */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
