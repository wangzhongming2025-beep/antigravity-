// ====== 0. Global State & Infrastructure ======
const state = {
    currentView: 'dashboard',
    speechEnabled: 'speechSynthesis' in window
};

// All Game States
let schulteState = { isPlaying: false, expectedNumber: 1, size: 5, timerInterval: null, startTime: 0, themeData: [] };
let trackerState = { isPlaying: false, score: 0, level: 1, balls: [], targetIndices: [], numBalls: 5, numTargets: 2, phase: 'idle', animationId: null, selectedFound: 0 };
let visSpeedState = { isPlaying: false, score: 0, timeLeft: 60, timer: null, currentTarget: '', currentGroup: [] };
let visCancelState = { isPlaying: false, score: 0, timeLeft: 45, timer: null, currentTargetChar: '' };
let decodingState = { isPlaying: false, score: 0, timeLeft: 60, timer: null, legend: {}, currentAns: 0 };
let decodingConnState = { isPlaying: false, score: 0, timeLeft: 60, timer: null, legend: {}, targetSeq: [], currentIndex: 0, letters: ['A','B','C','D','E','F','G','H','K'] };
let spaceDecodingState = { isPlaying: false, score: 0, timeLeft: 120, timer: null, targetSeq: [], currentIndex: 0 };
let visDiscrimState = { isPlaying: false, score: 0, timeLeft: 45, timer: null, targetGaps: [] };
let videoState = { isPlaying: false, shapes: [], answer: 0 };
let stroopState = { isPlaying: false, score: 0, timeLeft: 30, timer: null, currentCorrect: '' };
let visAntiInterState = { isPlaying: false, score: 0, timer: null, timeLeft: 60, targets: ['0', '9', '3'], totalTargets: 0, foundCount: 0 };

let memReverseState = { isPlaying: false, currentWord: '' };
let audReactState = { isPlaying: false, score: 0, targetColor: '', startTime: 0 };
let audSpanState = { isPlaying: false, currentLevel: 3, sequence: [], userIdx: 0 };
let audInterState = { isPlaying: false, answer: '' };
let houseSearchState = { isPlaying: false, found: 0, target: 0, timeLeft: 60, timer: null };
let memRepeatState = { isPlaying: false, currentSentence: '' };
let trackMazeState = { isPlaying: false, matches: 0, total: 5, paths: [], selectedSource: null };
let symbolDecodeState = { isPlaying: false, score: 0, timeLeft: 60, timer: null, currentIdx: 0, set: null };
let patternSearchState = { isPlaying: false, level: 1, found: 0, targetSeq: [], total: 3 };

const THEMES = {
    animal: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐙', '🦖'],
    fruit: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🌽', '🥕', '🥔', '🍠', '🍄', '🧅', '🧄', '🥐', '🥯', '🥞'],
    space: ['🚀', '🛸', '🪐', '🌟', '🌙', '☀️', '🌍', '☄️', '🛰️', '🧑‍🚀', '👽', '🔭', '🌌', '🌠', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌎', '🌏', '🌀', '🔆', '📡', '👾', '☄', '🌟']
};

const SPACE_CONFIG = {
    shapes: ['△', '☆', '○', '□'],
    colors: ['#ffff00', '#ff0000', '#00ff00', '#0000ff', '#ffa500', '#00ffff', '#800080', '#00008b'],
    mapping: [
        ['0', '2', '4', '6', '8', '10', '12', '14'],
        ['B', 'D', 'P', 'Q', 'F', 'T', 'M', 'N'],
        ['1', '3', '5', '7', '9', '11', '13', '15'],
        ['b', 'd', 'p', 'q', 'f', 't', 'm', 'n']
    ]
};

const SENTENCES = [
    "小猫在阳光下的草地上快乐地打滚。",
    "我们要保持诚实守信的优良品质。",
    "早睡早起能够让我们每天都充满活力。",
    "阅读一本好书能带我们去远方旅行。",
    "失败并不可怕，它是通往成功的阶梯。"
];

// Speech Utility
const Speech = {
    speak: (text, onEnd = null) => {
        if(!state.speechEnabled) { console.warn("Speech not supported"); return; }
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'zh-CN'; 
        utter.rate = 0.9;
        utter.pitch = 1.0;
        
        // Add visual feedback
        document.body.classList.add('speaking');
        
        utter.onend = () => {
            document.body.classList.remove('speaking');
            if(onEnd) onEnd();
        };
        utter.onerror = (e) => {
            console.error("Speech error", e);
            document.body.classList.remove('speaking');
        };
        
        window.speechSynthesis.speak(utter);
    },
    // Warm up the speech engine
    warmUp: () => {
        if(!state.speechEnabled) return;
        const utter = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(utter);
    }
};

// ====== 1. STT (Speech To Text) Utility ======
const STT = {
    recognition: null,
    isListening: false,
    init: function() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { console.warn("STT not supported"); return; }
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'zh-CN';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
    },
    start: function(targetId) {
        if (!this.recognition) this.init();
        if (!this.recognition || this.isListening) return;
        const target = document.getElementById(targetId);
        if (!target) return;
        const oldPlaceholder = target.placeholder;
        target.placeholder = "正在录音，请说话...";
        this.isListening = true;
        this.recognition.start();
        this.recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
                target.value = transcript;
            }
        };
        this.recognition.onend = () => {
            this.isListening = false;
            target.placeholder = oldPlaceholder;
        };
        this.recognition.onerror = () => {
            this.isListening = false;
            target.placeholder = "录音失败，请重试";
            setTimeout(() => target.placeholder = oldPlaceholder, 2000);
        };
    }
};

// ====== 2. Score & Assessment Manager ======
const ScoreManager = {
    saveResult: function(module, score) {
        let history = JSON.parse(localStorage.getItem('training_history') || '{}');
        if (!history[module] || score > history[module]) {
            history[module] = score;
            localStorage.setItem('training_history', JSON.stringify(history));
        }
    },
    getBest: function(module) {
        let history = JSON.parse(localStorage.getItem('training_history') || '{}');
        return history[module] || 0;
    }
};

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('view-title');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetView = link.getAttribute('data-view');
            if(!targetView || state.currentView === targetView) return;
            navLinks.forEach(l => l.classList.remove('active')); link.classList.add('active');
            views.forEach(v => v.classList.remove('active-view'));
            const targetEl = document.getElementById(targetView); if(targetEl) targetEl.classList.add('active-view');
            const titleSpan = link.querySelector('span:last-child'); if(titleSpan) viewTitle.textContent = titleSpan.textContent;
            state.currentView = targetView; stopAllActivities(); initView(targetView);
            
            // Close mobile menu
            const sidebar = document.querySelector('.sidebar');
            if(sidebar) {
                sidebar.classList.remove('mobile-active');
            }
        });
    });

    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if(mobileBtn) {
        mobileBtn.onclick = (e) => {
            e.stopPropagation();
            const sidebar = document.querySelector('.sidebar');
            if(sidebar) sidebar.classList.toggle('mobile-active');
        };
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.sidebar');
        if(sidebar && sidebar.classList.contains('mobile-active') && !sidebar.contains(e.target)) {
            sidebar.classList.remove('mobile-active');
        }
    });
}

function initView(viewId) {
    switch(viewId) {
        case 'dashboard': updateDashboard(); break;
        case 'schulte': if(!schulteState.isPlaying) generateSchulteGrid(); break;
        case 'tracker': if(!trackerState.isPlaying) { resizeCanvas(); initTrackerGame(false); } break;
        case 'vis-speed': initVisSpeed(); break;
        case 'vis-cancel': initVisCancel(); break;
        case 'decoding': initDecoding(); break;
        case 'decoding-conn': initDecodingConn(); break;
        case 'space-decoding': initSpaceDecoding(); break;
        case 'vis-discrim': initVisDiscrim(); break;
        case 'vis-video': initVisVideo(); break;
        case 'aud-react': initAudReact(); break;
        case 'aud-inter': initAudInter(); break;
        case 'aud-span': initAudSpan(); break;
        case 'mem-repeat': initMemRepeat(); break;
        case 'mem-reverse': initMemReverse(); break;
        case 'stroop': initStroop(); break;
        case 'breathing': initBreathing(); break;
        case 'house-search': initHouseSearch(); break;
        case 'vis-anti-inter': initVisAntiInter(); break;
        case 'track-maze': initTrackMaze(); break;
        case 'symbol-decode': initSymbolDecode(); break;
        case 'pattern-search': initPatternSearch(); break;
        case 'assessment-wechsler': initAssessmentWechsler(); break;
    }
}

function stopAllActivities() {
    if(schulteState.isPlaying) endSchulteGame(false);
    if(trackerState.isPlaying) { trackerState.isPlaying = false; cancelAnimationFrame(trackerState.animationId); }
    if(visSpeedState.isPlaying) { clearInterval(visSpeedState.timer); visSpeedState.isPlaying = false; }
    if(stroopState.isPlaying) { clearInterval(stroopState.timer); stroopState.isPlaying = false; }
    if(decodingState.isPlaying) { clearInterval(decodingState.timer); decodingState.isPlaying = false; }
    if(decodingConnState.isPlaying) { clearInterval(decodingConnState.timer); decodingConnState.isPlaying = false; }
    if(spaceDecodingState.isPlaying) endSpaceDecoding(false);
    if(visDiscrimState.isPlaying) { visDiscrimState.isPlaying = false; }
    if(videoState.isPlaying) videoState.isPlaying = false;
    if(audReactState.isPlaying) audReactState.isPlaying = false;
    if(audInterState.isPlaying) initAudInter(); // Reset auditory interference
    if(audSpanState.isPlaying) audSpanState.isPlaying = false;
    if(memRepeatState.isPlaying) memRepeatState.isPlaying = false;
    if(memReverseState.isPlaying) initMemReverse(); // Reset memory reverse
    if(breathingInterval) stopBreathing(); // Stop breathing exercise
    if(houseSearchState.isPlaying) { clearInterval(houseSearchState.timer); houseSearchState.isPlaying = false; } // Stop house search
    if(trackMazeState.isPlaying) trackMazeState.isPlaying = false;
    if(symbolDecodeState.isPlaying) { clearInterval(symbolDecodeState.timer); symbolDecodeState.isPlaying = false; }
    if(patternSearchState.isPlaying) patternSearchState.isPlaying = false;
    if(state.speechEnabled) window.speechSynthesis.cancel();
}

function updateDashboard() {
    const schulteBest = localStorage.getItem('focus_schulte_best_5') || '--:--';
    const dsSchulte = document.getElementById('ds-schulte-best'); if(dsSchulte) dsSchulte.textContent = schulteBest;
    const trackerV = localStorage.getItem('focus_tracker_lvl') || '1';
    const dsTracker = document.getElementById('ds-tracker-best'); if(dsTracker) dsTracker.textContent = `Lv ${trackerV}`;
}

// ====== 1. Schulte Grid ======
function renderCircularSchulte(container, theme) {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("viewBox", "0 0 500 500");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.maxWidth = "500px";
    svg.style.display = "block";
    svg.style.margin = "0 auto";
    
    container.appendChild(svg);
    
    let items = Array.from({length: 30}, (_, i) => i + 1);
    if (theme !== 'number') {
        const icons = [...THEMES[theme]].sort(() => 0.5 - Math.random());
        schulteState.themeData = items.map(i => icons[i-1]);
    } else { schulteState.themeData = items; }
    
    let displayItems = items.map(i => ({ val: i, display: schulteState.themeData[i-1] })).sort(() => Math.random() - 0.5);
    
    const xc = 250, yc = 250;
    const r0 = 0, r1 = 80, r2 = 160, r3 = 240;
    const innerSectors = 6, middleSectors = 10, outerSectors = 14;
    const innerOffset = 0, middleOffset = 0.25, outerOffset = 0.45;
    let itemIndex = 0;
    
    function getSectorPath(x_c, y_c, r_in, r_out, startAngle, endAngle) {
        const x_in_start = x_c + r_in * Math.cos(startAngle);
        const y_in_start = y_c + r_in * Math.sin(startAngle);
        const x_in_end = x_c + r_in * Math.cos(endAngle);
        const y_in_end = y_c + r_in * Math.sin(endAngle);
        const x_out_start = x_c + r_out * Math.cos(startAngle);
        const y_out_start = y_c + r_out * Math.sin(startAngle);
        const x_out_end = x_c + r_out * Math.cos(endAngle);
        const y_out_end = y_c + r_out * Math.sin(endAngle);
        
        if (r_in === 0) {
            return `M ${x_c} ${y_c} L ${x_out_start} ${y_out_start} A ${r_out} ${r_out} 0 0 1 ${x_out_end} ${y_out_end} Z`;
        } else {
            return `M ${x_in_start} ${y_in_start} L ${x_out_start} ${y_out_start} A ${r_out} ${r_out} 0 0 1 ${x_out_end} ${y_out_end} L ${x_in_end} ${y_in_end} A ${r_in} ${r_in} 0 0 0 ${x_in_start} ${y_in_start} Z`;
        }
    }
    
    function drawZone(numSectors, r_in, r_out, angleOffset) {
        const angleStep = (2 * Math.PI) / numSectors;
        for (let i = 0; i < numSectors; i++) {
            const startAngle = angleOffset + i * angleStep;
            const endAngle = angleOffset + (i + 1) * angleStep;
            const midAngle = (startAngle + endAngle) / 2;
            const r_mid = r_in === 0 ? r_out * 0.55 : (r_in + r_out) / 2;
            const x_text = xc + r_mid * Math.cos(midAngle);
            const y_text = yc + r_mid * Math.sin(midAngle);
            
            const item = displayItems[itemIndex++];
            if (!item) break;
            
            const g = document.createElementNS(svgNamespace, "g");
            g.setAttribute("class", "grid-cell circular-cell");
            g.setAttribute("style", "cursor: pointer;");
            
            const path = document.createElementNS(svgNamespace, "path");
            path.setAttribute("d", getSectorPath(xc, yc, r_in, r_out, startAngle, endAngle));
            path.setAttribute("fill", "rgba(255, 255, 255, 0.02)");
            path.setAttribute("stroke", "rgba(255, 255, 255, 0.12)");
            path.setAttribute("stroke-width", "1.5");
            g.appendChild(path);
            
            const text = document.createElementNS(svgNamespace, "text");
            text.setAttribute("x", x_text);
            text.setAttribute("y", y_text);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "central");
            
            const fontSize = r_in === 0 ? "2.2rem" : (r_in === 80 ? "1.8rem" : "1.5rem");
            text.setAttribute("font-size", fontSize);
            text.setAttribute("font-weight", "bold");
            
            if (item.val === 1 || item.val === 30) {
                text.setAttribute("fill", "#ff4d4d");
            } else {
                text.setAttribute("fill", "#fff");
            }
            text.textContent = item.display;
            g.appendChild(text);
            
            g.addEventListener("mousedown", (e) => {
                e.preventDefault();
                handleCellClick(g, item.val);
            });
            
            svg.appendChild(g);
        }
    }
    
    drawZone(innerSectors, r0, r1, innerOffset);
    drawZone(middleSectors, r1, r2, middleOffset);
    drawZone(outerSectors, r2, r3, outerOffset);
    
    const borderCircle = document.createElementNS(svgNamespace, "circle");
    borderCircle.setAttribute("cx", xc);
    borderCircle.setAttribute("cy", yc);
    borderCircle.setAttribute("r", r3);
    borderCircle.setAttribute("fill", "none");
    borderCircle.setAttribute("stroke", "rgba(255, 255, 255, 0.2)");
    borderCircle.setAttribute("stroke-width", "2");
    svg.appendChild(borderCircle);
}

function generateSchulteGrid() {
    const sGrid = document.getElementById('schulte-grid'); if(!sGrid) return;
    sGrid.innerHTML = ''; const size = schulteState.size; const theme = document.getElementById('schulte-theme').value;
    
    if (size === 'circular') {
        sGrid.style.display = 'block';
        sGrid.style.gridTemplateColumns = 'none';
        sGrid.classList.remove('grid');
        renderCircularSchulte(sGrid, theme);
        return;
    }
    
    sGrid.style.display = 'grid';
    sGrid.classList.add('grid');
    sGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    let items = Array.from({length: size*size}, (_, i) => i + 1);
    if (theme !== 'number') {
        const icons = [...THEMES[theme]].sort(() => 0.5 - Math.random());
        schulteState.themeData = items.map(i => icons[i-1]);
    } else { schulteState.themeData = items; }
    let displayItems = items.map(i => ({ val: i, display: schulteState.themeData[i-1] })).sort(() => Math.random() - 0.5);
    displayItems.forEach(item => {
        const cell = document.createElement('div'); cell.className = 'grid-cell'; cell.textContent = item.display;
        cell.addEventListener('mousedown', () => handleCellClick(cell, item.val)); sGrid.appendChild(cell);
    });
}

function handleCellClick(cell, val) {
    if (!schulteState.isPlaying) return;
    const maxVal = (schulteState.size === 'circular') ? 30 : (schulteState.size * schulteState.size);
    if (val === schulteState.expectedNumber) {
        cell.classList.add('active-hit');
        if (++schulteState.expectedNumber > maxVal) endSchulteGame(true);
        else document.getElementById('schulte-next').textContent = schulteState.themeData[schulteState.expectedNumber-1];
    } else {
        cell.classList.add('error-hit'); schulteState.startTime -= 1000; setTimeout(() => cell.classList.remove('error-hit'), 300);
    }
}

function startSchulteGame() {
    schulteState.isPlaying = true; schulteState.expectedNumber = 1; generateSchulteGrid();
    document.getElementById('schulte-next').textContent = schulteState.themeData[0];
    const btn = document.getElementById('schulte-start'); btn.textContent = '放弃挑战'; btn.classList.replace('primary', 'danger');
    schulteState.startTime = Date.now();
    schulteState.timerInterval = setInterval(() => {
        const timeEl = document.getElementById('schulte-timer'); if(timeEl) timeEl.textContent = ((Date.now() - schulteState.startTime) / 1000).toFixed(2);
    }, 40);
}

function endSchulteGame(completed) {
    schulteState.isPlaying = false; clearInterval(schulteState.timerInterval);
    const btn = document.getElementById('schulte-start'); if(btn) { btn.textContent = '开始挑战'; btn.classList.replace('danger', 'primary'); }
    if(completed) {
        const final = parseFloat(document.getElementById('schulte-timer').textContent);
        const key = `focus_schulte_best_${schulteState.size}`;
        if(final < (parseFloat(localStorage.getItem(key)) || Infinity)) localStorage.setItem(key, final);
        alert(`完成！用时：${final} 秒`); updateDashboard();
    }
}

// ====== 2. Tracker ======
class Ball {
    constructor(x, y, vx, vy, radius) { Object.assign(this, {x,y,vx,vy,radius,isTarget:false,isSelected:false,isCorrect:false,color:'#444'}); }
    update(w, h) {
        if (trackerState.phase === 'move') {
            this.x += this.vx; this.y += this.vy;
            if (this.x-this.radius <= 0 || this.x+this.radius >= w) this.vx *= -1;
            if (this.y-this.radius <= 0 || this.y+this.radius >= h) this.vy *= -1;
        }
    }
    draw(ctx, p) {
        ctx.save(); ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        let baseColor = this.color;
        if(p === 'memorize' && this.isTarget) {
            baseColor = '#00d2ff'; ctx.shadowBlur = 30; ctx.shadowColor = '#00d2ff';
        } else if(p === 'select' && this.isSelected) {
            baseColor = this.isCorrect ? '#00ff88' : '#ff4d4d'; ctx.shadowBlur = 25; ctx.shadowColor = baseColor;
        } else {
            baseColor = '#777'; ctx.shadowBlur = 5; ctx.shadowColor = 'rgba(255,255,255,0.2)';
        }
        ctx.fillStyle = baseColor; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    }
    isClicked(mx, my) { return (this.x-mx)**2 + (this.y-my)**2 <= (this.radius*1.5)**2; }
}
function initTrackerGame(start = true) {
    const tCanvas = document.getElementById('tracker-canvas'); if(!tCanvas) return;
    resizeCanvas(); const w = tCanvas.width || 800, h = tCanvas.height || 450;
    trackerState.numBalls = 4 + Math.floor(trackerState.level/2); trackerState.numTargets = 1 + Math.ceil(trackerState.level/3);
    trackerState.balls = []; trackerState.targetIndices = []; trackerState.selectedFound = 0;
    for(let i=0; i<trackerState.numBalls; i++) {
        let r=25, x=r+Math.random()*(w-r*2), y=r+Math.random()*(h-r*2), a=Math.random()*Math.PI*2, s=2+trackerState.level*0.4;
        trackerState.balls.push(new Ball(x, y, Math.cos(a)*s, Math.sin(a)*s, r));
    }
    while(trackerState.targetIndices.length < trackerState.numTargets) {
        let r = Math.floor(Math.random()*trackerState.numBalls);
        if(!trackerState.targetIndices.includes(r)) { trackerState.targetIndices.push(r); trackerState.balls[r].isTarget=true; }
    }
    if(!start) { trackerState.phase = 'idle'; trackerState.isPlaying = false; renderTracker(); return; }
    trackerState.phase = 'memorize'; trackerState.isPlaying = true; document.getElementById('tracker-overlay').classList.add('hidden');
    renderTracker();
    setTimeout(() => {
        if(!trackerState.isPlaying) return; trackerState.phase = 'move';
        setTimeout(() => {
            if(!trackerState.isPlaying) return; trackerState.phase='select';
            document.getElementById('tracker-overlay-title').textContent = '请指出目标';
            document.getElementById('tracker-overlay-desc').textContent = `找到刚才闪烁的 ${trackerState.numTargets} 个球。`;
            document.getElementById('tracker-overlay').classList.remove('hidden'); document.getElementById('tracker-start').style.display='none';
        }, 6000);
    }, 2500);
}
function renderTracker() {
    const tCanvas = document.getElementById('tracker-canvas'); if(!tCanvas) return;
    const tCtx = tCanvas.getContext('2d'); tCtx.clearRect(0,0,tCanvas.width,tCanvas.height);
    trackerState.balls.forEach(b => { b.update(tCanvas.width,tCanvas.height); b.draw(tCtx, trackerState.phase); });
    if(trackerState.isPlaying || trackerState.phase === 'idle') trackerState.animationId = requestAnimationFrame(renderTracker);
}

// ====== 3. Space Decoding [Optimized for Image 3] ======
function initSpaceDecoding() {
    spaceDecodingState.isPlaying = false; 
    document.getElementById('space-decoding-timer').textContent = '120';
    const legEl = document.getElementById('space-legend');
    if(legEl) {
        let html = '<table style="width:100%; border-collapse:collapse; text-align:center; table-layout:fixed; color:#fff; border:2px solid #fff;"><tr><td style="border:1px solid #fff; background:rgba(0,0,0,0.3); width:12.5%;"></td>';
        SPACE_CONFIG.colors.forEach(c => html += `<td style="border:1px solid #fff; background:${c}; height:35px;"></td>`);
        html += '</tr>';
        
        // 4 Rows based on Image 3
        const rowHeaders = SPACE_CONFIG.shapes;
        rowHeaders.forEach((s, ri) => {
            html += `<tr><td style="border:1px solid #fff; font-size:1.8rem; padding:10px; background:rgba(255,255,255,0.05);">${s}</td>`;
            SPACE_CONFIG.mapping[ri].forEach(v => html += `<td style="border:1px solid #fff; padding:10px; font-weight:bold; font-size:1.4rem;">${v}</td>`);
            html += '</tr>';
        });
        html += '</table>';
        legEl.innerHTML = html;
        legEl.style.display = 'block';
    }
    
    const workArea = document.getElementById('space-work-area');
    if(workArea) workArea.innerHTML = '<div style="text-align: center; font-size: 1.5rem; padding: 2rem;">准备好了吗？点击开始</div>';
}

function startSpaceDecoding() {
    spaceDecodingState.isPlaying = true; spaceDecodingState.score = 0; spaceDecodingState.timeLeft = 120;
    const workArea = document.getElementById('space-work-area');
    if(!workArea) return;
    workArea.innerHTML = '';
    
    // Generate 10 rows like Image 3
    for(let r=0; r<10; r++) {
        const row = document.createElement('div');
        row.className = 'space-row';
        const targetSeq = Array.from({length: 6}, () => {
            const ri = Math.floor(Math.random()*4), ci = Math.floor(Math.random()*8);
            return { ri, ci, char: SPACE_CONFIG.mapping[ri][ci] };
        });
        
        let seqHtml = '<div class="space-row-seq">';
        targetSeq.forEach(item => {
            seqHtml += `<span style="color:${SPACE_CONFIG.colors[item.ci]};">${SPACE_CONFIG.shapes[item.ri]}</span>`;
        });
        seqHtml += '</div> <span style="font-size:1.5rem; margin:0 10px;">=</span>';
        
        row.innerHTML = seqHtml;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'space-row-input';
        input.placeholder = '...';
        input.dataset.answer = targetSeq.map(item => item.char).join('');
        
        input.oninput = () => {
            if(!spaceDecodingState.isPlaying) return;
            if(input.value.length >= 6) {
                if(input.value === input.dataset.answer) {
                    input.style.borderColor = 'var(--success)';
                    input.disabled = true;
                    spaceDecodingState.score++;
                } else {
                    input.style.borderColor = 'var(--danger)';
                    setTimeout(() => { input.value = ''; input.style.borderColor = 'var(--primary)'; }, 500);
                }
            }
        };
        row.appendChild(input);
        workArea.appendChild(row);
    }
    
    document.getElementById('space-start').textContent = '放弃挑战';
    spaceDecodingState.timer = setInterval(() => {
        if(--spaceDecodingState.timeLeft <= 0) {
            endSpaceDecoding(true);
        }
        const timerEl = document.getElementById('space-decoding-timer');
        if(timerEl) timerEl.textContent = spaceDecodingState.timeLeft;
    }, 1000);
}

function endSpaceDecoding(completed) {
    spaceDecodingState.isPlaying = false; clearInterval(spaceDecodingState.timer);
    document.getElementById('space-start').textContent = '开始挑战';
    if(completed) {
        alert(`结束！成功完成 ${spaceDecodingState.score} 行序列`);
        ScoreManager.saveResult('space-decoding', spaceDecodingState.score);
    }
}

// ====== 4. Video Discrimination ======
function initVisVideo() {
    videoState.isPlaying = false; document.getElementById('video-overlay').classList.remove('hidden');
    document.getElementById('video-question-box').classList.add('hidden');
    const ctx = document.getElementById('video-canvas').getContext('2d'); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
function startVisVideo() {
    resizeCanvas(); const cvs = document.getElementById('video-canvas'); const ctx = cvs.getContext('2d');
    videoState.isPlaying = true; videoState.shapes = []; document.getElementById('video-overlay').classList.add('hidden');
    const colors = ['red', 'blue', 'green', 'yellow']; const types = ['rect', 'circle']; let redRectCount = 0;
    for(let i=0; i<30; i++) {
        const t = types[Math.floor(Math.random()*2)], c = colors[Math.floor(Math.random()*4)];
        if(t==='rect' && c==='red') redRectCount++;
        videoState.shapes.push({ t, c, x: Math.random()*cvs.width, y: Math.random()*cvs.height, s: 20 + Math.random()*30, startTime: i * 200, duration: 500 });
    }
    videoState.answer = redRectCount; let startTime = performance.now();
    function animate(now) {
        if(!videoState.isPlaying) return; ctx.clearRect(0,0,cvs.width,cvs.height); let elapsed = now - startTime;
        videoState.shapes.forEach(sh => {
            if(elapsed >= sh.startTime && elapsed < sh.startTime + sh.duration) {
                ctx.fillStyle = sh.c; ctx.beginPath();
                if(sh.t==='rect') ctx.fillRect(sh.x, sh.y, sh.s, sh.s); else { ctx.arc(sh.x, sh.y, sh.s/2, 0, Math.PI*2); ctx.fill(); }
            }
        });
        if(elapsed < 7000) requestAnimationFrame(animate); else showVideoQuestion();
    }
    requestAnimationFrame(animate);
}
function showVideoQuestion() {
    videoState.isPlaying = false; document.getElementById('video-question-box').classList.remove('hidden');
    const opts = document.getElementById('video-options'); opts.innerHTML = '';
    const correct = videoState.answer; const choices = [correct, correct + 1, Math.max(0, correct - 1), correct + 2].sort(() => Math.random()-0.5);
    [...new Set(choices)].forEach(c => {
        const btn = document.createElement('button'); btn.className = 'btn glass'; btn.textContent = c;
        btn.onclick = () => { if(c === correct) { alert('太棒了！'); initVisVideo(); } else { alert(`答案是 ${correct}`); initVisVideo(); } };
        opts.appendChild(btn);
    });
}

// ====== 5. Auditory Modules ======
function initAudReact() { audReactState.isPlaying = false; document.querySelector('.aud-react-btns').classList.add('hidden'); }
function startAudReact() {
    audReactState.isPlaying = true; audReactState.score = 0; document.querySelector('.aud-react-btns').classList.remove('hidden');
    document.getElementById('aud-react-start').textContent = '放弃训练'; nextAudReact();
}
function nextAudReact() {
    if(!audReactState.isPlaying) return;
    const colors = ['红', '黄', '蓝', '绿']; audReactState.targetColor = colors[Math.floor(Math.random()*4)];
    setTimeout(() => { if(audReactState.isPlaying) Speech.speak(audReactState.targetColor, () => audReactState.startTime = Date.now()); }, 1000 + Math.random()*2000);
}
function handleAudReactClick(c) {
    if(!audReactState.isPlaying || !audReactState.startTime) return;
    const colorMap = { 'red': '红', 'yellow': '黄', 'blue': '蓝', 'green': '绿' };
    if(colorMap[c] === audReactState.targetColor) {
        const diff = (Date.now() - audReactState.startTime) / 1000;
        alert(`反应时间: ${diff.toFixed(2)}s`); audReactState.startTime = 0; nextAudReact();
    } else { alert('点错啦！'); audReactState.startTime = 0; nextAudReact(); }
}

function initAudSpan() { 
    audSpanState.isPlaying = false; 
    const box = document.getElementById('aud-span-input-box');
    if(box) box.classList.add('hidden'); 
    const inp = document.getElementById('aud-span-input');
    if(inp) inp.value = '';
}
function startAudSpan() {
    audSpanState.isPlaying = true; audSpanState.currentLevel = 3; 
    const startBtn = document.getElementById('aud-span-start');
    if(startBtn) startBtn.textContent = '放弃挑战';
    nextAudSpanRound();
}
function nextAudSpanRound() {
    audSpanState.sequence = Array.from({length: audSpanState.currentLevel}, () => Math.floor(Math.random()*10));
    audSpanState.userIdx = 0; 
    document.getElementById('aud-span-input-box').classList.add('hidden');
    const inp = document.getElementById('aud-span-input');
    if(inp) inp.value = '';
    Speech.speak("请记住数字序列：" + audSpanState.sequence.join('，'), () => {
        document.getElementById('aud-span-input-box').classList.remove('hidden');
        if(inp) inp.focus();
    });
}

function initAudInter() { 
    audInterState.isPlaying = false;
    const inputBox = document.getElementById('aud-inter-input-box');
    if(inputBox) inputBox.classList.add('hidden');
    const startBtn = document.getElementById('aud-inter-start');
    if(startBtn) { startBtn.disabled = false; startBtn.textContent = "开始挑战"; }
}

function startAudInter() {
    audInterState.isPlaying = true;
    // Generate 4 random separate digits for clearer read-out
    const digits = Array.from({length: 4}, () => Math.floor(Math.random() * 10));
    audInterState.answer = digits.join('');
    
    const startBtn = document.getElementById('aud-inter-start');
    startBtn.disabled = true;
    startBtn.textContent = "正在播报...";
    
    // Simulate background noise with some lead-in text
    Speech.speak("请从杂音中分辨数字：" + digits.join('，'), () => {
        const inputBox = document.getElementById('aud-inter-input-box');
        if(inputBox) inputBox.classList.remove('hidden');
        const inputField = document.getElementById('aud-inter-input');
        if(inputField) { inputField.value = ''; inputField.focus(); }
        startBtn.textContent = "请听题";
    });
}

function handleAudInterSubmit() {
    const inputField = document.getElementById('aud-inter-input');
    const user = inputField.value.trim();
    if(user === audInterState.answer) {
        alert("🎉 听力卓越！完全正确。");
    } else {
        alert(`❌ 不太对哦，正确数字是 ${audInterState.answer}`);
    }
    initAudInter();
}

function initMemRepeat() { memRepeatState.isPlaying = false; }
function startMemRepeat() {
    memRepeatState.isPlaying = true;
    const s = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
    memRepeatState.currentSentence = s;
    
    document.getElementById('mem-repeat-msg').textContent = "请仔细听...";
    const startBtn = document.getElementById('mem-repeat-start');
    startBtn.disabled = true;
    startBtn.textContent = "正在播报...";
    
    Speech.speak("请复述：" + s, () => {
        document.getElementById('mem-repeat-msg').textContent = "请在下方输入你听到的句子：";
        const inputBox = document.getElementById('mem-repeat-input-box');
        inputBox.classList.remove('hidden');
        const inputField = document.getElementById('mem-repeat-input');
        inputField.value = '';
        inputField.focus();
        startBtn.textContent = "播放完毕";
    });
}

function handleMemRepeatSubmit() {
    const inputField = document.getElementById('mem-repeat-input');
    const user = inputField.value.trim();
    const original = memRepeatState.currentSentence;
    
    if (user === original) {
        alert("🎉 精准复述！太棒了！");
        ScoreManager.saveResult('mem-repeat', 10);
    } else {
        alert("💡 有些出入哦，原句是：\n" + original);
    }
    
    document.getElementById('mem-repeat-input-box').classList.add('hidden');
    document.getElementById('mem-repeat-msg').textContent = "点击下方按钮开始新的一轮。";
    const startBtn = document.getElementById('mem-repeat-start');
    startBtn.disabled = false;
    startBtn.textContent = "开始听音";
    memRepeatState.isPlaying = false;
}

function initMemReverse() { 
    memReverseState.isPlaying = false;
    const input = document.getElementById('mem-rev-input');
    if(input) { input.disabled = true; input.value = ''; }
    const startBtn = document.getElementById('mem-rev-start');
    if(startBtn) startBtn.textContent = "发音";
}

function startMemReverse() {
    memReverseState.isPlaying = true;
    const words = ["苹果", "英雄", "蓝天", "葡萄", "长城", "彩虹", "专注", "进步"];
    const w = words[Math.floor(Math.random() * words.length)];
    memReverseState.currentWord = w;
    
    const startBtn = document.getElementById('mem-rev-start');
    startBtn.disabled = true;
    startBtn.textContent = "正在播报...";
    
    Speech.speak("请倒着说：" + w, () => {
        const input = document.getElementById('mem-rev-input');
        input.disabled = false;
        input.value = '';
        input.focus();
        startBtn.textContent = "请听题";
        
        // Listen for enter key in the input
        input.onkeydown = (e) => {
            if(e.key === 'Enter') handleMemReverseSubmit();
        };
    });
}

function handleMemReverseSubmit() {
    const inputField = document.getElementById('mem-rev-input');
    const user = inputField.value.trim();
    const correct = memReverseState.currentWord.split('').reverse().join('');
    
    if (user === correct) {
        alert("🌈 完全正确！你的反应很快！");
        ScoreManager.saveResult('mem-reverse', 10);
    } else {
        alert(`❌ 不正确哦，"${memReverseState.currentWord}" 倒过来是 "${correct}"`);
    }
    
    initMemReverse();
    const startBtn = document.getElementById('mem-rev-start');
    startBtn.disabled = false;
}

// ====== 6. Other Modules ======
function initDecoding() { 
    decodingState.isPlaying = false; document.getElementById('decoding-timer').textContent = '60';
    document.getElementById('decoding-input').disabled = true; document.getElementById('decoding-input').value = '';
    document.getElementById('decoding-expr').textContent = '准备好了吗？';
    const symMap = {'△':1, '☆':2, '○':3, '□':4, '◇':5};
    decodingState.legend = symMap;
    const legEl = document.getElementById('decoding-legend');
    if(legEl) {
        const symbols = ['△', '☆', '○', '□', '◇'];
        let html = '<table style="width:100%; border-collapse:collapse; margin:10px 0; font-size:1.8rem; color:#fff; border:2px solid #fff;">';
        html += '<tr style="background:rgba(255,255,255,0.1);">';
        symbols.forEach(s => html += `<td style="border:1px solid #fff; padding:10px; text-align:center;">${s}</td>`);
        html += '</tr><tr>';
        symbols.forEach((_, i) => html += `<td style="border:1px solid #fff; padding:10px; color:#40c4ff; font-weight:bold; text-align:center;">${i+1}</td>`);
        html += '</tr></table>'; legEl.innerHTML = html;
        legEl.style.display = 'block';
    }
}
function startDecoding() {
    // Ensure initialization has been done
    if(!decodingState.legend || Object.keys(decodingState.legend).length === 0) {
        initDecoding();
    }
    decodingState.isPlaying = true; decodingState.score = 0; decodingState.timeLeft = 60;
    const btn = document.getElementById('decoding-start');
    if(btn) btn.textContent = '放弃挑战';
    const inp = document.getElementById('decoding-input'); inp.disabled = false; inp.value = ''; inp.focus();
    nextDecodingRound();
    decodingState.timer = setInterval(() => { 
        if(--decodingState.timeLeft <= 0) { 
            endDecoding(true);
            return;
        } 
        document.getElementById('decoding-timer').textContent = decodingState.timeLeft; 
    }, 1000);
}
function nextDecodingRound() {
    // Guard: ensure legend is initialized
    if(!decodingState.legend || Object.keys(decodingState.legend).length === 0) {
        initDecoding();
    }
    const syms = Object.keys(decodingState.legend);
    const s1 = syms[Math.floor(Math.random() * syms.length)];
    const s2 = syms[Math.floor(Math.random() * syms.length)];
    const op = Math.random() > 0.5 ? '+' : '-';
    decodingState.currentAns = op === '+' ? (decodingState.legend[s1] + decodingState.legend[s2]) : (decodingState.legend[s1] - decodingState.legend[s2]);
    document.getElementById('decoding-expr').textContent = `${s1} ${op} ${s2} = `;
    document.getElementById('decoding-input').value = '';
}

function endDecoding(completed) {
    clearInterval(decodingState.timer);
    decodingState.isPlaying = false;
    const btn = document.getElementById('decoding-start');
    if(btn) btn.textContent = '开始挑战';
    const inp = document.getElementById('decoding-input');
    if(inp) inp.disabled = true;
    if(completed) {
        alert('时间到！最终得分：' + decodingState.score);
        ScoreManager.saveResult('decoding', decodingState.score);
    }
}

function endDecodingConn(completed) {
    clearInterval(decodingConnState.timer);
    decodingConnState.isPlaying = false;
    const btn = document.getElementById('decoding-conn-start');
    if(btn) btn.textContent = '开始挑战';
    if(completed) {
        alert('时间到！成功完成 ' + decodingConnState.score + ' 组');
        ScoreManager.saveResult('decoding-conn', decodingConnState.score);
    }
}

function initDecodingConn() {
    decodingConnState.isPlaying = false;
    const timerEl = document.getElementById('decoding-conn-timer');
    if(timerEl) timerEl.textContent = '60';
    
    const legEl = document.getElementById('decoding-conn-legend');
    if(legEl) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:1.2rem; color:#fff; border:2px solid rgba(255,255,255,0.2);">';
        html += '<tr style="background:rgba(255,255,255,0.1);">';
        decodingConnState.letters.forEach(L => html += `<td style="border:1px solid rgba(255,255,255,0.2); padding:5px; text-align:center;">${L}</td>`);
        html += '</tr><tr>';
        decodingConnState.letters.forEach((_, i) => html += `<td style="border:1px solid rgba(255,255,255,0.2); padding:5px; color:#40c4ff; font-weight:bold; text-align:center;">${i+1}</td>`);
        html += '</tr></table>';
        legEl.innerHTML = html;
        legEl.style.display = 'block';
    }

    const grid = document.getElementById('decoding-conn-grid');
    if(grid) {
        grid.innerHTML = Array.from({length:9}, (_, i) => `<button class="btn glass num-btn hover:bg-white/10" data-num="${i+1}" style="min-height: 3rem; font-size:1.5rem; border:1px solid rgba(255,255,255,0.1); cursor:pointer; border-radius: 8px;">${i+1}</button>`).join('');
        grid.style.display = 'grid';
        grid.querySelectorAll('.num-btn').forEach(btn => {
            btn.onclick = () => {
                if(!decodingConnState.isPlaying) return;
                const num = parseInt(btn.getAttribute('data-num'));
                const targetChar = decodingConnState.targetSeq[decodingConnState.currentIndex];
                if(num === (decodingConnState.letters.indexOf(targetChar) + 1)) {
                    decodingConnState.currentIndex++;
                    updateDecodingConnSeqDisplay();
                    if(decodingConnState.currentIndex === decodingConnState.targetSeq.length) {
                        decodingConnState.score++;
                        nextDecodingConnRound();
                    }
                } else {
                    decodingConnState.timeLeft = Math.max(0, decodingConnState.timeLeft - 2);
                    btn.style.background = 'rgba(218,54,51,0.5)';
                    setTimeout(() => btn.style.background = '', 300);
                }
            };
        });
    }
}
let breathingInterval = null;
const breathingPatterns = {
    '478': [
        { name: '吸气', duration: 4, class: 'inhale' },
        { name: '憋气', duration: 7, class: 'hold' },
        { name: '呼气', duration: 8, class: 'exhale' }
    ],
    '4444': [
        { name: '吸气', duration: 4, class: 'inhale' },
        { name: '憋气', duration: 4, class: 'hold' },
        { name: '呼气', duration: 4, class: 'exhale' },
        { name: '准备', duration: 4, class: 'hold' }
    ],
    '55': [
        { name: '吸气', duration: 5, class: 'inhale' },
        { name: '呼气', duration: 5, class: 'exhale' }
    ]
};

function initBreathing() {
    stopBreathing();
    const circle = document.getElementById('b-circle');
    if(circle) circle.className = 'b-circle';
    const text = document.getElementById('b-text');
    if(text) text.textContent = '准备';
    const setup = document.getElementById('b-setup');
    if(setup) setup.classList.remove('hidden');
    const prog = document.getElementById('b-progress');
    if(prog) prog.style.width = '0%';
}

function startBreathing() {
    const patternKey = document.getElementById('breathing-pattern').value;
    const pattern = breathingPatterns[patternKey];
    const setup = document.getElementById('b-setup');
    const circle = document.getElementById('b-circle');
    const text = document.getElementById('b-text');
    const prog = document.getElementById('b-progress');
    const ripple = document.getElementById('b-ripple');
    
    if(setup) setup.classList.add('hidden');
    
    let currentPhase = 0;
    let phaseStart = Date.now();
    
    const runPhase = () => {
        const p = pattern[currentPhase];
        if(circle) {
            circle.className = 'b-circle ' + p.class;
        }
        if(text) text.textContent = p.name;
        if(ripple) {
            ripple.style.display = (p.class === 'exhale') ? 'block' : 'none';
        }
    };
    
    runPhase();
    
    breathingInterval = setInterval(() => {
        const p = pattern[currentPhase];
        const elapsed = (Date.now() - phaseStart) / 1000;
        const percent = Math.min(100, (elapsed / p.duration) * 100);
        
        if(prog) prog.style.width = percent + '%';
        
    if(elapsed >= p.duration) {
        currentPhase = (currentPhase + 1) % pattern.length;
        phaseStart = Date.now();
        runPhase();
        if(currentPhase === 0) ScoreManager.saveResult('breathing', 1);
    }
}, 50);
}

function stopBreathing() {
    if(breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
}

// ====== House Search Module (Optimized for Image 2) ======
function drawHouse(ctx, x, y, size, windows) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath();
    // Pentagon body (Image 2 style)
    const roofY = y - size/4;
    ctx.moveTo(x - size/2, roofY);
    ctx.lineTo(x, y - size/2); // Roof peak
    ctx.lineTo(x + size/2, roofY);
    ctx.lineTo(x + size/2, y + size/4);
    ctx.lineTo(x - size/2, y + size/4);
    ctx.closePath();
    ctx.stroke();
    
    // Windows: 4 possible positions (L756: 2x2 grid)
    const winSize = size / 5;
    const winOffset = size / 4;
    if(windows & 1) ctx.strokeRect(x - winOffset, roofY + 5, winSize, winSize);
    if(windows & 2) ctx.strokeRect(x + winOffset - winSize, roofY + 5, winSize, winSize);
    if(windows & 4) ctx.strokeRect(x - winOffset, y + size/4 - winSize - 5, winSize, winSize);
    if(windows & 8) ctx.strokeRect(x + winOffset - winSize, y + size/4 - winSize - 5, winSize, winSize);
}

function initHouseSearch() {
    const grid = document.getElementById('house-search-grid');
    if(!grid) return;
    grid.innerHTML = '';
    const targetBox = document.getElementById('house-target-canvas').getContext('2d');
    targetBox.clearRect(0,0,100,100);
    drawHouse(targetBox, 50, 60, 60, 0); // Placeholder
}

function startHouseSearch() {
    houseSearchState.isPlaying = true; houseSearchState.found = 0;
    const targetWindows = Math.floor(Math.random()*16); // 4 windows = 2^4 = 16 combinations
    houseSearchState.target = targetWindows;
    houseSearchState.timeLeft = 60;
    
    // Draw target
    const tCtx = document.getElementById('house-target-canvas').getContext('2d');
    tCtx.clearRect(0,0,100,100); drawHouse(tCtx, 50, 50, 60, targetWindows);
    
    const grid = document.getElementById('house-search-grid');
    grid.innerHTML = '';
    for(let i=0; i<150; i++) {
        const win = Math.floor(Math.random()*16);
        const canvas = document.createElement('canvas'); canvas.width = 60; canvas.height = 60;
        const ctx = canvas.getContext('2d');
        drawHouse(ctx, 30, 30, 40, win);
        canvas.onclick = () => {
            if(!houseSearchState.isPlaying) return;
            if(win === targetWindows) {
                if(!canvas.classList.contains('found')) {
                    canvas.classList.add('found');
                    canvas.style.background = 'rgba(46,160,67,0.3)';
                    houseSearchState.found++;
                }
            } else {
                canvas.style.background = 'rgba(218,54,51,0.3)';
                setTimeout(() => canvas.style.background = '', 400);
            }
        };
        grid.appendChild(canvas);
    }
    
    houseSearchState.timer = setInterval(() => {
        if(--houseSearchState.timeLeft <= 0) {
            clearInterval(houseSearchState.timer);
            houseSearchState.isPlaying = false;
            alert(`搜寻结束！共找到 ${houseSearchState.found} 个目标房屋。`);
        }
        const timerEl = document.getElementById('house-search-timer');
        if(timerEl) timerEl.textContent = houseSearchState.timeLeft;
    }, 1000);
}
function startDecodingConn() {
    const grid = document.getElementById('decoding-conn-grid');
    if(!grid || grid.innerHTML.trim() === '' || grid.innerHTML.includes('<!--')) initDecodingConn(); // Ensure initialized
    
    decodingConnState.isPlaying = true;
    decodingConnState.score = 0;
    decodingConnState.timeLeft = 60;
    document.getElementById('decoding-conn-start').textContent = '放弃挑战';
    nextDecodingConnRound();
    decodingConnState.timer = setInterval(() => {
        if(--decodingConnState.timeLeft <= 0) {
            endDecodingConn(true);
            return;
        }
        const timerEl = document.getElementById('decoding-conn-timer');
        if(timerEl) timerEl.textContent = decodingConnState.timeLeft;
    }, 1000);
}
function nextDecodingConnRound() {
    decodingConnState.targetSeq = Array.from({length: 6}, () => decodingConnState.letters[Math.floor(Math.random()*9)]);
    decodingConnState.currentIndex = 0; updateDecodingConnSeqDisplay();
}
function updateDecodingConnSeqDisplay() {
    const el = document.getElementById('decoding-conn-sequence');
    el.innerHTML = decodingConnState.targetSeq.map((c, i) => `<span style="${i < decodingConnState.currentIndex ? 'opacity:0.3; text-decoration:line-through;' : 'color:#58a6ff'}">${c}</span>`).join(' ');
}

function initVisSpeed() { 
    visSpeedState.isPlaying = false;
    document.getElementById('vis-speed-controls').classList.add('hidden');
    document.getElementById('vis-speed-start').classList.remove('hidden');
    document.getElementById('vis-speed-target').textContent = '?';
    document.getElementById('vis-speed-group').innerHTML = '';
}
function startVisSpeed() {
    visSpeedState.isPlaying = true; visSpeedState.score = 0; visSpeedState.timeLeft = 60;
    document.getElementById('vis-speed-start').classList.add('hidden');
    document.getElementById('vis-speed-controls').classList.remove('hidden');
    nextVisSpeedRound();
    visSpeedState.timer = setInterval(() => {
        if(--visSpeedState.timeLeft <= 0) {
            clearInterval(visSpeedState.timer); visSpeedState.isPlaying = false;
            alert(`结束！最终得分：${visSpeedState.score}`);
            ScoreManager.saveResult('vis-speed', visSpeedState.score);
            initVisSpeed();
        }
        document.getElementById('vis-speed-timer').textContent = visSpeedState.timeLeft;
    }, 1000);
}
function nextVisSpeedRound() {
    const syms = ['☀', '⚡', '❄', '☁', '★', '☕', '⚔', '⚖', '☯', '⚛'];
    visSpeedState.currentTarget = syms[Math.floor(Math.random()*10)];
    document.getElementById('vis-speed-target').textContent = visSpeedState.currentTarget;
    const isMatch = Math.random() > 0.5;
    let group = [];
    if(isMatch) {
        group = syms.filter(s => s !== visSpeedState.currentTarget).sort(() => 0.5-Math.random()).slice(0, 4);
        group.push(visSpeedState.currentTarget);
        group.sort(() => 0.5-Math.random());
    } else {
        group = syms.filter(s => s !== visSpeedState.currentTarget).sort(() => 0.5-Math.random()).slice(0, 5);
    }
    visSpeedState.currentGroup = group;
    document.getElementById('vis-speed-group').innerHTML = group.map(s => `<span class="search-symbol">${s}</span>`).join('');
}
function handleVisSpeed(choice) {
    if(!visSpeedState.isPlaying) return;
    const actual = visSpeedState.currentGroup.includes(visSpeedState.currentTarget);
    if(choice === actual) {
        visSpeedState.score++;
        document.getElementById('vis-speed-msg').innerHTML = '<span style="color:#00ff88">✔ 正确</span>';
    } else {
        document.getElementById('vis-speed-msg').innerHTML = '<span style="color:#ff4d4d">✘ 错误</span>';
    }
    nextVisSpeedRound();
}

function initVisDiscrim() {
    const ctx = document.getElementById('discrim-target-canvas').getContext('2d'); ctx.clearRect(0,0,120,120);
    document.getElementById('discrim-grid').innerHTML = '';
}
function startVisDiscrim() {
    visDiscrimState.isPlaying = true; visDiscrimState.targetGaps = Array.from({length:3}, () => ['T', 'B', 'L', 'R'][Math.floor(Math.random()*4)]);
    const tCtx = document.getElementById('discrim-target-canvas').getContext('2d'); 
    tCtx.clearRect(0,0,120,120); drawConcentric(tCtx, 60, 60, 40, visDiscrimState.targetGaps);
    const grid = document.getElementById('discrim-grid'); grid.innerHTML = '';
    for(let i=0; i<40; i++) {
        const isMatch = Math.random() > 0.8;
        const gaps = isMatch ? [...visDiscrimState.targetGaps] : Array.from({length:3}, () => ['T', 'B', 'L', 'R'][Math.floor(Math.random()*4)]);
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 60;
        drawConcentric(canvas.getContext('2d'), 30, 30, 20, gaps);
        canvas.onclick = () => { if(isMatch) canvas.style.background = 'rgba(0,255,0,0.2)'; else alert('不匹配'); };
        grid.appendChild(canvas);
    }
}
function drawConcentric(ctx, x, y, size, gaps) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    for(let i=0; i<3; i++) {
        const r = size * (0.3 + i*0.25); ctx.beginPath();
        const start = gaps[i] === 'R' ? 0.3 : gaps[i] === 'B' ? 1.8 : gaps[i] === 'L' ? 3.3 : 4.8;
        ctx.arc(x, y, r, start, start + 5.8); ctx.stroke();
    }
}

function initVisCancel() {
    document.getElementById('vis-cancel-grid').innerHTML = '';
}

function initStroop() {
    stroopState.isPlaying = false; nextStroopRound();
}
function startStroop() {
    stroopState.isPlaying = true;
    stroopState.score = 0;
    stroopState.timeLeft = 30;
    document.getElementById('stroop-start').textContent = '放弃挑战';
    nextStroopRound();
    stroopState.timer = setInterval(() => {
        if(--stroopState.timeLeft <= 0) {
            endStroop(true);
        }
        const timerEl = document.getElementById('stroop-timer');
        if(timerEl) timerEl.textContent = stroopState.timeLeft;
    }, 1000);
}
function endStroop(completed) {
    clearInterval(stroopState.timer);
    stroopState.isPlaying = false;
    document.getElementById('stroop-start').textContent = '开始挑战';
    if(completed) {
        alert('时间到！你的得分：' + stroopState.score);
        ScoreManager.saveResult('stroop', stroopState.score);
    }
}
function nextStroopRound() {
    const colors = [{n:'红',c:'red'},{n:'蓝',c:'blue'},{n:'绿',c:'green'},{n:'黄',c:'yellow'}];
    const word = colors[Math.floor(Math.random()*4)], color = colors[Math.floor(Math.random()*4)];
    stroopState.currentCorrect = color.c;
    const el = document.getElementById('stroop-word'); el.textContent = word.n;
    const map = {red:'#ff4d4d', blue:'#40c4ff', green:'#2ea043', yellow:'#ffeb3b'};
    el.style.color = map[color.c];
}

// ====== 7. Assessment & Events ======
// ====== 7. Assessment & Radar Chart (Parent-Friendly) ======
function initAssessmentWechsler() { 
    // Aggregate scores into 5 Dimensions
    const vSearch = (ScoreManager.getBest('vis-cancel') || 0) + (ScoreManager.getBest('vis-video') || 0) + (ScoreManager.getBest('house-search') || 0);
    const vSpeed = (ScoreManager.getBest('vis-speed') || 0) + (ScoreManager.getBest('decoding') || 0) + (ScoreManager.getBest('space-decoding') || 0);
    const aMemory = (ScoreManager.getBest('aud-span') || 0) + (ScoreManager.getBest('mem-reverse') || 0) + (ScoreManager.getBest('mem-repeat') || 0);
    const inhibition = (ScoreManager.getBest('stroop') || 0) + (ScoreManager.getBest('vis-anti-inter') || 0);
    const tracking = (ScoreManager.getBest('tracker') || 0) + (ScoreManager.getBest('schulte') || 0);

    // Normalize to 0-100 (Assumes rough targets for full mastery)
    const scores = {
        "视觉搜索": Math.min(100, Math.round((vSearch / 25) * 100)),
        "加工速度": Math.min(100, Math.round((vSpeed / 30) * 100)),
        "听觉记忆": Math.min(100, Math.round((aMemory / 25) * 100)),
        "干扰抑制": Math.min(100, Math.round((inhibition / 150) * 100)), // Anti-inter has a high max
        "持续专注": Math.min(100, Math.round((tracking / 15) * 100))
    };

    renderRadarChart(scores);
    
    // Summary Calculation
    const totalRaw = Object.values(scores).reduce((a, b) => a + b, 0);
    const fsiq = Math.floor((totalRaw / 5) + 60);

    document.getElementById('wec-vis-score').textContent = Math.round((scores["视觉搜索"] + scores["加工速度"])/2) || '--';
    document.getElementById('wec-aud-score').textContent = scores["听觉记忆"] || '--';
    document.getElementById('wec-iq-score').textContent = totalRaw > 0 ? fsiq : '--';
    
    const advice = document.getElementById('wec-advice');
    if(totalRaw === 0) {
        advice.textContent = "暂无数据。请先完成各专项训练模块以生成您的全维报告。";
    } else if(fsiq >= 120) {
        advice.textContent = "评估结论：专注力水平卓越。孩子在多维度认知处理上表现出极强的稳定性，建议保持现有强度的复合挑战。";
    } else if(fsiq >= 100) {
        advice.textContent = "评估结论：专注力水平优秀。视觉加工与听觉记忆均处于领先水平，可适当增加干扰抑制类训练。";
    } else if(fsiq >= 85) {
        advice.textContent = "评估结论：专注力水平中等。建议针对性加强报告中较低维度的训练，如多练习划消任务。";
    } else {
        advice.textContent = "评估结论：专注力处于基础水平。建议每天进行 15 分钟的定制化训练（如舒尔特方格与复述训练）。";
    }
}

function renderRadarChart(scores) {
    const container = document.getElementById('radar-container');
    if(!container) return;
    container.innerHTML = '';
    
    const size = 300, center = size/2, radius = 90;
    const labels = Object.keys(scores);
    const angleStep = (Math.PI * 2) / labels.length;
    
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="max-width:100%; filter: drop-shadow(0 0 10px rgba(64,196,255,0.2));">`;
    
    // Radial Grid
    for(let i=1; i<=5; i++) {
        const r = (radius / 5) * i;
        svg += `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="2,2" />`;
    }
    
    // Axes and Labels
    labels.forEach((label, i) => {
        const angle = angleStep * i - Math.PI/2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.2)" stroke-width="1" />`;
        
        // Label position
        const lx = center + (radius + 25) * Math.cos(angle);
        const ly = center + (radius + 20) * Math.sin(angle);
        svg += `<text x="${lx}" y="${ly}" fill="rgba(255,255,255,0.8)" font-size="12" font-weight="500" text-anchor="middle" dominant-baseline="middle">${label}</text>`;
    });
    
    // Data Polygon
    let points = "";
    labels.forEach((label, i) => {
        const val = scores[label] || 0;
        const dist = (val / 100) * radius;
        const angle = angleStep * i - Math.PI/2;
        const x = center + dist * Math.cos(angle);
        const y = center + dist * Math.sin(angle);
        points += `${x},${y} `;
        if(val > 0) svg += `<circle cx="${x}" cy="${y}" r="3" fill="var(--primary)" />`;
    });
    
    if(points) {
        svg += `<polygon points="${points}" fill="rgba(64,196,255,0.3)" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round" />`;
    }
    
    svg += `</svg>`;
    container.innerHTML = svg;
}

document.addEventListener('DOMContentLoaded', () => {
    // Helper to safely bind event listeners
    const bindClick = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };

    setupNavigation(); 
    updateDashboard(); 
    setTimeout(resizeCanvas, 100); 
    window.addEventListener('resize', resizeCanvas);
    
    // Warm up speech on first user interaction
    document.addEventListener('click', () => { Speech.warmUp(); }, { once: true });
    
    bindClick('schulte-start', () => schulteState.isPlaying ? endSchulteGame(false) : startSchulteGame());
    const sTheme = document.getElementById('schulte-theme'); if(sTheme) sTheme.onchange = () => { stopAllActivities(); generateSchulteGrid(); };
    const sSize = document.getElementById('schulte-size'); if(sSize) sSize.onchange = (e) => { stopAllActivities(); const val = e.target.value; schulteState.size = (val === 'circular') ? 'circular' : parseInt(val); generateSchulteGrid(); };
    
    bindClick('tracker-start', () => initTrackerGame(true));
    const tCanvas = document.getElementById('tracker-canvas');
    if(tCanvas) tCanvas.onmousedown = (e) => {
        if(trackerState.phase !== 'select') return;
        const rect = e.target.getBoundingClientRect(); const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        trackerState.balls.forEach(b => {
            if(!b.isSelected && b.isClicked(mx, my)) {
                b.isSelected = true; b.isCorrect = b.isTarget;
                if(b.isCorrect) {
                  trackerState.selectedFound++;
                  if(trackerState.selectedFound === trackerState.numTargets) {
                      trackerState.level++; setTimeout(() => { alert("全部找对！"); initTrackerGame(true); }, 500);
                  }
                } else {
                    trackerState.isPlaying = false;
                    setTimeout(() => { alert("选错了。"); trackerState.level = 1; document.getElementById('tracker-start').style.display = 'block'; initTrackerGame(false); }, 500);
                }
            }
        });
    };
    
    bindClick('video-start', startVisVideo);
    bindClick('vis-speed-start', startVisSpeed);
    bindClick('vis-speed-yes', () => handleVisSpeed(true));
    bindClick('vis-speed-no', () => handleVisSpeed(false));
    bindClick('space-start', () => spaceDecodingState.isPlaying ? endSpaceDecoding(false) : startSpaceDecoding());
    const spInp = document.getElementById('space-input');
    if(spInp) spInp.oninput = (e) => { if(!spaceDecodingState.isPlaying) return; if(e.target.value.toLowerCase() === spaceDecodingState.targetSeq.map(i=>i.char).join('').toLowerCase()) { spaceDecodingState.score++; nextSpaceDecodingRound(); } };
    
    bindClick('decoding-conn-start', () => decodingConnState.isPlaying ? endDecodingConn(false) : startDecodingConn());
    bindClick('decoding-start', () => decodingState.isPlaying ? endDecoding(false) : startDecoding());
    const decInp = document.getElementById('decoding-input');
    if(decInp) decInp.oninput = (e) => { if(parseInt(e.target.value) === decodingState.currentAns) { decodingState.score++; nextDecodingRound(); } };
    
    bindClick('vis-discrim-start', startVisDiscrim);
    bindClick('stroop-start', () => stroopState.isPlaying ? endStroop(false) : startStroop());
    document.querySelectorAll('.stroop-option').forEach(b => b.onclick = () => { 
        if(!stroopState.isPlaying) return;
        if(b.getAttribute('data-color') === stroopState.currentCorrect) {
            stroopState.score++;
        } else {
            stroopState.timeLeft = Math.max(0, stroopState.timeLeft - 2);
        }
        nextStroopRound(); 
    });
    
    bindClick('aud-react-start', () => audReactState.isPlaying ? initAudReact() : startAudReact());
    document.querySelectorAll('.btn-circle').forEach(b => b.onclick = () => handleAudReactClick(b.getAttribute('data-color')));
    
    bindClick('aud-span-start', () => audSpanState.isPlaying ? initAudSpan() : startAudSpan());
    bindClick('aud-span-submit', () => {
        const spanInp = document.getElementById('aud-span-input');
        if(spanInp.value === audSpanState.sequence.join('')) {
            audSpanState.currentLevel++; alert('🎉 过关！序列变长了！'); nextAudSpanRound();
        } else { alert('❌ 错了！重新来过。'); initAudSpan(); }
    });
    const spanInp = document.getElementById('aud-span-input');
    if(spanInp) spanInp.onkeydown = (e) => { if(e.key === 'Enter') { if(e.target.value === audSpanState.sequence.join('')) { audSpanState.currentLevel++; alert('过关！'); nextAudSpanRound(); } else { alert('错了！'); initAudSpan(); } } };
    
    bindClick('aud-inter-start', startAudInter);
    bindClick('aud-inter-submit', handleAudInterSubmit);
    const interInp = document.getElementById('aud-inter-input');
    if(interInp) interInp.onkeydown = (e) => { if(e.key === 'Enter') handleAudInterSubmit(); };
    bindClick('mem-repeat-start', startMemRepeat);
    bindClick('mem-rev-start', startMemReverse);
    
    bindClick('vis-cancel-start', () => {
        const g = document.getElementById('vis-cancel-grid'); if(!g) return; g.innerHTML = '';
        const th = document.getElementById('vis-cancel-theme').value;
        const pool = th === 'letter' ? ['p','b','d','q'] : [...THEMES[th]].sort(() => 0.5 - Math.random()).slice(0, 4);
        const target = pool[Math.floor(Math.random() * pool.length)];
        document.getElementById('vis-cancel-target-char').textContent = target;
        for(let i=0; i<300; i++) {
            const c = pool[Math.floor(Math.random()*pool.length)], cell = document.createElement('div');
            cell.className = 'cancel-cell'; cell.textContent = c;
            cell.onclick = () => {
                if(cell.textContent === target) {
                    cell.classList.add('found');
                } else {
                    cell.classList.add('error');
                    setTimeout(() => cell.classList.remove('error'), 400);
                }
            };
            g.appendChild(cell);
        }
    });

    bindClick('breathing-start', startBreathing);
    bindClick('house-search-start', startHouseSearch);
    
    // Bind Voice Input Buttons
    document.querySelectorAll('.voice-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            STT.start(btn.getAttribute('data-target'));
        };
    });
    
    bindClick('wec-run', initAssessmentWechsler);
    
    // New Module Event Listeners
    bindClick('vis-anti-start', () => visAntiInterState.isPlaying ? endVisAntiInter(false) : startVisAntiInter());
    bindClick('track-maze-start', () => trackMazeState.isPlaying ? (trackMazeState.isPlaying = false) : startTrackMaze());
    bindClick('symbol-decode-start', () => symbolDecodeState.isPlaying ? (symbolDecodeState.isPlaying = false) : startSymbolDecode());
    bindClick('pattern-search-start', initPatternSearch);
});

// ====== NEW: Visual Tracking (迷宫连线) ======
function initTrackMaze() {
    trackMazeState.isPlaying = false;
    trackMazeState.matches = 0;
    document.getElementById('track-match').textContent = '0/5';
    const container = document.querySelector('.track-maze-container');
    container.innerHTML = '<div style="text-align: center; font-size: 1.5rem; padding: 4rem; width: 100%;">准备好了吗？顺着线条寻找右侧对应的黑白图。</div>';
}

function startTrackMaze() {
    trackMazeState.isPlaying = true;
    trackMazeState.matches = 0;
    trackMazeState.selectedSource = null;
    const container = document.querySelector('.track-maze-container');
    container.innerHTML = '';
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 800 500");
    svg.style.width = "100%";
    svg.style.height = "auto";
    container.appendChild(svg);

    const sources = ['👾', '👽', '👹', '👺', '👻'];
    const targets = ['👾', '👽', '👹', '👺', '👻'].sort(() => Math.random() - 0.5);
    const colors = ['#ff4d4d', '#40c4ff', '#2ea043', '#ffeb3b', '#bc8cff'];

    sources.forEach((s, i) => {
        // Draw Source
        const gSource = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", "20"); rect.setAttribute("y", 50 + i * 80);
        rect.setAttribute("width", "60"); rect.setAttribute("height", "60");
        rect.setAttribute("rx", "12"); rect.setAttribute("fill", "rgba(255,255,255,0.05)");
        rect.setAttribute("stroke", "rgba(255,255,255,0.1)");
        rect.style.cursor = "pointer";
        rect.onclick = () => {
            if(!trackMazeState.isPlaying) return;
            trackMazeState.selectedSource = i;
            Array.from(svg.querySelectorAll('rect')).forEach(r => r.setAttribute("stroke", "rgba(255,255,255,0.1)"));
            rect.setAttribute("stroke", colors[i]);
        };
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "50"); text.setAttribute("y", 85 + i * 80);
        text.setAttribute("text-anchor", "middle"); text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("font-size", "30"); text.textContent = s;
        text.style.pointerEvents = "none";
        gSource.appendChild(rect); gSource.appendChild(text); svg.appendChild(gSource);

        // Draw Target
        const targetIdx = targets.indexOf(s);
        const gTarget = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const tRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        tRect.setAttribute("x", "720"); tRect.setAttribute("y", 50 + targetIdx * 80);
        tRect.setAttribute("width", "60"); tRect.setAttribute("height", "60");
        tRect.setAttribute("rx", "12"); tRect.setAttribute("fill", "rgba(255,255,255,0.03)");
        tRect.setAttribute("stroke", "rgba(255,255,255,0.1)");
        tRect.style.cursor = "pointer";
        tRect.onclick = () => {
            if(!trackMazeState.isPlaying || trackMazeState.selectedSource === null) return;
            if(trackMazeState.selectedSource === i) {
                tRect.setAttribute("fill", colors[i] + "44");
                tRect.setAttribute("stroke", colors[i]);
                trackMazeState.matches++;
                document.getElementById('track-match').textContent = `${trackMazeState.matches}/5`;
                if(trackMazeState.matches === 5) {
                    trackMazeState.isPlaying = false;
                    alert("全部找对！感知力满分！");
                    ScoreManager.saveResult('track-maze', 100);
                }
            } else {
                tRect.setAttribute("stroke", "var(--danger)");
                setTimeout(() => tRect.setAttribute("stroke", "rgba(255,255,255,0.1)"), 400);
            }
        };
        const tText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tText.setAttribute("x", "750"); tText.setAttribute("y", 85 + targetIdx * 80);
        tText.setAttribute("text-anchor", "middle"); tText.setAttribute("dominant-baseline", "middle");
        tText.setAttribute("font-size", "30"); tText.textContent = s;
        tText.setAttribute("filter", "grayscale(100%) opacity(0.3)");
        tText.style.pointerEvents = "none";
        gTarget.appendChild(tRect); gTarget.appendChild(tText); svg.appendChild(gTarget);

        // Draw Path (Random but connected)
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const startY = 80 + i * 80, endY = 80 + targetIdx * 80;
        const midX1 = 150 + Math.random() * 100, midX2 = 550 + Math.random() * 100;
        const d = `M 80 ${startY} H ${midX1} V ${endY} H 720`;
        path.setAttribute("d", d); path.setAttribute("stroke", "rgba(255,255,255,0.1)");
        path.setAttribute("stroke-width", "3"); path.setAttribute("fill", "none");
        svg.appendChild(path);
    });
}

// ====== NEW: Symbol Decoding (符号码译) ======
function initSymbolDecode() {
    symbolDecodeState.isPlaying = false;
    document.getElementById('symbol-decode-timer').textContent = '60';
    document.getElementById('symbol-key').innerHTML = '';
    document.getElementById('symbol-grid').innerHTML = '';
    document.getElementById('symbol-input-pad').innerHTML = '';
}

function startSymbolDecode() {
    symbolDecodeState.isPlaying = true; symbolDecodeState.score = 0; symbolDecodeState.timeLeft = 60;
    symbolDecodeState.currentIdx = 0;
    const sets = [
        { s: ['👍', '👎', '✌️', '🤟', '✋', '👊', '👌', '🤏', '🤞', '🖖'], v: ['1', '3', '5', '7', '9', '0', '2', '4', '6', '8'] },
        { s: ['⬅️', '➡️', '⬆️', '⬇️', '↖️', '↗️', '↘️', '↙️', '↔️', '↕️'], v: ['B', 'D', 'P', 'Q', 'F', 'b', 'd', 'p', 'q', 'f'] }
    ];
    symbolDecodeState.set = sets[Math.floor(Math.random() * sets.length)];
    
    // Render Key
    const keyEl = document.getElementById('symbol-key');
    keyEl.innerHTML = symbolDecodeState.set.s.map((s, i) => `
        <div class="glass flex flex-col items-center p-2 rounded-lg" style="border:1px solid rgba(255,255,255,0.1)">
            <span style="font-size:1.5rem">${s}</span>
            <span style="font-size:0.8rem; color:var(--primary); font-weight:bold">${symbolDecodeState.set.v[i]}</span>
        </div>
    `).join('');

    // Render Grid
    const gridEl = document.getElementById('symbol-grid');
    gridEl.innerHTML = '';
    const puzzle = Array.from({length: 24}, () => Math.floor(Math.random() * 10));
    symbolDecodeState.puzzle = puzzle;
    puzzle.forEach((pIdx, i) => {
        const item = document.createElement('div');
        item.className = 'symbol-decode-item' + (i === 0 ? ' active' : '');
        item.id = `sd-item-${i}`;
        item.innerHTML = `<span>${symbolDecodeState.set.s[pIdx]}</span><span id="sd-val-${i}" style="margin-top:5px; font-weight:bold; min-height:1.2rem"></span>`;
        gridEl.appendChild(item);
    });

    // Render Pad
    const padEl = document.getElementById('symbol-input-pad');
    padEl.innerHTML = '';
    symbolDecodeState.set.v.forEach(v => {
        const btn = document.createElement('button');
        btn.className = 'btn glass';
        btn.textContent = v;
        btn.onclick = () => {
            if(!symbolDecodeState.isPlaying) return;
            const correctV = symbolDecodeState.set.v[symbolDecodeState.puzzle[symbolDecodeState.currentIdx]];
            const currentItem = document.getElementById(`sd-item-${symbolDecodeState.currentIdx}`);
            const valSpan = document.getElementById(`sd-val-${symbolDecodeState.currentIdx}`);
            if(v === correctV) {
                valSpan.textContent = v; currentItem.classList.remove('active'); currentItem.classList.add('correct');
                symbolDecodeState.currentIdx++;
                if(symbolDecodeState.currentIdx < 24) document.getElementById(`sd-item-${symbolDecodeState.currentIdx}`).classList.add('active');
                else { symbolDecodeState.isPlaying = false; alert("挑战成功！"); ScoreManager.saveResult('symbol-decode', 100); }
            } else {
                currentItem.classList.add('wrong'); setTimeout(() => currentItem.classList.remove('wrong'), 300);
            }
        };
        padEl.appendChild(btn);
    });

    symbolDecodeState.timer = setInterval(() => {
        if(--symbolDecodeState.timeLeft <= 0) { clearInterval(symbolDecodeState.timer); symbolDecodeState.isPlaying = false; alert("时间到！"); }
        document.getElementById('symbol-decode-timer').textContent = symbolDecodeState.timeLeft;
    }, 1000);
}

// ====== NEW: Pattern Search (视觉搜寻) ======
function initPatternSearch() {
    patternSearchState.level = 1; patternSearchState.found = 0;
    const pool = ['⭐', '⚪', '⬜', '💠', '🔷', '🔶', '⬛', '▫️', '▪️', '✨', '🔘', '📍'];
    patternSearchState.targetSeq = Array.from({length: 2}, () => pool[Math.floor(Math.random() * pool.length)]);
    patternSearchState.total = 3;
    document.getElementById('pattern-lv').textContent = '1';
    document.getElementById('pattern-found').textContent = '0/3';
    
    // Render Target
    const targetEl = document.getElementById('pattern-target');
    targetEl.innerHTML = patternSearchState.targetSeq.map(s => `<span style="font-size:2rem">${s}</span>`).join('');

    // Render Grid
    const gridEl = document.getElementById('pattern-grid');
    gridEl.innerHTML = '';
    const cols = window.innerWidth <= 768 ? 8 : 12; // Adjust columns for mobile
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const totalCells = cols * 10;
    const gridData = Array.from({length: totalCells}, () => pool[Math.floor(Math.random() * pool.length)]);
    
    // Inject targets
    for(let i=0; i<3; i++) {
        const rPos = Math.floor(Math.random() * (totalCells - 2));
        gridData[rPos] = patternSearchState.targetSeq[0]; gridData[rPos+1] = patternSearchState.targetSeq[1];
    }

    gridData.forEach((s, i) => {
        const item = document.createElement('div');
        item.className = 'pattern-grid-item'; item.textContent = s;
        item.onclick = () => {
            if(gridData[i] === patternSearchState.targetSeq[0] && gridData[i+1] === patternSearchState.targetSeq[1]) {
                if(!item.classList.contains('found')) {
                    item.classList.add('found'); document.getElementById('pattern-grid').children[i+1].classList.add('found');
                    patternSearchState.found++; document.getElementById('pattern-found').textContent = `${patternSearchState.found}/${patternSearchState.total}`;
                    if(patternSearchState.found >= patternSearchState.total) { alert("进入下一关！"); patternSearchState.level++; initPatternSearch(); }
                }
            } else {
                item.classList.add('wrong'); setTimeout(() => item.classList.remove('wrong'), 300);
            }
        };
        gridEl.appendChild(item);
    });
}

function _resetVisAntiInter() {
    visAntiInterState.isPlaying = false;
    document.getElementById('vis-anti-timer').textContent = '60';
    const grid = document.getElementById('vis-anti-grid');
    if(grid) grid.innerHTML = '<div style="text-align: center; font-size: 1.5rem; padding: 4rem; width: 100%;">准备好了吗？找到图中所有的“0 9 3”</div>';
}

function startVisAntiInter() {
    visAntiInterState.isPlaying = true;
    visAntiInterState.score = 0;
    visAntiInterState.timeLeft = 60;
    visAntiInterState.foundCount = 0;
    visAntiInterState.totalTargets = 0;

    const grid = document.getElementById('vis-anti-grid');
    grid.innerHTML = '';
    
    const colors = ['#ff4d4d', '#40c4ff', '#2ea043', '#ffeb3b', '#bc8cff', '#ffa500'];
    
    for(let i=0; i<240; i++) { // 20x12 grid
        const cell = document.createElement('div');
        cell.className = 'anti-cell';
        const num = Math.floor(Math.random()*10).toString();
        cell.textContent = num;
        cell.style.color = colors[Math.floor(Math.random()*colors.length)];
        
        if(visAntiInterState.targets.includes(num)) {
            visAntiInterState.totalTargets++;
        }
        
        cell.onclick = () => {
            if(!visAntiInterState.isPlaying || cell.classList.contains('marked')) return;
            if(visAntiInterState.targets.includes(cell.textContent)) {
                cell.classList.add('marked');
                visAntiInterState.score++;
                visAntiInterState.foundCount++;
            } else {
                cell.classList.add('error');
                setTimeout(() => cell.classList.remove('error'), 400);
            }
        };
        grid.appendChild(cell);
    }
    
    document.getElementById('vis-anti-start').textContent = '放弃挑战';
    visAntiInterState.timer = setInterval(() => {
        if(--visAntiInterState.timeLeft <= 0) {
            endVisAntiInter(true);
        }
        document.getElementById('vis-anti-timer').textContent = visAntiInterState.timeLeft;
    }, 1000);
}

function endVisAntiInter(completed) {
    visAntiInterState.isPlaying = false;
    clearInterval(visAntiInterState.timer);
    document.getElementById('vis-anti-start').textContent = '开始挑战';
    if(completed) {
        alert(`挑战结束！你找到了 ${visAntiInterState.foundCount} 个目标，总计 ${visAntiInterState.totalTargets} 个。`);
        ScoreManager.saveResult('vis-anti-inter', Math.floor((visAntiInterState.foundCount / visAntiInterState.totalTargets) * 100));
    }
}

function resizeCanvas() {
    const c = document.getElementById('tracker-canvas'), v = document.getElementById('video-canvas');
    if(c && c.offsetParent) { c.width = c.clientWidth; c.height = c.clientHeight; }
    if(v && v.offsetParent) { v.width = v.parentElement.clientWidth || 800; v.height = v.parentElement.clientHeight || 450; }
}
