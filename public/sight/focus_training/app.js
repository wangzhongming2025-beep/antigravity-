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

let audReactState = { isPlaying: false, targetColor: '', startTime: 0, score: 0 };
let audInterState = { isPlaying: false, score: 0 };
let audSpanState = { isPlaying: false, sequence: [], userIdx: 0, currentLevel: 3 };
let memRepeatState = { isPlaying: false, currentSentence: '' };
let memReverseState = { isPlaying: false, currentWord: '' };

const THEMES = {
    animal: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗'],
    fruit: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '茄', '🥑', '🥦', '🌽', '🥕', '🥔', '🍠', '🍄'],
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
        if(!state.speechEnabled) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'zh-CN'; utter.rate = 0.85;
        if(onEnd) utter.onend = onEnd;
        window.speechSynthesis.speak(utter);
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
        case 'vis-video': initVisVideo(); break;
        case 'aud-react': initAudReact(); break;
        case 'aud-inter': initAudInter(); break;
        case 'aud-span': initAudSpan(); break;
        case 'mem-repeat': initMemRepeat(); break;
        case 'mem-reverse': initMemReverse(); break;
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
    if(videoState.isPlaying) videoState.isPlaying = false;
    if(audReactState.isPlaying) audReactState.isPlaying = false;
    if(audSpanState.isPlaying) audSpanState.isPlaying = false;
    if(state.speechEnabled) window.speechSynthesis.cancel();
}

function updateDashboard() {
    const schulteBest = localStorage.getItem('focus_schulte_best_5') || '--:--';
    const dsSchulte = document.getElementById('ds-schulte-best'); if(dsSchulte) dsSchulte.textContent = schulteBest;
    const trackerV = localStorage.getItem('focus_tracker_lvl') || '1';
    const dsTracker = document.getElementById('ds-tracker-best'); if(dsTracker) dsTracker.textContent = `Lv ${trackerV}`;
}

// ====== 1. Schulte Grid ======
function generateSchulteGrid() {
    const sGrid = document.getElementById('schulte-grid'); if(!sGrid) return;
    sGrid.innerHTML = ''; const size = schulteState.size; const theme = document.getElementById('schulte-theme').value;
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
    if (val === schulteState.expectedNumber) {
        cell.classList.add('active-hit');
        if (++schulteState.expectedNumber > schulteState.size ** 2) endSchulteGame(true);
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

// ====== 3. Space Decoding ======
function initSpaceDecoding() {
    spaceDecodingState.isPlaying = false; document.getElementById('space-decoding-timer').textContent = '120';
    document.getElementById('space-input').disabled = true; document.getElementById('space-input').value = '';
    const legEl = document.getElementById('space-legend');
    let html = '<table style="width:100%; border-collapse:collapse; text-align:center; table-layout:fixed;"><tr><td style="border:1px solid #444;"></td>';
    SPACE_CONFIG.colors.forEach(c => html += `<td style="border:1px solid #444; background:${c}; height:30px;"></td>`);
    html += '</tr>';
    SPACE_CONFIG.shapes.forEach((s, ri) => {
        html += `<tr><td style="border:1px solid #444; font-size:1.5rem; padding:10px;">${s}</td>`;
        SPACE_CONFIG.mapping[ri].forEach(v => html += `<td style="border:1px solid #444; padding:10px; font-weight:bold;">${v}</td>`);
        html += '</tr>';
    });
    html += '</table>'; legEl.innerHTML = html;
    document.getElementById('space-target-seq').textContent = '准备好了吗？';
}
function startSpaceDecoding() {
    spaceDecodingState.isPlaying = true; spaceDecodingState.score = 0; spaceDecodingState.timeLeft = 120;
    document.getElementById('space-start').textContent = '放弃挑战';
    const inp = document.getElementById('space-input'); inp.disabled = false; inp.value = ''; inp.focus();
    nextSpaceDecodingRound();
    spaceDecodingState.timer = setInterval(() => { if(--spaceDecodingState.timeLeft <= 0) endSpaceDecoding(true); document.getElementById('space-decoding-timer').textContent = spaceDecodingState.timeLeft; }, 1000);
}
function nextSpaceDecodingRound() {
    spaceDecodingState.targetSeq = Array.from({length: 6}, () => {
        const ri = Math.floor(Math.random()*4), ci = Math.floor(Math.random()*8);
        return { ri, ci, char: SPACE_CONFIG.mapping[ri][ci] };
    });
    spaceDecodingState.currentIndex = 0;
    const seqEl = document.getElementById('space-target-seq'); seqEl.innerHTML = '';
    spaceDecodingState.targetSeq.forEach(item => {
        const span = document.createElement('span'); span.textContent = SPACE_CONFIG.shapes[item.ri];
        span.style.color = SPACE_CONFIG.colors[item.ci]; span.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';
        seqEl.appendChild(span);
    });
    document.getElementById('space-input').value = '';
}
function endSpaceDecoding(completed) {
    spaceDecodingState.isPlaying = false; clearInterval(spaceDecodingState.timer);
    document.getElementById('space-start').textContent = '开始挑战'; document.getElementById('space-input').disabled = true;
    if(completed) alert(`结束！成功完成 ${spaceDecodingState.score} 组序列`);
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

function initAudSpan() { audSpanState.isPlaying = false; document.getElementById('aud-span-input-box').classList.add('hidden'); }
function startAudSpan() {
    audSpanState.isPlaying = true; audSpanState.currentLevel = 3; document.getElementById('aud-span-start').textContent = '放弃挑战';
    nextAudSpanRound();
}
function nextAudSpanRound() {
    audSpanState.sequence = Array.from({length: audSpanState.currentLevel}, () => Math.floor(Math.random()*10));
    audSpanState.userIdx = 0; document.getElementById('aud-span-input-box').classList.add('hidden');
    document.getElementById('aud-span-input').value = '';
    Speech.speak(audSpanState.sequence.join(', '), () => {
        document.getElementById('aud-span-input-box').classList.remove('hidden');
        document.getElementById('aud-span-input').focus();
    });
}

function initAudInter() { audInterState.isPlaying = false; }
function startAudInter() {
    audInterState.isPlaying = true; Speech.speak("请听嘈杂背景中的数字。三、七、九、一。");
    setTimeout(() => { const ans = prompt("刚才听到的数字是？"); if(ans === '3791') alert("正确！"); else alert("错误！"); audInterState.isPlaying = false; }, 6000);
}

function initMemRepeat() { memRepeatState.isPlaying = false; }
function startMemRepeat() {
    memRepeatState.isPlaying = true; const s = SENTENCES[Math.floor(Math.random()*SENTENCES.length)];
    Speech.speak("请复述：" + s, () => {
        const user = prompt("请输入刚才听到的句子：");
        if(user === s) alert("精准复述！"); else alert("有些出入哦，原句是：" + s);
        memRepeatState.isPlaying = false;
    });
}

function initMemReverse() { memReverseState.isPlaying = false; }
function startMemReverse() {
    memReverseState.isPlaying = true; const words = ["苹果", "西瓜", "香蕉", "葡萄", "菠萝"];
    const w = words[Math.floor(Math.random()*words.length)];
    Speech.speak("请倒着说：" + w, () => {
        const user = prompt("请输入倒过来的词：");
        if(user === w.split('').reverse().join('')) alert("完全正确！"); else alert("不正确哦");
        memReverseState.isPlaying = false;
    });
}

// ====== 6. Other Modules ======
function initDecoding() { 
    decodingState.isPlaying = false; document.getElementById('decoding-timer').textContent = '60';
    document.getElementById('decoding-input').disabled = true; document.getElementById('decoding-input').value = '';
    document.getElementById('decoding-expr').textContent = '准备好了吗？';
    const legEl = document.getElementById('decoding-legend');
    const symbols = ['△', '☆', '○', '□', '◇'];
    let html = '<table style="width:100%; border-collapse:collapse; margin:10px 0; font-size:1.8rem;">';
    html += '<tr style="background:rgba(255,255,255,0.1);">';
    symbols.forEach(s => html += `<td style="border:1px solid rgba(255,255,255,0.2); padding:10px;">${s}</td>`);
    html += '</tr><tr>';
    symbols.forEach((_, i) => html += `<td style="border:1px solid rgba(255,255,255,0.2); padding:10px; color:var(--primary); font-weight:bold;">${i+1}</td>`);
    html += '</tr></table>'; legEl.innerHTML = html;
}
function startDecoding() {
    decodingState.isPlaying = true; decodingState.score = 0; decodingState.timeLeft = 60;
    const inp = document.getElementById('decoding-input'); inp.disabled = false; inp.value = ''; inp.focus();
    const symMap = {'△':1, '☆':2, '○':3, '□':4, '◇':5}; decodingState.legend = symMap; nextDecodingRound();
    decodingState.timer = setInterval(() => { if(--decodingState.timeLeft <= 0) { clearInterval(decodingState.timer); decodingState.isPlaying = false; alert(`结束！得分：${decodingState.score}`); } document.getElementById('decoding-timer').textContent = decodingState.timeLeft; }, 1000);
}
function nextDecodingRound() {
    const syms = Object.keys(decodingState.legend); const s1 = syms[Math.floor(Math.random()*5)], s2 = syms[Math.floor(Math.random()*5)];
    const op = Math.random() > 0.5 ? '+' : '-';
    decodingState.currentAns = op === '+' ? (decodingState.legend[s1]+decodingState.legend[s2]) : (decodingState.legend[s1]-decodingState.legend[s2]);
    document.getElementById('decoding-expr').textContent = `${s1} ${op} ${s2} = `; document.getElementById('decoding-input').value = '';
}

function initDecodingConn() {
    decodingConnState.isPlaying = false;
    const timerEl = document.getElementById('decoding-conn-timer');
    if(timerEl) timerEl.textContent = '60';
    
    const legEl = document.getElementById('decoding-conn-legend');
    if(legEl) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:1.2rem;">';
        html += '<tr style="background:rgba(255,255,255,0.1);">';
        decodingConnState.letters.forEach(L => html += `<td style="border:1px solid rgba(255,255,255,0.2); padding:5px;">${L}</td>`);
        html += '</tr><tr>';
        decodingConnState.letters.forEach((_, i) => html += `<td style="border:1px solid rgba(255,255,255,0.2); padding:5px; color:var(--primary); font-weight:bold;">${i+1}</td>`);
        html += '</tr></table>';
        legEl.innerHTML = html;
        legEl.style.display = 'block'; // Ensure block display for the table
    }

    const grid = document.getElementById('decoding-conn-grid');
    if(grid) {
        grid.innerHTML = Array.from({length:9}, (_, i) => `<button class="btn glass num-btn" data-num="${i+1}">${i+1}</button>`).join('');
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
function startDecodingConn() {
    const grid = document.getElementById('decoding-conn-grid');
    if(!grid || grid.innerHTML === '') initDecodingConn(); // Ensure initialized
    
    decodingConnState.isPlaying = true;
    decodingConnState.score = 0;
    decodingConnState.timeLeft = 60;
    nextDecodingConnRound();
    decodingConnState.timer = setInterval(() => {
        if(--decodingConnState.timeLeft <= 0) {
            clearInterval(decodingConnState.timer);
            decodingConnState.isPlaying = false;
            alert(`结束！成功 ${decodingConnState.score} 组`);
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

function initVisSpeed() { nextVisSpeedRound(); }
function nextVisSpeedRound() {
    const syms = ['☀', '⚡', '❄', '☁', '★', '☕', '⚔', '⚖', '☯', '⚛'];
    visSpeedState.currentTarget = syms[Math.floor(Math.random()*10)];
    document.getElementById('vis-speed-target').textContent = visSpeedState.currentTarget;
    let group = syms.sort(() => 0.5-Math.random()).slice(0, 5);
    document.getElementById('vis-speed-group').innerHTML = group.map(s => `<span class="search-symbol">${s}</span>`).join('');
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
function nextStroopRound() {
    const colors = [{n:'红',c:'red'},{n:'蓝',c:'blue'},{n:'绿',c:'green'},{n:'黄',c:'yellow'}];
    const word = colors[Math.floor(Math.random()*4)], color = colors[Math.floor(Math.random()*4)];
    stroopState.currentCorrect = color.c;
    const el = document.getElementById('stroop-word'); el.textContent = word.n;
    const map = {red:'#ff4d4d', blue:'#40c4ff', green:'#2ea043', yellow:'#ffeb3b'};
    el.style.color = map[color.c];
}

// ====== 7. Assessment & Events ======
function initAssessmentWechsler() { alert("韦氏评估模块：请完成以下随机测试..."); startDecoding(); }

document.addEventListener('DOMContentLoaded', () => {
    // Helper to safely bind event listeners
    const bindClick = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };

    setupNavigation(); updateDashboard(); setTimeout(resizeCanvas, 100); window.addEventListener('resize', resizeCanvas);
    
    bindClick('schulte-start', () => schulteState.isPlaying ? endSchulteGame(false) : startSchulteGame());
    const sTheme = document.getElementById('schulte-theme'); if(sTheme) sTheme.onchange = () => { stopAllActivities(); generateSchulteGrid(); };
    const sSize = document.getElementById('schulte-size'); if(sSize) sSize.onchange = (e) => { stopAllActivities(); schulteState.size = parseInt(e.target.value); generateSchulteGrid(); };
    
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
    bindClick('space-start', () => spaceDecodingState.isPlaying ? endSpaceDecoding(false) : startSpaceDecoding());
    const spInp = document.getElementById('space-input');
    if(spInp) spInp.oninput = (e) => { if(!spaceDecodingState.isPlaying) return; if(e.target.value.toLowerCase() === spaceDecodingState.targetSeq.map(i=>i.char).join('').toLowerCase()) { spaceDecodingState.score++; nextSpaceDecodingRound(); } };
    
    bindClick('decoding-conn-start', () => decodingConnState.isPlaying ? endDecodingConn(false) : startDecodingConn());
    bindClick('decoding-start', () => decodingState.isPlaying ? endDecoding(false) : startDecoding());
    const decInp = document.getElementById('decoding-input');
    if(decInp) decInp.oninput = (e) => { if(parseInt(e.target.value) === decodingState.currentAns) { decodingState.score++; nextDecodingRound(); } };
    
    bindClick('vis-discrim-start', startVisDiscrim);
    bindClick('vis-speed-yes', () => nextVisSpeedRound());
    bindClick('vis-speed-no', () => nextVisSpeedRound());
    document.querySelectorAll('.stroop-option').forEach(b => b.onclick = () => { if(b.getAttribute('data-color') === stroopState.currentCorrect) alert('对！'); nextStroopRound(); });
    
    bindClick('aud-react-start', () => audReactState.isPlaying ? initAudReact() : startAudReact());
    document.querySelectorAll('.btn-circle').forEach(b => b.onclick = () => handleAudReactClick(b.getAttribute('data-color')));
    
    bindClick('aud-span-start', () => audSpanState.isPlaying ? initAudSpan() : startAudSpan());
    const spanInp = document.getElementById('aud-span-input');
    if(spanInp) spanInp.onkeydown = (e) => { if(e.key === 'Enter') { if(e.target.value === audSpanState.sequence.join('')) { audSpanState.currentLevel++; alert('过关！'); nextAudSpanRound(); } else { alert('错了！'); initAudSpan(); } } };
    
    bindClick('aud-inter-start', startAudInter);
    bindClick('mem-repeat-start', startMemRepeat);
    bindClick('mem-rev-start', startMemReverse);
    
    bindClick('vis-cancel-start', () => {
        const g = document.getElementById('vis-cancel-grid'); if(!g) return; g.innerHTML = '';
        const th = document.getElementById('vis-cancel-theme').value;
        const pool = th === 'letter' ? ['p','b','d','q'] : THEMES[th].slice(0, 4);
        document.getElementById('vis-cancel-target-char').textContent = pool[0];
        for(let i=0; i<200; i++) {
            const c = pool[Math.floor(Math.random()*pool.length)], cell = document.createElement('div');
            cell.className = 'cancel-cell'; cell.textContent = c;
            cell.onclick = () => { if(c === pool[0]) cell.classList.add('selected'); }; g.appendChild(cell);
        }
    });

    bindClick('breathing-start', () => alert('开始呼吸练习'));
});

function resizeCanvas() {
    const c = document.getElementById('tracker-canvas'), v = document.getElementById('video-canvas');
    if(c && c.offsetParent) { c.width = c.clientWidth; c.height = c.clientHeight; }
    if(v && v.offsetParent) { v.width = v.parentElement.clientWidth || 800; v.height = v.parentElement.clientHeight || 450; }
}
