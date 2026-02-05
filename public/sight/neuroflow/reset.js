/**
 * NeuroReset - Logic Engine
 * Integrated Barkley & Huberman Protocols
 */

const resetApp = {
    state: {
        currentPhase: 'entry',
        breathesLeft: 3,
        particlesCount: 0,
        checksDone: 0,
        primeProgress: 0,
        isAudioEnabled: true
    },

    elements: {
        phases: document.querySelectorAll('.phase'),
        breathCircle: document.getElementById('breathCircle'),
        breathText: document.getElementById('breathText'),
        breathCounter: document.getElementById('breathCounter'),
        dumpInput: document.getElementById('dumpInput'),
        particleView: document.getElementById('particleView'),
        btnFinishDump: document.getElementById('btnFinishDump'),
        btnShieldNext: document.getElementById('btnShieldNext'),
        primeBall: document.getElementById('primeBall'),
        primeProgress: document.getElementById('primeProgress')
    },

    init() {
        console.log("NeuroReset Engine Primed.");
        this.setupAudio();
        this.setupDumpInput();
    },

    setupAudio() {
        // Find a magnetic male voice
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

    startProtocol() {
        this.nextPhase();
        this.speak("正在启动重启协议。首先，我们要制动你的神经系统。");
    },

    nextPhase() {
        const phases = ['entry', 'brake', 'dump', 'shield', 'prime', 'result'];
        const currentIndex = phases.indexOf(this.state.currentPhase);
        const nextPhase = phases[currentIndex + 1];

        this.elements.phases.forEach(p => p.classList.remove('active'));
        document.getElementById(`phase-${nextPhase}`).classList.add('active');
        this.state.currentPhase = nextPhase;

        this.onPhaseChange(nextPhase);
    },

    onPhaseChange(phase) {
        switch (phase) {
            case 'brake': this.runBrakePhase(); break;
            case 'dump': this.runDumpPhase(); break;
            case 'shield': this.runShieldPhase(); break;
            case 'prime': this.runPrimePhase(); break;
        }
    },

    // --- Phase 1: Physiological Sigh ---
    runBrakePhase() {
        const cycle = async () => {
            if (this.state.breathesLeft <= 0) {
                this.speak("神经制动完成。现在，我们要接管你的工作记忆。");
                setTimeout(() => this.nextPhase(), 1500);
                return;
            }

            // Inhale 1
            this.speak("吸气。");
            this.elements.breathText.innerText = "吸气...";
            this.elements.breathCircle.style.transform = "scale(2.5)";
            await this.wait(2000);

            // Quick Inhale 2
            this.speak("再吸一次。");
            this.elements.breathText.innerText = "再次吸气！";
            this.elements.breathCircle.style.transform = "scale(3)";
            await this.wait(1000);

            // Long Exhale
            this.speak("深深呼气。");
            this.elements.breathText.innerText = "呼气...";
            this.elements.breathCircle.style.transform = "scale(1)";
            await this.wait(4000);

            this.state.breathesLeft--;
            this.elements.breathCounter.innerText = `${this.state.breathesLeft} / 3`;
            cycle();
        };
        cycle();
    },

    // --- Phase 2: Barkley Dump ---
    runDumpPhase() {
        this.speak("请把你大脑中所有吵闹的想法、担心的任务都写下来。每写下一个，压力就会减轻一分。");
    },

    setupDumpInput() {
        this.elements.dumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.elements.dumpInput.value.trim()) {
                this.createParticle(this.elements.dumpInput.value);
                this.elements.dumpInput.value = '';
                this.state.particlesCount++;
                if (this.state.particlesCount >= 3) {
                    this.elements.btnFinishDump.style.display = 'block';
                }
            }
        });
    },

    createParticle(text) {
        const p = document.createElement('div');
        p.className = 'dump-particle';
        p.innerText = text;
        p.style.left = Math.random() * 60 + 20 + '%';
        p.style.top = '100%';
        this.elements.particleView.appendChild(p);
        setTimeout(() => p.remove(), 5000);
    },

    // --- Phase 3: Environment ---
    runShieldPhase() {
        this.speak("非常好。现在，让我们物理性地外置你的意志力。请完成这些环境设置。");
    },

    toggleCheck(el) {
        el.classList.toggle('checked');
        const allChecked = document.querySelectorAll('.check-item.checked').length;
        if (allChecked >= 3) {
            this.elements.btnShieldNext.disabled = false;
        }
    },

    // --- Phase 4: Huberman Visual Prime ---
    runPrimePhase() {
        this.speak("最后一步：物理性激活你的前额叶。跟随这个光点。");
        let start = Date.now();
        const duration = 15000; // 15s

        const animate = () => {
            const now = Date.now();
            const elapsed = now - start;
            const progress = elapsed / duration;

            if (progress >= 1) {
                this.nextPhase();
                this.speak("协议执行完毕。你现在的状态非常棒。");
                return;
            }

            // Ball Movement Logic (Infinity loop)
            const t = elapsed / 1000;
            const x = 250 + Math.cos(t) * 200;
            const y = 150 + Math.sin(t * 2) * 100;

            this.elements.primeBall.style.left = x + 'px';
            this.elements.primeBall.style.top = y + 'px';
            this.elements.primeProgress.style.width = (progress * 100) + '%';

            requestAnimationFrame(animate);
        };
        animate();
    },

    wait(ms) { return new Promise(res => setTimeout(res, ms)); }
};

window.addEventListener('DOMContentLoaded', () => resetApp.init());
