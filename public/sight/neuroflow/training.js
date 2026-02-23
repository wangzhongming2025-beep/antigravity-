/**
 * NeuroFlow - ADHD 神经递质优化系统
 * Logic Engine based on Huberman & Barkley Protocols
 */

const app = {
    // State
    state: {
        currentStage: 'intro',
        focusTimeRemaining: 60,
        flowTimeRemaining: 1500, // 25 mins
        isAudioEnabled: true,
        mainTask: '',
        subtasks: [],
        distractions: [],
        timerInterval: null
    },

    // UI Elements
    elements: {
        stages: document.querySelectorAll('.stage'),
        focusTimerText: document.getElementById('focusTimer'),
        flowTimerText: document.getElementById('mainCountdown'),
        timerCircle: document.getElementById('timerCircle'),
        breathingGuide: document.getElementById('breathingGuide'),
        activeSubtasks: document.getElementById('activeSubtasks'),
        distractionList: document.getElementById('distractionList'),
        currentFocusTask: document.getElementById('currentFocusTask')
    },

    init() {
        console.log("NeuroFlow Initiated");
        this.setupAudioToggle();
        // Set initial circular timer state
        if (this.elements.timerCircle) {
            this.elements.timerCircle.style.strokeDashoffset = 0;
        }
    },

    setupAudioToggle() {
        const toggle = document.getElementById('audioToggle');
        toggle.addEventListener('click', () => {
            this.state.isAudioEnabled = !this.state.isAudioEnabled;
            toggle.querySelector('.status').innerText = this.state.isAudioEnabled ? '声音开启' : '声音关闭';
            toggle.querySelector('.icon').innerText = this.state.isAudioEnabled ? '🔊' : '🔇';
        });
    },

    // --- Audio Synthesis ---
    speak(text) {
        if (!this.state.isAudioEnabled) return;

        // Cancel ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Find a male Chinese voice
        const voices = window.speechSynthesis.getVoices();
        const maleVoice = voices.find(v =>
            (v.lang.includes('zh') || v.lang.includes('CN')) &&
            (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('yunxi') || v.name.toLowerCase().includes('kangkang'))
        );

        if (maleVoice) {
            utterance.voice = maleVoice;
        }

        utterance.lang = 'zh-CN';
        utterance.rate = 0.85; // Slightly slower for more authority
        utterance.pitch = 0.8; // Lower pitch for magnetic feel
        window.speechSynthesis.speak(utterance);
    },

    playChime() {
        if (!this.state.isAudioEnabled) return;
        // Simple synthesized chime using Web Audio API
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    },

    // --- Navigation ---
    switchStage(stageId) {
        this.elements.stages.forEach(s => s.classList.remove('active'));
        document.getElementById(`stage-${stageId}`).classList.add('active');
        this.state.currentStage = stageId;

        // Context specific actions
        if (stageId === 'focus') this.startFocusWarmup();
        if (stageId === 'timer') this.startFlowSession();
        if (stageId === 'reward') this.showReward();
    },

    // --- Stage 1: Huberman Warmup ---
    startFlow() {
        this.switchStage('focus');
        this.speak("正在启动神经预热程序。请锁定视觉焦点，跟随呼吸。");
    },

    startFocusWarmup() {
        this.state.focusTimeRemaining = 60;
        const breathingCycle = [
            "吸气...",
            "再次快速吸气...",
            "深呼气..."
        ];
        let breatheIndex = 0;

        this.state.timerInterval = setInterval(() => {
            this.state.focusTimeRemaining--;
            this.elements.focusTimerText.innerText = `${this.state.focusTimeRemaining}s`;

            // Update breathing guide text every 4 seconds
            if (this.state.focusTimeRemaining % 4 === 0) {
                this.elements.breathingGuide.innerText = breathingCycle[breatheIndex];
                breatheIndex = (breatheIndex + 1) % breathingCycle.length;
            }

            if (this.state.focusTimeRemaining <= 0) {
                clearInterval(this.state.timerInterval);
                this.finishWarmup();
            }
        }, 1000);
    },

    finishWarmup() {
        this.playChime();
        this.speak("预热完成。前额叶皮层已激活。现在，让我们外置你的任务计划。");
        this.switchStage('decompose');
    },

    // --- Stage 2: Barkley Decomp ---
    confirmTasks() {
        const mainInput = document.getElementById('mainTask');
        const subInputs = document.querySelectorAll('.subtask-input');

        this.state.mainTask = mainInput.value || "未命名任务";
        this.state.subtasks = Array.from(subInputs)
            .map(input => input.value)
            .filter(v => v.trim() !== "")
            .map(text => ({ text, completed: false }));

        if (this.state.subtasks.length === 0) {
            alert("请至少拆解一个微行动");
            return;
        }

        this.speak("计划已锁定。准备进入深度专注流。我们将执行 25 分钟的高响应周期。");
        this.switchStage('timer');
    },

    // --- Stage 3: The Flow ---
    startFlowSession() {
        this.renderSubtasks();
        this.elements.currentFocusTask.innerText = `正在处理：${this.state.mainTask}`;
        this.state.flowTimeRemaining = 1500; // 25 min

        const totalTime = 1500;
        const dashArray = 283;

        this.state.timerInterval = setInterval(() => {
            this.state.flowTimeRemaining--;

            // Update Text
            const mins = Math.floor(this.state.flowTimeRemaining / 60);
            const secs = this.state.flowTimeRemaining % 60;
            this.elements.flowTimerText.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;

            // Update Circle
            const progress = 1 - (this.state.flowTimeRemaining / totalTime);
            const offset = dashArray * progress;
            this.elements.timerCircle.style.strokeDashoffset = offset;

            // Periodic motivation (every 5 mins)
            if (this.state.flowTimeRemaining > 0 && this.state.flowTimeRemaining % 300 === 0) {
                this.speak("你做得很好，继续保持关注。如果大脑开始游离，请将杂念记录到捕获框中。");
            }

            if (this.state.flowTimeRemaining <= 0) {
                clearInterval(this.state.timerInterval);
                if (window.NeuroTracker) window.NeuroTracker.recordFocus(25);
                this.switchStage('reward');
            }
        }, 1000);
    },

    renderSubtasks() {
        this.elements.activeSubtasks.innerHTML = '';
        this.state.subtasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `subtask-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span>${task.text}</span>
            `;
            li.querySelector('input').addEventListener('change', () => {
                this.state.subtasks[index].completed = true; // Simulating atomic completion
                this.renderSubtasks();
                this.playChime();
                this.speak("太棒了，小的进步也是进步。");
            });
            this.elements.activeSubtasks.appendChild(li);
        });
    },

    catchDistraction() {
        const input = document.getElementById('distractionInput');
        if (!input.value) return;

        this.state.distractions.push(input.value);
        const li = document.createElement('li');
        li.innerText = input.value;
        this.elements.distractionList.prepend(li);

        input.value = '';
        this.speak("已捕获。它不会再占用你的记忆带宽。");
    },

    // --- Stage 4: Reward ---
    showReward() {
        this.playChime();
        this.speak("祝贺你。这个专注周期已完美结束。多巴胺正在基准线重置。建议进行 5 分钟的休息。");
    }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
