/**
 * ChronoView - ADHD Time & Task Visualizer
 * Core Logic: Barkley (Externalization) & Huberman (Ultradian/Visual Focus)
 */

const chronoApp = {
    // State
    state: {
        tasks: [],
        activeTaskId: null,
        isRunning: false,
        timeRemaining: 0,
        totalSessionTime: 0,
        stability: 100,
        isAudioEnabled: true,
        timerInterval: null
    },

    // UI Elements
    elements: {
        taskList: document.getElementById('taskList'),
        taskName: document.getElementById('taskName'),
        taskDuration: document.getElementById('taskDuration'),
        addTaskBtn: document.getElementById('addTaskBtn'),
        startSessionBtn: document.getElementById('startSessionBtn'),
        timerDisplay: document.getElementById('timerDisplay'),
        activeTaskLabel: document.getElementById('activeTaskLabel'),
        liquidRemaining: document.getElementById('liquidRemaining'),
        liquidConsumed: document.getElementById('liquidConsumed'),
        stabilityFill: document.getElementById('stabilityFill'),
        stabilityVal: document.getElementById('stabilityVal'),
        distractionInput: document.getElementById('distractionInput'),
        distractionLog: document.getElementById('distractionLog'),
        modal: document.getElementById('completionModal')
    },

    init() {
        console.log("ChronoView Logic Engine Engaged.");
        this.setupEventListeners();
        this.setupAudio();
        this.startFluidBackground();
    },

    setupEventListeners() {
        this.elements.addTaskBtn.addEventListener('click', () => this.addTask());
        this.elements.startSessionBtn.addEventListener('click', () => this.toggleSession());
        this.elements.distractionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.catchDistraction();
        });

        // Handle select task
        this.elements.taskList.addEventListener('click', (e) => {
            const item = e.target.closest('.task-item');
            if (item) this.selectTask(item.dataset.id);
        });
    },

    // --- Audio Synthesis (Magnetic Male) ---
    setupAudio() {
        this.voice = null;
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            this.voice = voices.find(v => (v.lang.includes('zh') || v.lang.includes('CN')) &&
                (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('yunxi') || v.name.toLowerCase().includes('kangkang')));
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    },

    speak(text) {
        if (!this.state.isAudioEnabled) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        if (this.voice) utter.voice = this.voice;
        utter.lang = 'zh-CN';
        utter.rate = 0.85;
        utter.pitch = 0.8;
        window.speechSynthesis.speak(utter);
    },

    // --- Task Management ---
    addTask() {
        const name = this.elements.taskName.value.trim();
        const duration = parseInt(this.elements.taskDuration.value);
        if (!name) return;

        const task = {
            id: Date.now().toString(),
            name,
            duration: duration * 60, // to seconds
            completed: false
        };

        this.state.tasks.push(task);
        this.renderTasks();
        this.elements.taskName.value = '';
        this.speak(`已添加任务：${name}。预计消耗时间 ${duration} 分钟。`);
    },

    renderTasks() {
        this.elements.taskList.innerHTML = '';
        this.state.tasks.forEach(t => {
            const div = document.createElement('div');
            div.className = `task-item ${this.state.activeTaskId === t.id ? 'active' : ''}`;
            div.dataset.id = t.id;
            div.innerHTML = `
                <div class="task-info">
                    <h4>${t.name}</h4>
                    <span>${Math.floor(t.duration / 60)}m</span>
                </div>
                <div class="task-status">${t.completed ? '✅' : '⏳'}</div>
            `;
            this.elements.taskList.appendChild(div);
        });
    },

    selectTask(id) {
        if (this.state.isRunning) return;
        this.state.activeTaskId = id;
        const task = this.state.tasks.find(t => t.id === id);
        this.state.timeRemaining = task.duration;
        this.state.totalSessionTime = task.duration;
        this.elements.activeTaskLabel.innerText = `当前聚焦：${task.name}`;
        this.updateTimerDisplay();
        this.renderTasks();
        this.speak(`已选中任务：${task.name}。准备好进入时间流了吗？`);

        // Reset Visualizer
        this.elements.liquidRemaining.style.height = '100%';
        this.elements.liquidConsumed.style.height = '0%';
    },

    // --- Session Control ---
    toggleSession() {
        if (!this.state.activeTaskId) {
            this.speak("请先选择一个任务，让时间外置化。");
            return;
        }

        if (this.state.isRunning) {
            this.stopSession();
        } else {
            this.startSession();
        }
    },

    startSession() {
        this.state.isRunning = true;
        this.elements.startSessionBtn.innerText = "暂停时间流";
        this.elements.startSessionBtn.style.background = "rgba(255, 255, 255, 0.1)";

        this.speak("时间流已启动。视线收窄，锁定目标。");

        this.state.timerInterval = setInterval(() => {
            this.state.timeRemaining--;
            this.updateTimerDisplay();
            this.updateVisualizer();
            this.updateStability();

            if (this.state.timeRemaining <= 0) {
                this.completeSession();
            }
        }, 1000);
    },

    stopSession() {
        this.state.isRunning = false;
        clearInterval(this.state.timerInterval);
        this.elements.startSessionBtn.innerText = "继续时间流";
        this.elements.startSessionBtn.style.background = "var(--accent-blue)";
        this.speak("时间流已暂停。深呼吸，找回节奏。");
    },

    completeSession() {
        clearInterval(this.state.timerInterval);
        this.state.isRunning = false;
        const task = this.state.tasks.find(t => t.id === this.state.activeTaskId);
        task.completed = true;
        this.renderTasks();

        this.elements.modal.style.display = 'flex';
        this.speak("太棒了。你成功捕获了这段时间。多巴胺正在重置。");
    },

    closeModal() {
        this.elements.modal.style.display = 'none';
        this.state.activeTaskId = null;
        this.elements.activeTaskLabel.innerText = "等待任务选择...";
    },

    // --- Visualization ---
    updateTimerDisplay() {
        const h = Math.floor(this.state.timeRemaining / 3600);
        const m = Math.floor((this.state.timeRemaining % 3600) / 60);
        const s = this.state.timeRemaining % 60;
        this.elements.timerDisplay.innerText =
            `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    updateVisualizer() {
        const progress = 1 - (this.state.timeRemaining / this.state.totalSessionTime);
        this.elements.liquidRemaining.style.height = ((1 - progress) * 100) + '%';
        this.elements.liquidConsumed.style.height = (progress * 100) + '%';
    },

    updateStability() {
        // Simple stability logic: decreases slowly, recovers if no distractions added
        if (Math.random() > 0.99) {
            this.state.stability = Math.max(70, this.state.stability - 5);
        } else {
            this.state.stability = Math.min(100, this.state.stability + 0.1);
        }

        this.elements.stabilityFill.style.width = this.state.stability + '%';
        this.elements.stabilityVal.innerText = Math.round(this.state.stability) + '%';

        if (this.state.stability < 80) {
            this.elements.stabilityFill.style.background = "var(--accent-gold)";
        } else {
            this.elements.stabilityFill.style.background = "var(--accent-green)";
        }
    },

    catchDistraction() {
        const val = this.elements.distractionInput.value.trim();
        if (!val) return;

        const li = document.createElement('li');
        li.innerText = `• ${val}`;
        this.elements.distractionLog.prepend(li);
        this.elements.distractionInput.value = '';

        this.state.stability = Math.max(50, this.state.stability - 15);
        this.speak("已捕获乱序想法。专注于当下。");
    },

    // --- Aesthetics: Fluid Background ---
    startFluidBackground() {
        const canvas = document.getElementById('fluidCanvas');
        const ctx = canvas.getContext('2d');
        let w, h;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        let particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                r: Math.random() * 2 + 1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(0, 209, 255, 0.2)';
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        animate();
    }
};

window.addEventListener('DOMContentLoaded', () => chronoApp.init());
