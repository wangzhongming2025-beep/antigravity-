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
let stroopState = { isPlaying: false, score: 0, timeLeft: 30, timer: null, currentCorrect: '' };
let breathState = { isPlaying: false, interval: null, totalSeconds: 0 };

const THEMES = {
    animal: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗'],
    fruit: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🌽', '🥕', '🥔', '🍠', '🍄'],
    space: ['🚀', '🛸', '🪐', '🌟', '🌙', '☀️', '🌍', '☄️', '🛰️', '🧑‍🚀', '👽', '🔭', '🔭', '🌌', '🛸', '🛰️', '🌠', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']
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

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('view-title');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
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
        case 'tracker': if(!trackerState.isPlaying) { resizeCanvas(); initTrackerGame(false); } break;
        case 'vis-speed': initVisSpeed(); break;
        case 'vis-cancel': initVisCancel(); break;
        case 'decoding': initDecoding(); break;
        case 'decoding-conn': initDecodingConn(); break;
        case 'space-decoding': initSpaceDecoding(); break;
        case 'vis-discrim': initVisDiscrim(); break;
        case 'aud-react': initAudReact(); break;
        case 'aud-span': initAudSpan(); break;
        case 'assessment-wechsler': initAssessmentWechsler(); break;
        case 'stroop': initStroop(); break;
    }
}

function stopAllActivities() {
    if(schulteState.isPlaying) endSchulteGame(false);
    if(trackerState.isPlaying) { trackerState.isPlaying = false; cancelAnimationFrame(trackerState.animationId); }
    if(stroopState.isPlaying) endStroop(false);
    if(decodingState.isPlaying) endDecoding(false);
    if(decodingConnState.isPlaying) endDecodingConn(false);
    if(spaceDecodingState.isPlaying) endSpaceDecoding(false);
    if(visDiscrimState.isPlaying) endVisDiscrim(false);
    if(state.speechEnabled) window.speechSynthesis.cancel();
}

// Dashboard
function updateDashboard() {
    const schulteBest = localStorage.getItem('focus_schulte_best_5') || '--:--';
    const dsSchulte = document.getElementById('ds-schulte-best');
    if(dsSchulte) dsSchulte.textContent = schulteBest;
    const trackerV = localStorage.getItem('focus_tracker_lvl') || '1';
    const dsTracker = document.getElementById('ds-tracker-best');
    if(dsTracker) dsTracker.textContent = `Lv ${trackerV}`;
}

// ====== 1. Schulte Grid ======
function generateSchulteGrid() {
    const sGrid = document.getElementById('schulte-grid');
    if(!sGrid) return;
    sGrid.innerHTML = '';
    const size = schulteState.size;
    const theme = document.getElementById('schulte-theme').value;
    sGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
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
    } else {
        cell.classList.add('error-hit');
        schulteState.startTime -= 1000; 
        setTimeout(() => cell.classList.remove('error-hit'), 300);
    }
}
function startSchulteGame() {
    schulteState.isPlaying = true; schulteState.expectedNumber = 1; generateSchulteGrid();
    document.getElementById('schulte-next').textContent = schulteState.themeData[0];
    const btn = document.getElementById('schulte-start'); btn.textContent = '放弃挑战'; btn.classList.replace('primary', 'danger');
    schulteState.startTime = Date.now();
    schulteState.timerInterval = setInterval(() => {
        const timeEl = document.getElementById('schulte-timer');
        if(timeEl) timeEl.textContent = ((Date.now() - schulteState.startTime) / 1000).toFixed(2);
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
        ctx.save(); ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        let baseColor = this.color;
        if(p==='memorize' && this.isTarget) { baseColor='#00d2ff'; ctx.shadowBlur=25; ctx.shadowColor='#00d2ff'; }
        else if(p==='select' && this.isSelected) { baseColor = this.isCorrect ? '#00ff88' : '#ff4d4d'; ctx.shadowBlur=20; ctx.shadowColor=baseColor; }
        const grad = ctx.createRadialGradient(this.x-this.radius/3, this.y-this.radius/3, this.radius/10, this.x, this.y, this.radius);
        grad.addColorStop(0, '#fff'); grad.addColorStop(0.2, baseColor); grad.addColorStop(1, '#000');
        ctx.fillStyle = grad; ctx.fill(); ctx.restore();
    }
    isClicked(mx, my) { return (this.x-mx)**2 + (this.y-my)**2 <= (this.radius*1.5)**2; }
}
function initTrackerGame(start = true) {
    const tCanvas = document.getElementById('tracker-canvas'); if(!tCanvas) return;
    resizeCanvas();
    const w = tCanvas.width || 800, h = tCanvas.height || 450;
    trackerState.numBalls = 4 + Math.floor(trackerState.level/2);
    trackerState.numTargets = 1 + Math.ceil(trackerState.level/3);
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
            document.getElementById('tracker-overlay').classList.remove('hidden'); 
            document.getElementById('tracker-start').style.display='none';
        }, 6000);
    }, 2500);
}
function renderTracker() {
    const tCanvas = document.getElementById('tracker-canvas');
    if(!tCanvas) return;
    const tCtx = tCanvas.getContext('2d');
    tCtx.clearRect(0,0,tCanvas.width,tCanvas.height);
    trackerState.balls.forEach(b => { b.update(tCanvas.width,tCanvas.height); b.draw(tCtx, trackerState.phase); });
    if(trackerState.isPlaying || trackerState.phase === 'idle') {
        trackerState.animationId = requestAnimationFrame(renderTracker);
    }
}

// ====== 3. Space Decoding (Phase 10) ======
function initSpaceDecoding() {
    spaceDecodingState.isPlaying = false;
    document.getElementById('space-decoding-timer').textContent = '120';
    document.getElementById('space-input').disabled = true;
    document.getElementById('space-input').value = '';
    const legEl = document.getElementById('space-legend');
    let html = '<table style="width:100%; border-collapse:collapse; text-align:center; table-layout:fixed;"><tr><td style="border:1px solid #444;"></td>';
    SPACE_CONFIG.colors.forEach(c => html += `<td style="border:1px solid #444; background:${c}; height:30px;"></td>`);
    html += '</tr>';
    SPACE_CONFIG.shapes.forEach((s, ri) => {
        html += `<tr><td style="border:1px solid #444; font-size:1.5rem; padding:10px;">${s}</td>`;
        SPACE_CONFIG.mapping[ri].forEach(v => html += `<td style="border:1px solid #444; padding:10px; font-weight:bold;">${v}</td>`);
        html += '</tr>';
    });
    html += '</table>';
    legEl.innerHTML = html;
    document.getElementById('space-target-seq').textContent = '准备好了吗？';
}
function startSpaceDecoding() {
    spaceDecodingState.isPlaying = true; spaceDecodingState.score = 0; spaceDecodingState.timeLeft = 120;
    document.getElementById('space-start').textContent = '放弃挑战';
    const inp = document.getElementById('space-input'); inp.disabled = false; inp.value = ''; inp.focus();
    nextSpaceDecodingRound();
    spaceDecodingState.timer = setInterval(() => {
        if(--spaceDecodingState.timeLeft <= 0) endSpaceDecoding(true);
        document.getElementById('space-decoding-timer').textContent = spaceDecodingState.timeLeft;
    }, 1000);
}
function nextSpaceDecodingRound() {
    spaceDecodingState.targetSeq = Array.from({length: 6}, () => {
        const ri = Math.floor(Math.random()*4), ci = Math.floor(Math.random()*8);
        return { ri, ci, char: SPACE_CONFIG.mapping[ri][ci] };
    });
    spaceDecodingState.currentIndex = 0;
    const seqEl = document.getElementById('space-target-seq'); seqEl.innerHTML = '';
    spaceDecodingState.targetSeq.forEach(item => {
        const span = document.createElement('span');
        span.textContent = SPACE_CONFIG.shapes[item.ri];
        span.style.color = SPACE_CONFIG.colors[item.ci];
        span.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';
        seqEl.appendChild(span);
    });
    document.getElementById('space-input').value = '';
}
function endSpaceDecoding(completed) {
    spaceDecodingState.isPlaying = false; clearInterval(spaceDecodingState.timer);
    document.getElementById('space-start').textContent = '开始挑战';
    document.getElementById('space-input').disabled = true;
    if(completed) alert(`结束！成功完成 ${spaceDecodingState.score} 组序列`);
}

// ====== 4. Decoding Connection ======
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
                btn.style.background = 'rgba(218,54,51,0.5)'; setTimeout(() => btn.style.background = '', 300);
            }
        };
    });
}
function startDecodingConn() {
    decodingConnState.isPlaying = true; decodingConnState.score = 0; decodingConnState.timeLeft = 60;
    decodingConnState.letters.forEach((L, i) => decodingConnState.legend[L] = i+1);
    document.getElementById('decoding-conn-start').textContent = '放弃挑战';
    nextDecodingConnRound();
    decodingConnState.timer = setInterval(() => { if(--decodingConnState.timeLeft <= 0) endDecodingConn(true); document.getElementById('decoding-conn-timer').textContent = decodingConnState.timeLeft; }, 1000);
}
function nextDecodingConnRound() {
    decodingConnState.targetSeq = Array.from({length: 6}, () => decodingConnState.letters[Math.floor(Math.random()*9)]);
    decodingConnState.currentIndex = 0; updateDecodingConnSeqDisplay();
}
function updateDecodingConnSeqDisplay() {
    const el = document.getElementById('decoding-conn-sequence');
    el.innerHTML = decodingConnState.targetSeq.map((char, i) => `<span style="${i < decodingConnState.currentIndex ? 'opacity:0.3; text-decoration:line-through;' : 'color:#58a6ff'}">${char}</span>`).join(' ');
}
function endDecodingConn(completed) {
    decodingConnState.isPlaying = false; clearInterval(decodingConnState.timer);
    document.getElementById('decoding-conn-start').textContent = '开始挑战';
    if(completed) alert(`结束！成功完成 ${decodingConnState.score} 组序列`);
}

// ====== 5. Initializations & Events ======
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation(); updateDashboard(); setTimeout(resizeCanvas, 100);
    window.addEventListener('resize', resizeCanvas);
    document.getElementById('schulte-start').onclick = () => schulteState.isPlaying ? endSchulteGame(false) : startSchulteGame();
    document.getElementById('schulte-theme').onchange = () => { stopAllActivities(); generateSchulteGrid(); };
    document.getElementById('schulte-size').onchange = (e) => { stopAllActivities(); schulteState.size = parseInt(e.target.value); generateSchulteGrid(); };
    document.getElementById('tracker-start').onclick = () => initTrackerGame(true);
    document.getElementById('tracker-canvas').onmousedown = (e) => {
        if(trackerState.phase !== 'select') return;
        const rect = e.target.getBoundingClientRect(); const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        trackerState.balls.forEach(b => {
            if(!b.isSelected && b.isClicked(mx, my)) {
                b.isSelected = true; b.isCorrect = b.isTarget;
                if(b.isCorrect) {
                  trackerState.selectedFound++; if(trackerState.selectedFound === trackerState.numTargets) { trackerState.level++; setTimeout(() => { alert("全部找对！"); initTrackerGame(true); }, 500); }
                } else { trackerState.isPlaying = false; setTimeout(() => { alert("选错了。"); trackerState.level=1; document.getElementById('tracker-start').style.display='block'; initTrackerGame(false); }, 500); }
            }
        });
    };
    document.getElementById('space-start').onclick = () => spaceDecodingState.isPlaying ? endSpaceDecoding(false) : startSpaceDecoding();
    document.getElementById('space-input').oninput = (e) => {
        if(!spaceDecodingState.isPlaying) return;
        const val = e.target.value.trim().split(/\s+/).join(''); // ignore spaces
        const expected = spaceDecodingState.targetSeq.map(item => item.char).join('');
        if(val.toLowerCase() === expected.toLowerCase()) { spaceDecodingState.score++; nextSpaceDecodingRound(); }
    };
    document.getElementById('decoding-conn-start').onclick = () => decodingConnState.isPlaying ? endDecodingConn(false) : startDecodingConn();

    // Visual Speed
    document.getElementById('vis-speed-yes').onclick = () => { if(visSpeedState.isPlaying) { if(visSpeedState.currentGroup.includes(visSpeedState.currentTarget)) visSpeedState.score++; else visSpeedState.timeLeft -= 2; nextVisSpeedRound(); } };
    document.getElementById('vis-speed-no').onclick = () => { if(visSpeedState.isPlaying) { if(!visSpeedState.currentGroup.includes(visSpeedState.currentTarget)) visSpeedState.score++; else visSpeedState.timeLeft -= 2; nextVisSpeedRound(); } };
});

function resizeCanvas() {
    const c = document.getElementById('tracker-canvas');
    if(c && c.offsetParent) { c.width = c.clientWidth; c.height = c.clientHeight; }
}
function initVisSpeed() { visSpeedState.score = 0; visSpeedState.timeLeft = 60; visSpeedState.isPlaying = true; document.getElementById('vis-speed-timer').textContent = '60'; nextVisSpeedRound(); clearInterval(visSpeedState.timer); visSpeedState.timer = setInterval(() => { if(--visSpeedState.timeLeft <= 0) { visSpeedState.isPlaying = false; clearInterval(visSpeedState.timer); alert(`测验结束！得分：${visSpeedState.score}`); updateDashboard(); } document.getElementById('vis-speed-timer').textContent = visSpeedState.timeLeft; }, 1000); }
function nextVisSpeedRound() { const shuffled = [...['☀', '⚡', '❄', '☁', '★', '☕', '⚔', '⚖', '☯', '⚛']].sort(() => Math.random() - 0.5); visSpeedState.currentTarget = shuffled[0]; const group = shuffled.slice(1, 6); if(Math.random() > 0.5) group[Math.floor(Math.random() * 5)] = visSpeedState.currentTarget; visSpeedState.currentGroup = group; document.getElementById('vis-speed-target').textContent = visSpeedState.currentTarget; document.getElementById('vis-speed-group').innerHTML = group.map(s => `<span class="search-symbol">${s}</span>`).join(''); }
