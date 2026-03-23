// ====== 0. Global State & Infrastructure ======
const state = {
    currentView: 'dashboard',
    speechEnabled: 'speechSynthesis' in window
};

// All Game States (Declared at top to avoid Temporal Dead Zone issues in stopAllActivities)
let schulteState = { isPlaying: false, expectedNumber: 1, size: 5, timerInterval: null, startTime: 0, themeData: [] };
let trackerState = { isPlaying: false, score: 0, level: 1, balls: [], targetIndices: [], numBalls: 5, numTargets: 2, phase: 'idle', animationId: null, selectedFound: 0 };
let visSpeedState = { isPlaying: false, score: 0, timeLeft: 60, timer: null, currentTarget: '', currentGroup: [] };
let visCancelState = { isPlaying: false, score: 0, timeLeft: 45, timer: null, currentTargetChar: '' };
let decodingState = { isPlaying: false, score: 0, timeLeft: 60, timer: null, legend: {}, currentAns: 0 };
let decodingConnState = { isPlaying: false, score: 0, timeLeft: 60, timer: null, legend: {}, targetSeq: [], currentIndex: 0, letters: ['A','B','C','D','E','F','G','H','K'] };
let visDiscrimState = { isPlaying: false, score: 0, timeLeft: 45, timer: null, targetGaps: [] };
let stroopState = { isPlaying: false, score: 0, timeLeft: 30, timer: null, currentCorrect: '' };
let breathState = { isPlaying: false, interval: null, totalSeconds: 0 };
let videoState = { isPlaying: false, shapes: [], answer: 0 };
let audReactState = { isPlaying: false, targetColor: '', startTime: 0 };
let audSpanState = { isPlaying: false, currentLevel: 3, sequence: [], userIdx: 0 };

const THEMES = {
    animal: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗'],
    fruit: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🌽', '🥕', '🥔', '🍠', '🍄'],
    space: ['🚀', '🛸', '🪐', '🌟', '🌙', '☀️', '🌍', '☄️', '🛰️', '🧑‍🚀', '👽', '🔭', '🔭', '🌌', '🛸', '🛰️', '🌠', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']
};

const SENTENCES = [
    "小猫在阳光下的草地上快乐地打滚。",
    "我们要保持诚实守信的优良品质。",
    "早睡早起能够让我们每天都充满活力。",
    "阅读一本好书能带我们去远方旅行。",
    "失败并不可怕，它是通往成功的阶梯。"
];

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('view-title');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (link.onclick) return;
            const targetView = link.getAttribute('data-view');
            if(!targetView || state.currentView === targetView) return;
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            views.forEach(v => v.classList.remove('active-view'));
            const targetEl = document.getElementById(targetView);
            if(targetEl) targetEl.classList.add('active-view');
            
            const titleSpan = link.querySelector('span:last-child');
            if(titleSpan) viewTitle.textContent = titleSpan.textContent;
            state.currentView = targetView;
            
            stopAllActivities();
            initView(targetView);
        });
    });
}

function initView(viewId) {
    switch(viewId) {
        case 'dashboard': updateDashboard(); break;
        case 'schulte': if(!schulteState.isPlaying) generateSchulteGrid(); break;
        case 'tracker': if(!trackerState.isPlaying) renderTracker(); break;
        case 'vis-speed': initVisSpeed(); break;
        case 'vis-cancel': initVisCancel(); break;
        case 'decoding': initDecoding(); break;
        case 'decoding-conn': initDecodingConn(); break;
        case 'vis-discrim': initVisDiscrim(); break;
        case 'aud-react': initAudReact(); break;
        case 'aud-span': initAudSpan(); break;
        case 'mem-reverse': initMemReverse(); break;
        case 'vis-video': initVisVideo(); break;
        case 'aud-inter': initAudInter(); break;
        case 'mem-repeat': initMemRepeat(); break;
        case 'assessment-wechsler': initAssessmentWechsler(); break;
        case 'stroop': initStroop(); break;
    }
}

function stopAllActivities() {
    if(schulteState.isPlaying) endSchulteGame(false);
    if(trackerState.isPlaying) { trackerState.isPlaying = false; cancelAnimationFrame(trackerState.animationId); }
    if(breathState.isPlaying) stopBreathing();
    if(state.speechEnabled) window.speechSynthesis.cancel();
    if(stroopState.isPlaying) endStroop(false);
    if(decodingState.isPlaying) endDecoding(false);
    if(decodingConnState.isPlaying) endDecodingConn(false);
    if(visDiscrimState.isPlaying) endVisDiscrim(false);
}

// Speech Utility
const Speech = {
    speak: (text, onEnd = null) => {
        if(!state.speechEnabled) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'zh-CN';
        utter.rate = 0.9;
        if(onEnd) utter.onend = onEnd;
        window.speechSynthesis.speak(utter);
    }
};

// Dashboard
function updateDashboard() {
    const schulteBest = localStorage.getItem('focus_schulte_best_5') || '--:--';
    const dsSchulte = document.getElementById('ds-schulte-best');
    if(dsSchulte) dsSchulte.textContent = schulteBest;

    const trackerV = localStorage.getItem('focus_tracker_lvl') || '1';
    const dsTracker = document.getElementById('ds-tracker-best');
    if(dsTracker) dsTracker.textContent = `Lv ${trackerV}`;

    const audSpan = localStorage.getItem('focus_aud_span_best') || '--';
    const dsAudSpan = document.getElementById('ds-aud-span-best');
    if(dsAudSpan) dsAudSpan.textContent = audSpan;

    const breathMins = localStorage.getItem('focus_breath_mins') || '0';
    const dsBreath = document.getElementById('ds-breath-time');
    if(dsBreath) dsBreath.textContent = `${breathMins} 分钟`;
}

// ====== 1. Schulte Grid ======
function generateSchulteGrid() {
    const sGrid = document.getElementById('schulte-grid');
    if(!sGrid) return;
    sGrid.innerHTML = '';
    const size = schulteState.size;
    const theme = document.getElementById('schulte-theme').value;
    sGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    let cellSize = size === 3 ? '100px' : size === 4 ? '110px' : '90px';
    let items = Array.from({length: size*size}, (_, i) => i + 1);
    if (theme !== 'number') {
        const icons = [...THEMES[theme]].sort(() => 0.5 - Math.random());
        schulteState.themeData = items.map(i => icons[i-1]);
    } else {
        schulteState.themeData = items;
    }
    let displayItems = items.map(i => ({ val: i, display: schulteState.themeData[i-1] })).sort(() => Math.random() - 0.5);
    displayItems.forEach(item => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.style.width = cell.style.height = cellSize;
        cell.textContent = item.display;
        cell.addEventListener('mousedown', () => handleCellClick(cell, item.val));
        sGrid.appendChild(cell);
    });
}
function handleCellClick(cell, val) {
    if (!schulteState.isPlaying) return;
    if (val === schulteState.expectedNumber) {
        cell.classList.add('active-hit');
        if (++schulteState.expectedNumber > schulteState.size ** 2) {
            endSchulteGame(true);
        } else {
            document.getElementById('schulte-next').textContent = schulteState.themeData[schulteState.expectedNumber-1];
        }
        setTimeout(() => cell.classList.remove('active-hit'), 200);
    } else {
        cell.classList.add('error-hit');
        schulteState.startTime -= 1000; 
        setTimeout(() => cell.classList.remove('error-hit'), 300);
    }
}
function startSchulteGame() {
    schulteState.isPlaying = true; schulteState.expectedNumber = 1;
    generateSchulteGrid();
    document.getElementById('schulte-next').textContent = schulteState.themeData[0];
    const btn = document.getElementById('schulte-start');
    btn.textContent = '放弃挑战'; btn.classList.replace('primary', 'danger');
    schulteState.startTime = Date.now();
    schulteState.timerInterval = setInterval(() => {
        const timeEl = document.getElementById('schulte-timer');
        if(timeEl) timeEl.textContent = ((Date.now() - schulteState.startTime) / 1000).toFixed(2);
    }, 40);
}
function endSchulteGame(completed) {
    schulteState.isPlaying = false; clearInterval(schulteState.timerInterval);
    const btn = document.getElementById('schulte-start');
    if(btn) { btn.textContent = '开始挑战'; btn.classList.replace('danger', 'primary'); }
    if(completed) {
        const timeEl = document.getElementById('schulte-timer');
        const final = parseFloat(timeEl ? timeEl.textContent : 0);
        const key = `focus_schulte_best_${schulteState.size}`;
        if(final < (parseFloat(localStorage.getItem(key)) || Infinity)) localStorage.setItem(key, final);
        alert(`完成！用时：${final} 秒`);
        updateDashboard();
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
        ctx.save(); ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        let baseColor = this.color;
        if(p==='memorize' && this.isTarget) { baseColor='#00d2ff'; ctx.shadowBlur=25; ctx.shadowColor='#00d2ff'; }
        else if(p==='select' && this.isSelected) { baseColor = this.isCorrect ? '#00ff88' : '#ff4d4d'; ctx.shadowBlur=20; ctx.shadowColor=baseColor; }
        const grad = ctx.createRadialGradient(this.x-this.radius/3, this.y-this.radius/3, this.radius/10, this.x, this.y, this.radius);
        grad.addColorStop(0, '#fff'); grad.addColorStop(0.2, baseColor); grad.addColorStop(1, '#000');
        ctx.fillStyle = grad; ctx.fill(); ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.stroke(); ctx.restore();
    }
    isClicked(mx, my) { return (this.x-mx)**2 + (this.y-my)**2 <= (this.radius*1.5)**2; }
}
function initTrackerGame() {
    resizeCanvas();
    const tCanvas = document.getElementById('tracker-canvas');
    if(!tCanvas) return;
    const w = tCanvas.width, h = tCanvas.height;
    trackerState.numBalls = 4 + Math.floor(trackerState.level/2);
    trackerState.numTargets = 1 + Math.ceil(trackerState.level/3);
    trackerState.balls = []; trackerState.targetIndices = []; trackerState.selectedFound = 0;
    for(let i=0; i<trackerState.numBalls; i++) {
        let r=25, x=r+Math.random()*(w-r*2), y=r+Math.random()*(h-r*2), a=Math.random()*Math.PI*2, s=3+trackerState.level*0.5;
        trackerState.balls.push(new Ball(x, y, Math.cos(a)*s, Math.sin(a)*s, r));
    }
    while(trackerState.targetIndices.length < trackerState.numTargets) {
        let r = Math.floor(Math.random()*trackerState.numBalls);
        if(!trackerState.targetIndices.includes(r)) { trackerState.targetIndices.push(r); trackerState.balls[r].isTarget=true; }
    }
    trackerState.phase = 'memorize'; trackerState.isPlaying = true; document.getElementById('tracker-overlay').classList.add('hidden');
    renderTracker();
    setTimeout(() => {
        if(!trackerState.isPlaying) return; trackerState.phase = 'move';
        setTimeout(() => {
            if(!trackerState.isPlaying) return; trackerState.phase='select';
            document.getElementById('tracker-overlay-title').textContent = '请指出目标';
            document.getElementById('tracker-overlay-desc').textContent = `找到刚才闪烁的 ${trackerState.numTargets} 个球。`;
            document.getElementById('tracker-overlay').classList.remove('hidden'); 
            document.getElementById('tracker-start').style.display='none';
        }, 5000);
    }, 2500);
}
function handleTrackerClick(e) {
    if(trackerState.phase !== 'select') return;
    const canvas = document.getElementById('tracker-canvas');
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    trackerState.balls.forEach(b => {
        if(!b.isSelected && b.isClicked(mx, my)) {
            b.isSelected = true; b.isCorrect = b.isTarget;
            if(b.isCorrect) {
                trackerState.selectedFound++;
                if(trackerState.selectedFound === trackerState.numTargets) {
                    trackerState.level++; setTimeout(() => { alert("太棒了！全部找对！"); initTrackerGame(); }, 500);
                }
            } else {
                trackerState.isPlaying = false;
                setTimeout(() => { alert("遗憾！选错了。"); trackerState.level=1; document.getElementById('tracker-start').style.display='block'; initTrackerGame(); }, 500);
            }
        }
    });
}
function renderTracker() {
    const tCanvas = document.getElementById('tracker-canvas');
    if(!tCanvas || !tCanvas.offsetParent) return;
    const tCtx = tCanvas.getContext('2d');
    tCtx.clearRect(0,0,tCanvas.width,tCanvas.height);
    trackerState.balls.forEach(b => { b.update(tCanvas.width,tCanvas.height); b.draw(tCtx, trackerState.phase); });
    if(trackerState.isPlaying) trackerState.animationId = requestAnimationFrame(renderTracker);
}

// ====== 3. Visual Modules ======
const SYMBOLS = ['☀', '⚡', '❄', '☁', '★', '☕', '⚔', '⚖', '☯', '⚛'];
function initVisSpeed() { visSpeedState.score = 0; visSpeedState.timeLeft = 60; visSpeedState.isPlaying = true; document.getElementById('vis-speed-timer').textContent = '60'; nextVisSpeedRound(); if(visSpeedState.timer) clearInterval(visSpeedState.timer); visSpeedState.timer = setInterval(() => { if(--visSpeedState.timeLeft <= 0) { visSpeedState.isPlaying = false; clearInterval(visSpeedState.timer); alert(`测验结束！得分：${visSpeedState.score}`); updateDashboard(); } document.getElementById('vis-speed-timer').textContent = visSpeedState.timeLeft; }, 1000); }
function nextVisSpeedRound() { const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5); visSpeedState.currentTarget = shuffled[0]; const group = shuffled.slice(1, 6); if(Math.random() > 0.5) group[Math.floor(Math.random() * 5)] = visSpeedState.currentTarget; visSpeedState.currentGroup = group; document.getElementById('vis-speed-target').textContent = visSpeedState.currentTarget; document.getElementById('vis-speed-group').innerHTML = group.map(s => `<span class="search-symbol">${s}</span>`).join(''); }

function initVisCancel() { document.getElementById('vis-cancel-grid').innerHTML = ''; visCancelState.isPlaying = false; document.getElementById('vis-cancel-timer').textContent = '45'; }

// ====== 4. Decoding Connection (译码连线) ======
function initDecodingConn() {
    decodingConnState.isPlaying = false;
    document.getElementById('decoding-conn-timer').textContent = '60';
    document.getElementById('decoding-conn-sequence').textContent = '准备好了吗？';
    const legEl = document.getElementById('decoding-conn-legend');
    legEl.innerHTML = decodingConnState.letters.map((L, i) => `<span>${L}=${i+1}</span>`).join('');
    const grid = document.getElementById('decoding-conn-grid');
    grid.innerHTML = Array.from({length:9}, (_, i) => `<button class="btn glass num-btn" data-num="${i+1}">${i+1}</button>`).join('');
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.onclick = () => {
            if(!decodingConnState.isPlaying) return;
            const num = parseInt(btn.getAttribute('data-num'));
            const expectedNum = decodingConnState.legend[decodingConnState.targetSeq[decodingConnState.currentIndex]];
            if(num === expectedNum) {
                decodingConnState.currentIndex++;
                updateDecodingConnSeqDisplay();
                if(decodingConnState.currentIndex === decodingConnState.targetSeq.length) {
                    decodingConnState.score++; nextDecodingConnRound();
                }
            } else {
                decodingConnState.timeLeft -= 2;
                btn.style.background = 'rgba(218,54,51,0.5)';
                setTimeout(() => btn.style.background = '', 300);
            }
        };
    });
}
function startDecodingConn() {
    decodingConnState.isPlaying = true; decodingConnState.score = 0; decodingConnState.timeLeft = 60;
    decodingConnState.letters.forEach((L, i) => decodingConnState.legend[L] = i+1);
    document.getElementById('decoding-conn-start').textContent = '放弃挑战';
    nextDecodingConnRound();
    decodingConnState.timer = setInterval(() => {
        if(--decodingConnState.timeLeft <= 0) endDecodingConn(true);
        document.getElementById('decoding-conn-timer').textContent = decodingConnState.timeLeft;
    }, 1000);
}
function nextDecodingConnRound() {
    decodingConnState.targetSeq = Array.from({length: 6}, () => decodingConnState.letters[Math.floor(Math.random()*9)]);
    decodingConnState.currentIndex = 0;
    updateDecodingConnSeqDisplay();
}
function updateDecodingConnSeqDisplay() {
    const el = document.getElementById('decoding-conn-sequence');
    el.innerHTML = decodingConnState.targetSeq.map((char, i) => 
        `<span style="${i < decodingConnState.currentIndex ? 'opacity:0.3; text-decoration:line-through;' : 'color:#58a6ff'}">${char}</span>`
    ).join(' ');
}
function endDecodingConn(completed) {
    decodingConnState.isPlaying = false; clearInterval(decodingConnState.timer);
    document.getElementById('decoding-conn-start').textContent = '开始挑战';
    if(completed) alert(`结束！成功完成 ${decodingConnState.score} 组序列`);
}

// ====== 5. Decoding Operation ======
const DECODE_SYMBOLS = ['△', '☆', '○', '□', '◇', '▽', '⬔', '⬓'];
function initDecoding() {
    decodingState.isPlaying = false;
    document.getElementById('decoding-timer').textContent = '60';
    document.getElementById('decoding-input').disabled = true;
    document.getElementById('decoding-input').value = '';
    document.getElementById('decoding-expr').textContent = '准备好了吗？';
    const legendEl = document.getElementById('decoding-legend');
    legendEl.innerHTML = DECODE_SYMBOLS.slice(0, 5).map((s, i) => `<span>${s} = ${i+1}</span>`).join('');
}
function startDecoding() {
    decodingState.isPlaying = true; decodingState.score = 0; decodingState.timeLeft = 60;
    const btn = document.getElementById('decoding-start'); btn.textContent = '放弃挑战';
    const inp = document.getElementById('decoding-input'); inp.disabled = false; inp.value = ''; inp.focus();
    DECODE_SYMBOLS.slice(0, 5).forEach((s, i) => decodingState.legend[s] = i+1);
    nextDecodingRound();
    decodingState.timer = setInterval(() => {
        if(--decodingState.timeLeft <= 0) endDecoding(true);
        document.getElementById('decoding-timer').textContent = decodingState.timeLeft;
    }, 1000);
}
function nextDecodingRound() {
    const syms = Object.keys(decodingState.legend);
    const s1 = syms[Math.floor(Math.random()*syms.length)], s2 = syms[Math.floor(Math.random()*syms.length)];
    const op = Math.random() > 0.5 ? '+' : '-';
    decodingState.currentAns = op === '+' ? (decodingState.legend[s1] + decodingState.legend[s2]) : (decodingState.legend[s1] - decodingState.legend[s2]);
    document.getElementById('decoding-expr').textContent = `${s1} ${op} ${s2} = `;
    document.getElementById('decoding-input').value = '';
}
function endDecoding(completed) {
    decodingState.isPlaying = false; clearInterval(decodingState.timer);
    document.getElementById('decoding-start').textContent = '开始挑战';
    document.getElementById('decoding-input').disabled = true;
    if(completed) alert(`结束！得分：${decodingState.score}`);
}

// ====== 6. Visual Discrimination (Concentric) ======
const GAPS = ['T', 'B', 'L', 'R'];
function drawConcentric(ctx, x, y, size, gaps) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    for(let i=0; i<3; i++) {
        const r = size * (0.3 + i*0.25);
        ctx.beginPath();
        const start = gaps[i] === 'R' ? 0.3 : gaps[i] === 'B' ? 1.8 : gaps[i] === 'L' ? 3.3 : 4.8;
        ctx.arc(x, y, r, start, start + 5.8);
        ctx.stroke();
    }
}
function initVisDiscrim() {
    visDiscrimState.isPlaying = false;
    document.getElementById('vis-discrim-timer').textContent = '45';
    document.getElementById('discrim-grid').innerHTML = '';
    const ctx = document.getElementById('discrim-target-canvas').getContext('2d');
    ctx.clearRect(0,0,120,120);
}
function startVisDiscrim() {
    visDiscrimState.isPlaying = true; visDiscrimState.score = 0; visDiscrimState.timeLeft = 45;
    document.getElementById('vis-discrim-start').textContent = '放弃挑战';
    visDiscrimState.targetGaps = Array.from({length:3}, () => GAPS[Math.floor(Math.random()*4)]);
    const tCtx = document.getElementById('discrim-target-canvas').getContext('2d');
    tCtx.clearRect(0,0,120,120); drawConcentric(tCtx, 60, 60, 40, visDiscrimState.targetGaps);
    
    const grid = document.getElementById('discrim-grid'); grid.innerHTML = '';
    for(let i=0; i<40; i++) {
        const isMatch = Math.random() > 0.8;
        const gaps = isMatch ? [...visDiscrimState.targetGaps] : Array.from({length:3}, () => GAPS[Math.floor(Math.random()*4)]);
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 60;
        drawConcentric(canvas.getContext('2d'), 30, 30, 20, gaps);
        canvas.onclick = () => {
            if(!visDiscrimState.isPlaying || canvas.classList.contains('selected')) return;
            canvas.classList.add('selected');
            if(isMatch) { visDiscrimState.score++; canvas.style.background = 'rgba(46,160,67,0.3)'; }
            else { visDiscrimState.timeLeft -= 3; canvas.style.background = 'rgba(218,54,51,0.3)'; }
        };
        grid.appendChild(canvas);
    }
    visDiscrimState.timer = setInterval(() => {
        if(--visDiscrimState.timeLeft <= 0) endVisDiscrim(true);
        document.getElementById('vis-discrim-timer').textContent = visDiscrimState.timeLeft;
    }, 1000);
}
function endVisDiscrim(completed) {
    visDiscrimState.isPlaying = false; clearInterval(visDiscrimState.timer);
    document.getElementById('vis-discrim-start').textContent = '开始寻找';
    if(completed) alert(`结束！得分：${visDiscrimState.score}`);
}

// ====== 7. Stroop Test ======
const STROOP_DATA = [{text:'红色',color:'red'},{text:'蓝色',color:'blue'},{text:'绿色',color:'green'},{text:'黄色',color:'yellow'}];
function initStroop() { stroopState.isPlaying = false; document.getElementById('stroop-timer').textContent = '30'; }
function nextStroopRound() {
    const word = STROOP_DATA[Math.floor(Math.random()*4)], color = STROOP_DATA[Math.floor(Math.random()*4)];
    stroopState.currentCorrect = color.color;
    const el = document.getElementById('stroop-word'); el.textContent = word.text;
    const colorsMap = {red:'#ff4d4d', blue:'#40c4ff', green:'#2ea043', yellow:'#ffeb3b'};
    el.style.color = colorsMap[color.color];
}
function endStroop(completed) { stroopState.isPlaying = false; clearInterval(stroopState.timer); if(completed) alert(`结束！得分：${stroopState.score}`); document.getElementById('stroop-start').textContent = '开始挑战'; }

// ====== 8. Global Initialization ======
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation(); updateDashboard(); resizeCanvas(); window.addEventListener('resize', resizeCanvas);
    document.getElementById('schulte-start').onclick = () => schulteState.isPlaying ? endSchulteGame(false) : startSchulteGame();
    document.getElementById('schulte-theme').onchange = () => { stopAllActivities(); generateSchulteGrid(); };
    document.getElementById('schulte-size').onchange = (e) => { stopAllActivities(); schulteState.size = parseInt(e.target.value); generateSchulteGrid(); };
    document.getElementById('tracker-start').onclick = initTrackerGame;
    document.getElementById('tracker-canvas').onmousedown = handleTrackerClick;
    document.getElementById('vis-speed-yes').onclick = () => { if(visSpeedState.isPlaying) { const w = visSpeedState.currentGroup.includes(visSpeedState.currentTarget); if(w) visSpeedState.score++; else visSpeedState.timeLeft -= 2; nextVisSpeedRound(); } };
    document.getElementById('vis-speed-no').onclick = () => { if(visSpeedState.isPlaying) { const w = visSpeedState.currentGroup.includes(visSpeedState.currentTarget); if(!w) visSpeedState.score++; else visSpeedState.timeLeft -= 2; nextVisSpeedRound(); } };
    
    document.getElementById('vis-cancel-theme').onchange = () => { initVisCancel(); };
    document.getElementById('vis-cancel-start').onclick = () => {
        const g = document.getElementById('vis-cancel-grid'), th = document.getElementById('vis-cancel-theme').value;
        g.innerHTML = ''; visCancelState.isPlaying = true; visCancelState.score = 0; visCancelState.timeLeft = 45;
        let pool = th === 'letter' ? ['p','b','d','q'] : THEMES[th].slice(0, 4);
        visCancelState.currentTargetChar = pool[0]; document.getElementById('vis-cancel-target-char').textContent = visCancelState.currentTargetChar;
        for(let i=0; i<200; i++) {
            const char = pool[Math.floor(Math.random()*pool.length)];
            const cell = document.createElement('div'); cell.className = 'cancel-cell'; cell.textContent = char;
            cell.onclick = () => { if(visCancelState.isPlaying && char === visCancelState.currentTargetChar && !cell.classList.contains('selected')) { cell.classList.add('selected'); visCancelState.score++; } };
            g.appendChild(cell);
        }
        clearInterval(visCancelState.timer); visCancelState.timer = setInterval(() => { if(--visCancelState.timeLeft <= 0) { clearInterval(visCancelState.timer); visCancelState.isPlaying = false; alert(`结束！找到 ${visCancelState.score} 个目标`); updateDashboard(); } document.getElementById('vis-cancel-timer').textContent = visCancelState.timeLeft; }, 1000);
    };

    document.getElementById('decoding-conn-start').onclick = () => decodingConnState.isPlaying ? endDecodingConn(false) : startDecodingConn();

    document.getElementById('decoding-start').onclick = () => decodingState.isPlaying ? endDecoding(false) : startDecoding();
    document.getElementById('decoding-input').oninput = (e) => {
        if(!decodingState.isPlaying) return;
        if(parseInt(e.target.value) === decodingState.currentAns) { decodingState.score++; nextDecodingRound(); }
    };
    document.getElementById('vis-discrim-start').onclick = () => visDiscrimState.isPlaying ? endVisDiscrim(false) : startVisDiscrim();
    document.getElementById('stroop-start').onclick = () => {
        if(stroopState.isPlaying) return endStroop(false);
        stroopState.isPlaying = true; stroopState.score = 0; stroopState.timeLeft = 30; document.getElementById('stroop-start').textContent = '放弃挑战'; nextStroopRound();
        stroopState.timer = setInterval(() => { if(--stroopState.timeLeft <= 0) endStroop(true); document.getElementById('stroop-timer').textContent = stroopState.timeLeft; }, 1000);
    };
    document.querySelectorAll('.stroop-option').forEach(btn => { btn.onclick = () => { if(!stroopState.isPlaying) return; if(btn.getAttribute('data-color') === stroopState.currentCorrect) stroopState.score++; else stroopState.timeLeft -= 3; nextStroopRound(); }; });
});

function resizeCanvas() {
    const c = document.getElementById('tracker-canvas'), v = document.getElementById('video-canvas');
    if(c) { c.width = c.clientWidth; c.height = c.clientHeight; }
    if(v) { v.width = v.parentElement.clientWidth || 800; v.height = v.parentElement.clientHeight || 450; }
}
