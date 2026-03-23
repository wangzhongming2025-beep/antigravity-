// ====== 0. Global State & Infrastructure ======
const state = {
    currentView: 'dashboard',
    speechEnabled: 'speechSynthesis' in window
};

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
    if(stroopState.isPlaying) endStroop(completed=false);
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
let schulteState = { isPlaying: false, expectedNumber: 1, size: 5, timerInterval: null, startTime: 0, themeData: [] };
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
        document.getElementById('schulte-timer').textContent = ((Date.now() - schulteState.startTime) / 1000).toFixed(2);
    }, 40);
}
function endSchulteGame(completed) {
    schulteState.isPlaying = false; clearInterval(schulteState.timerInterval);
    const btn = document.getElementById('schulte-start');
    if(btn) { btn.textContent = '开始挑战'; btn.classList.replace('danger', 'primary'); }
    if(completed) {
        const final = parseFloat(document.getElementById('schulte-timer').textContent);
        const key = `focus_schulte_best_${schulteState.size}`;
        if(final < (parseFloat(localStorage.getItem(key)) || Infinity)) localStorage.setItem(key, final);
        alert(`完成！用时：${final} 秒`);
        updateDashboard();
    }
}

// ====== 2. Dynamic Tracker (Aesthetic Upgrade) ======
let trackerState = { isPlaying: false, score: 0, level: 1, balls: [], targetIndices: [], numBalls: 5, numTargets: 2, phase: 'idle', animationId: null, selectedFound: 0 };
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
            b.isSelected = true;
            b.isCorrect = b.isTarget;
            if(b.isCorrect) {
                trackerState.selectedFound++;
                if(trackerState.selectedFound === trackerState.numTargets) {
                    trackerState.score++; trackerState.level++; 
                    setTimeout(() => { alert("太棒了！全部找对！"); initTrackerGame(); }, 500);
                }
            } else {
                trackerState.isPlaying = false;
                setTimeout(() => { alert("遗憾！选错了。"); trackerState.level=1; trackerState.score=0; document.getElementById('tracker-start').style.display='block'; initTrackerGame(); }, 500);
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
let visSpeedState = { isPlaying: false, score: 0, timeLeft: 60, timer: null, currentTarget: '', currentGroup: [] };
const SYMBOLS = ['☀', '⚡', '❄', '☁', '★', '☕', '⚔', '⚖', '☯', '⚛'];
function initVisSpeed() {
    visSpeedState.score = 0; visSpeedState.timeLeft = 60;
    visSpeedState.isPlaying = true; document.getElementById('vis-speed-timer').textContent = '60';
    nextVisSpeedRound();
    if(visSpeedState.timer) clearInterval(visSpeedState.timer);
    visSpeedState.timer = setInterval(() => {
        if(--visSpeedState.timeLeft <= 0) {
            visSpeedState.isPlaying = false; clearInterval(visSpeedState.timer);
            alert(`测验结束！得分：${visSpeedState.score}`);
            updateDashboard();
        }
        document.getElementById('vis-speed-timer').textContent = visSpeedState.timeLeft;
    }, 1000);
}
function nextVisSpeedRound() {
    const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
    visSpeedState.currentTarget = shuffled[0];
    const group = shuffled.slice(1, 6);
    if(Math.random() > 0.5) group[Math.floor(Math.random() * 5)] = visSpeedState.currentTarget;
    visSpeedState.currentGroup = group;
    document.getElementById('vis-speed-target').textContent = visSpeedState.currentTarget;
    document.getElementById('vis-speed-group').innerHTML = group.map(s => `<span class="search-symbol">${s}</span>`).join('');
}

let visCancelState = { isPlaying: false, score: 0, timeLeft: 45, timer: null, currentTargetChar: '' };
function initVisCancel() {
    document.getElementById('vis-cancel-grid').innerHTML = ''; visCancelState.isPlaying = false;
    document.getElementById('vis-cancel-timer').textContent = '45';
}

// ====== 4. Stroop Test ======
let stroopState = { isPlaying: false, score: 0, timeLeft: 30, timer: null, currentCorrect: '' };
const STROOP_DATA = [{text:'红色',color:'red'},{text:'蓝色',color:'blue'},{text:'绿色',color:'green'},{text:'黄色',color:'yellow'}];
function initStroop() { stroopState.isPlaying = false; document.getElementById('stroop-timer').textContent = '30'; }
function nextStroopRound() {
    const word = STROOP_DATA[Math.floor(Math.random()*4)], color = STROOP_DATA[Math.floor(Math.random()*4)];
    stroopState.currentCorrect = color.color;
    const el = document.getElementById('stroop-word'); el.textContent = word.text;
    const colorsMap = {red:'#ff4d4d', blue:'#40c4ff', green:'#2ea043', yellow:'#ffeb3b'};
    el.style.color = colorsMap[color.color];
}
function endStroop(completed) {
    stroopState.isPlaying = false; clearInterval(stroopState.timer);
    if(completed) alert(`结束！得分：${stroopState.score}`);
    document.getElementById('stroop-start').textContent = '开始挑战';
}

// ====== 5. Video Discrimination ======
let videoState = { isPlaying: false, shapes: [], answer: 0 };
function initVisVideo() { document.getElementById('video-overlay').classList.remove('hidden'); document.getElementById('video-question-box').classList.add('hidden'); }

// ====== 6. Auditory & Wechsler ======
let audReactState = { isPlaying: false, targetColor: '', startTime: 0 };
function initAudReact() { audReactState.isPlaying = false; }
let audSpanState = { isPlaying: false, currentLevel: 3, sequence: [], userIdx: 0 };
function initAudSpan() { audSpanState.isPlaying = false; document.getElementById('aud-span-input-box').classList.add('hidden'); }
function initAssessmentWechsler() {
    const s = localStorage.getItem('focus_schulte_best_5'), a = localStorage.getItem('focus_aud_span_best');
    if(s) document.getElementById('wec-vis-score').textContent = s + "s";
    if(a) document.getElementById('wec-aud-score').textContent = a + "级";
    if(s && a) {
        const iq = Math.round(90 + (parseInt(a)*5) + (100 / parseFloat(s) * 10));
        document.getElementById('wec-iq-score').textContent = iq;
        document.getElementById('wec-advice').textContent = `评估状态：${iq > 115 ? '优秀' : iq > 95 ? '良好' : '均衡进步中'}。`;
    }
}

// ====== 7. Breathing ======
let breathState = { isPlaying: false, interval: null, totalSeconds: 0 };
function stopBreathing() {
    breathState.isPlaying = false; clearTimeout(breathState.interval); 
    document.getElementById('breathing-start').textContent = '开始呼吸';
    let mins = Math.floor(breathState.totalSeconds / 60);
    if(mins > 0) localStorage.setItem('focus_breath_mins', (parseInt(localStorage.getItem('focus_breath_mins')||0)) + mins);
    updateDashboard();
}

// ====== 8. Global Initialization ======
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation(); updateDashboard(); resizeCanvas(); window.addEventListener('resize', resizeCanvas);
    document.getElementById('schulte-start').onclick = () => schulteState.isPlaying ? endSchulteGame(false) : startSchulteGame();
    document.getElementById('schulte-theme').onchange = () => { if(!schulteState.isPlaying) generateSchulteGrid(); };
    document.getElementById('schulte-size').onchange = (e) => { schulteState.size = parseInt(e.target.value); generateSchulteGrid(); };
    document.getElementById('tracker-start').onclick = initTrackerGame;
    document.getElementById('tracker-canvas').onmousedown = handleTrackerClick;
    document.getElementById('vis-speed-yes').onclick = () => { if(visSpeedState.isPlaying) { const w = visSpeedState.currentGroup.includes(visSpeedState.currentTarget); if(w) visSpeedState.score++; else visSpeedState.timeLeft -= 2; nextVisSpeedRound(); } };
    document.getElementById('vis-speed-no').onclick = () => { if(visSpeedState.isPlaying) { const w = visSpeedState.currentGroup.includes(visSpeedState.currentTarget); if(!w) visSpeedState.score++; else visSpeedState.timeLeft -= 2; nextVisSpeedRound(); } };
    document.getElementById('vis-cancel-start').onclick = () => {
        const g = document.getElementById('vis-cancel-grid'), th = document.getElementById('vis-cancel-theme').value;
        g.innerHTML = ''; visCancelState.isPlaying = true; visCancelState.score = 0; visCancelState.timeLeft = 45;
        let pool = th === 'letter' ? ['p','b','d','q'] : THEMES[th].slice(0, 4);
        visCancelState.currentTargetChar = pool[0];
        document.getElementById('vis-cancel-target-char').textContent = visCancelState.currentTargetChar;
        for(let i=0; i<200; i++) {
            const char = pool[Math.floor(Math.random()*pool.length)];
            const cell = document.createElement('div'); cell.className = 'cancel-cell'; cell.textContent = char;
            cell.onclick = () => { if(visCancelState.isPlaying && char === visCancelState.currentTargetChar && !cell.classList.contains('selected')) { cell.classList.add('selected'); visCancelState.score++; } };
            g.appendChild(cell);
        }
        clearInterval(visCancelState.timer);
        visCancelState.timer = setInterval(() => { if(--visCancelState.timeLeft <= 0) { clearInterval(visCancelState.timer); visCancelState.isPlaying = false; alert(`结束！找到 ${visCancelState.score} 个目标`); updateDashboard(); } document.getElementById('vis-cancel-timer').textContent = visCancelState.timeLeft; }, 1000);
    };
    document.getElementById('stroop-start').onclick = () => {
        if(stroopState.isPlaying) return endStroop(false);
        stroopState.isPlaying = true; stroopState.score = 0; stroopState.timeLeft = 30;
        document.getElementById('stroop-start').textContent = '放弃挑战'; nextStroopRound();
        stroopState.timer = setInterval(() => { if(--stroopState.timeLeft <= 0) endStroop(true); document.getElementById('stroop-timer').textContent = stroopState.timeLeft; }, 1000);
    };
    document.querySelectorAll('.stroop-option').forEach(btn => {
        btn.onclick = () => { if(!stroopState.isPlaying) return; if(btn.getAttribute('data-color') === stroopState.currentCorrect) stroopState.score++; else stroopState.timeLeft -= 3; nextStroopRound(); };
    });
    document.getElementById('video-start').onclick = () => {
        document.getElementById('video-overlay').classList.add('hidden'); videoState.isPlaying = true;
        const c = ['#da3633', '#40c4ff', '#2ea043'], t = ['rect', 'circle'];
        const tc = c[Math.floor(Math.random()*3)], tt = t[Math.floor(Math.random()*2)];
        videoState.shapes = []; let count = 0; const vCanvas = document.getElementById('video-canvas'), vCtx = vCanvas.getContext('2d');
        for(let i=0; i<8; i++) {
            const curC = c[Math.floor(Math.random()*3)], curT = t[Math.floor(Math.random()*2)];
            if(curC===tc && curT===tt) count++;
            videoState.shapes.push({x: Math.random()*vCanvas.width, y: Math.random()*vCanvas.height, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, c:curC, t:curT, size: 30+Math.random()*20});
        }
        videoState.answer = count; let start = Date.now();
        const anim = () => {
            if(!videoState.isPlaying) return; vCtx.clearRect(0,0,vCanvas.width,vCanvas.height);
            videoState.shapes.forEach(s => { s.x += s.vx; s.y += s.vy; if(s.x<0 || s.x>vCanvas.width) s.vx*=-1; if(s.y<0 || s.y>vCanvas.height) s.vy*=-1; vCtx.fillStyle = s.c; vCtx.beginPath(); if(s.t==='rect') vCtx.fillRect(s.x, s.y, s.size, s.size); else { vCtx.arc(s.x, s.y, s.size/2, 0, Math.PI*2); vCtx.fill(); } });
            if(Date.now()-start < 4000) requestAnimationFrame(anim);
            else {
                videoState.isPlaying = false; vCtx.clearRect(0,0,vCanvas.width,vCanvas.height);
                document.getElementById('video-question-box').classList.remove('hidden');
                document.getElementById('video-question').textContent = `出现了几个 ${tc==='#da3633'?'红色':tc==='#40c4ff'?'蓝色':'绿色'} 的 ${tt==='rect'?'正方形':'圆形'}？`;
                const o = document.getElementById('video-options'); o.innerHTML = '';
                [count, count+1, Math.max(0, count-1)].sort(()=>Math.random()-0.5).forEach(opt => { const b = document.createElement('button'); b.className = 'btn glass'; b.textContent = opt; b.onclick = () => { alert(opt===count?"正确！":"错误！"); initVisVideo(); }; o.appendChild(b); });
            }
        }; anim();
    };
    document.getElementById('aud-react-start').onclick = () => {
        audReactState.isPlaying = true; document.getElementById('aud-react-start').disabled = true;
        setTimeout(() => { const c = ['red', 'blue', 'green'][Math.floor(Math.random()*3)]; audReactState.targetColor = c; Speech.speak(c==='red'?'红色':c==='blue'?'蓝色':'绿色', () => { audReactState.startTime = Date.now(); }); }, 1000 + Math.random()*2000);
    };
    document.querySelectorAll('.btn-circle').forEach(b => {
        b.onclick = () => {
            if(!audReactState.isPlaying || !audReactState.startTime) return;
            if(b.getAttribute('data-color') === audReactState.targetColor) alert(`正确！用时 ${Date.now()-audReactState.startTime}ms`); else alert("选错了！");
            audReactState.isPlaying = false; audReactState.startTime = 0; document.getElementById('aud-react-start').disabled = false;
        };
    });
    document.getElementById('aud-span-start').onclick = () => {
        audSpanState.isPlaying = true; document.getElementById('aud-span-start').classList.add('hidden');
        audSpanState.sequence = Array.from({length: audSpanState.currentLevel}, () => Math.floor(Math.random()*10));
        let i = 0; const iv = setInterval(() => { if(i < audSpanState.sequence.length) Speech.speak(audSpanState.sequence[i++].toString()); else { clearInterval(iv); setTimeout(() => { document.getElementById('aud-span-input-box').classList.remove('hidden'); const inp = document.getElementById('aud-span-input'); inp.value = ''; inp.focus(); }, 1000); } }, 1200);
    };
    document.getElementById('aud-span-submit').onclick = () => {
        if(document.getElementById('aud-span-input').value === audSpanState.sequence.join('')) { audSpanState.currentLevel++; alert("正确！"); document.getElementById('aud-span-input-box').classList.add('hidden'); document.getElementById('aud-span-start').classList.remove('hidden'); }
        else { alert(`失败！得分 ${audSpanState.currentLevel-1}`); localStorage.setItem('focus_aud_span_best', Math.max(audSpanState.currentLevel-1, parseInt(localStorage.getItem('focus_aud_span_best')||0))); audSpanState.currentLevel = 3; initAudSpan(); document.getElementById('aud-span-start').classList.remove('hidden'); updateDashboard(); }
    };
    document.getElementById('mem-rev-start').onclick = () => {
        const w = ['苹果','大海','蓝天','森林','书本'][Math.floor(Math.random()*5)];
        Speech.speak(w, () => { const inp = document.getElementById('mem-rev-input'); inp.disabled = false; inp.value = ''; inp.focus(); inp.onkeypress = (e) => { if(e.key==='Enter') { if(inp.value === w.split('').reverse().join('')) alert("全对！"); else alert("不正确！"); initMemReverse(); } }; });
    };
    document.getElementById('aud-inter-start').onclick = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        const target = Array.from({length: 4}, () => Math.floor(Math.random()*10)).join('');
        document.getElementById('aud-inter-start').classList.add('hidden'); osc.start(); Speech.speak(target, () => { osc.stop(); document.getElementById('aud-inter-input-box').classList.remove('hidden'); const inp = document.getElementById('aud-inter-input'); inp.value = ''; inp.focus(); inp.onkeypress = (e) => { if (e.key === 'Enter') { if (inp.value === target) alert("正确！"); else alert("失败！"); initAudInter(); } }; });
        document.getElementById('aud-inter-submit').onclick = () => { if(document.getElementById('aud-inter-input').value === target) alert("正确！"); else alert("失败！"); initAudInter(); };
    };
    document.getElementById('mem-repeat-start').onclick = () => {
        const target = SENTENCES[Math.floor(Math.random()*SENTENCES.length)];
        document.getElementById('mem-repeat-start').classList.add('hidden');
        Speech.speak(target, () => { document.getElementById('mem-repeat-input-box').classList.remove('hidden'); const inp = document.getElementById('mem-repeat-input'); inp.value = ''; inp.focus(); });
        document.getElementById('mem-repeat-submit').onclick = () => { if(document.getElementById('mem-repeat-input').value.trim() === target) alert("全对！"); else alert("有偏误！"); initMemRepeat(); };
    };
    document.getElementById('wec-run').onclick = () => { initAssessmentWechsler(); alert("评估报告已刷新！"); };
    document.getElementById('breathing-start').onclick = () => {
        if(breathState.isPlaying) stopBreathing();
        else {
            breathState.isPlaying = true; document.getElementById('breathing-start').textContent = '停止';
            const cycle = () => {
                if(!breathState.isPlaying) return;
                const c = document.getElementById('b-circle'), t = document.getElementById('b-instruction');
                t.textContent = '吸气...'; c.className = 'b-circle glass inhale';
                breathState.interval = setTimeout(() => { t.textContent = '呼气...'; c.className = 'b-circle glass exhale'; breathState.interval = setTimeout(() => { breathState.totalSeconds += 8; cycle(); }, 4000); }, 4000);
            }; cycle();
        }
    };
});
