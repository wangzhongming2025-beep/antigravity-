/**
 * Trainee Auth & Data Reporting Helper for VisionGuard AI
 */

const SUPABASE_URL = 'https://oqwqlrmqblguiikrsmjf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd3Fscm1xYmxndWlpa3JzbWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMzcwMDUsImV4cCI6MjA4MzcxMzAwNX0.JlVesN-orDXZa5skq_WmKcVTlLP_HKMq2GKWwfuMoTA';

const TraineeAuth = {
    getTraineeId: () => localStorage.getItem('trainee_id'),

    setTraineeId: (id) => {
        if (!id) return;
        localStorage.setItem('trainee_id', id);
    },

    logout: () => {
        localStorage.removeItem('trainee_id');
        location.reload();
    },

    checkAuth: () => {
        const id = TraineeAuth.getTraineeId();
        if (!id) {
            TraineeAuth.showLoginModal();
            return false;
        }
        return id;
    },

    showLoginModal: () => {
        const modalHtml = `
            <div id="trainee-login-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                <div class="w-full max-w-sm bg-zinc-900 border border-zinc-700 p-8 rounded-[32px] text-center shadow-2xl">
                    <div class="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">🪪</div>
                    <h3 class="text-xl font-bold text-white mb-2">学员身份验证</h3>
                    <p class="text-zinc-500 text-sm mb-8">准备开始特训！请输入您的手机号或连队编号作为 ID</p>
                    
                    <input type="text" id="trainee-id-input" placeholder="输入手机号 / 学员编号" 
                        class="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white text-center text-lg mb-6 focus:outline-none focus:border-cyan-500 transition-colors">
                    
                    <button onclick="TraineeAuth.handleLogin()" 
                        class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl transition-all shadow-lg active:scale-95">
                        进入训练舱
                    </button>
                    
                    <p class="text-[10px] text-zinc-600 mt-6 uppercase tracking-widest font-mono">VisionGuard Cadet Protocol V1.0</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    handleLogin: async () => {
        const input = document.getElementById('trainee-id-input');
        const id = input.value.trim();
        if (!id) return alert('请输入有效的学员 ID');

        TraineeAuth.setTraineeId(id);

        // Try to ensure trainee exists in DB (Upsert)
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/trainees`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({ trainee_id: id, name: `学员_${id.slice(-4)}` })
            });
        } catch (e) { console.error('Trainee upsert failed', e); }

        document.getElementById('trainee-login-modal').remove();
        if (typeof nextLevel === 'function') nextLevel(); // For Gabor
        if (typeof createGrid === 'function') createGrid(); // For Schulte
    },

    reportResult: async (project, score, duration) => {
        const trainee_id = TraineeAuth.getTraineeId();
        if (!trainee_id) return;

        console.log(`Reporting: ${project}, Score: ${score}, Duration: ${duration}`);

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/training_logs`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trainee_id: trainee_id,
                    project_name: project,
                    score: score.toString(),
                    duration: parseFloat(duration)
                })
            });
            if (!res.ok) throw new Error('Data report failed');
            console.log('Result reported successfully');
        } catch (e) {
            console.error(e);
        }
    }
};
