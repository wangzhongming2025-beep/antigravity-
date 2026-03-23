// ====== 0. Global State & Infrastructure ======
const navLinks = document.querySelectorAll('.nav-links li');
const views = document.querySelectorAll('.view');
const viewTitle = document.getElementById('view-title');

const state = {
    currentView: 'dashboard',
    speechEnabled: 'speechSynthesis' in window
};

// Navigation Core
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetView = link.getAttribute('data-view');
        if(state.currentView === targetView) return;
        
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        views.forEach(v => v.classList.remove('active-view'));
        const targetEl = document.getElementById(targetView);
        if(targetEl) targetEl.classList.add('active-view');
        
        viewTitle.textContent = link.querySelector('span:last-child').textContent;
        state.currentView = targetView;
        
        stopAllActivities(); // Stop any pending timers/audio
        initView(targetView);
    });
});

function initView(viewId) {
    switch(viewId) {
        case 'dashboard': updateDashboard(); break;
        case 'schulte': if(!schulteState.isPlaying) generateSchulteGrid(); break;
        case 'tracker': if(!trackerState.isPlaying) renderTracker(0); break;
        case 'vis-speed': initVisSpeed(); break;
        case 'vis-cancel': initVisCancel(); break;
        case 'aud-react': initAudReact(); break;
        case 'aud-span': initAudSpan(); break;
        case 'mem-reverse': initMemReverse(); break;
        case 'vis-video': initVisVideo(); break;
    }
}

function stopAllActivities() {
    if(schulteState.isPlaying) endSchulteGame(false);
    if(trackerState.isPlaying) { trackerState.isPlaying = false; cancelAnimationFrame(trackerState.animationId); }
    if(breathState.isPlaying) stopBreathing();
    // Stop speech
    if(state.speechEnabled) window.speechSynthesis.cancel();
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
    document.getElementById('ds-schulte-best').textContent = schulteBest;
    const trackerV = localStorage.getItem('focus_tracker_lvl') || '1';
    document.getElementById('ds-tracker-best').textContent = `Lv ${trackerV}`;
    const audSpan = localStorage.getItem('focus_aud_span_best') || '--';
    document.getElementById('ds-aud-span-best').textContent = audSpan;
    const breathMins = localStorage.getItem('focus_breath_mins') || '0';
    document.getElementById('ds-breath-time').textContent = `${breathMins} 分钟`;
}

// ====== 1. Schulte Grid (Existing) ======
const sGrid = document.getElementById('schulte-grid');
const sSizeSelect = document.getElementById('schulte-size');
const sTimerDisplay = document.getElementById('schulte-timer');
const sStartBtn = document.getElementById('schulte-start');

let schulteState = { isPlaying: false, expectedNumber: 1, size: 5, timerInterval: null, startTime: 0 };

sStartBtn.addEventListener('click', () => schulteState.isPlaying ? endSchulteGame(false) : startSchulteGame());
if(sSizeSelect) sSizeSelect.addEventListener('change', (e) => { 
    if(schulteState.isPlaying) endSchulteGame(false);
    schulteState.size = parseInt(e.target.value);
    generateSchulteGrid();
});

function generateSchulteGrid() {
    sGrid.innerHTML = '';
    const size = schulteState.size;
    const totalCells = size * size;
    sGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    let cellSize = size === 3 ? '100px' : size === 4 ? '80px' : '65px';
    let numbers = Array.from({length: totalCells}, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    numbers.forEach(num => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.style.width = cell.style.height = cellSize;
        cell.textContent = num;
        cell.addEventListener('mousedown', () => handleCellClick(cell, num));
        sGrid.appendChild(cell);
    });
}

function handleCellClick(cell, num) {
    if (!schulteState.isPlaying) return;
    if (num === schulteState.expectedNumber) {
        cell.classList.add('active-hit');
        if (++schulteState.expectedNumber > schulteState.size ** 2) {
            endSchulteGame(true);
        } else {
            document.getElementById('schulte-next').textContent = schulteState.expectedNumber;
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
    document.getElementById('schulte-next').textContent = '1';
    sStartBtn.textContent = '放弃挑战'; sStartBtn.classList.replace('primary', 'danger');
    generateSchulteGrid();
    schulteState.startTime = Date.now();
    schulteState.timerInterval = setInterval(() => {
        sTimerDisplay.textContent = ((Date.now() - schulteState.startTime) / 1000).toFixed(2);
    }, 40);
}

function endSchulteGame(completed) {
    schulteState.isPlaying = false; clearInterval(schulteState.timerInterval);
    sStartBtn.textContent = '开始挑战'; sStartBtn.classList.replace('danger', 'primary');
    document.getElementById('schulte-next').textContent = '--';
    if (completed) {
        const final = parseFloat(sTimerDisplay.textContent);
        const key = `focus_schulte_best_${schulteState.size}`;
        if(final < (parseFloat(localStorage.getItem(key)) || Infinity)) localStorage.setItem(key, final);
        alert(`完成！用时：${final} 秒`);
        updateDashboard();
    }
}

// ====== 2. Tracker (Existing Logic Simplified) ======
const tCanvas = document.getElementById('tracker-canvas');
const tCtx = tCanvas.getContext('2d');
const tStartBtn = document.getElementById('tracker-start');
const tOverlay = document.getElementById('tracker-overlay');
const tScoreDisp = document.getElementById('tracker-score');
const tLevelDisp = document.getElementById('tracker-level');

let trackerState = { isPlaying: false, score: 0, level: 1, balls: [], targetIndices: [], numBalls: 5, numTargets: 2, phase: 'idle', animationId: null, selectedTargets: [] };

function resizeCanvas() { if(tCanvas) { tCanvas.width = tCanvas.parentElement.clientWidth; tCanvas.height = tCanvas.parentElement.clientHeight; } }
window.addEventListener('resize', resizeCanvas);

class Ball {
    constructor(x, y, vx, vy, radius) { Object.assign(this, {x,y,vx,vy,radius,isTarget:false,isSelected:false,isCorrect:false,color:'#30363d'}); }
    update(w, h) {
        if (trackerState.phase === 'move') {
            this.x += this.vx; this.y += this.vy;
            if (this.x-this.radius <= 0 || this.x+this.radius >= w) this.vx *= -1;
            if (this.y-this.radius <= 0 || this.y+this.radius >= h) this.vy *= -1;
        }
    }
    draw(ctx, p) {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        let fill = this.color;
        if(p==='memorize' && this.isTarget) { fill='#58a6ff'; ctx.shadowBlur=15; ctx.shadowColor='#58a6ff'; }
        else if(p==='select' && this.isSelected) fill = this.isCorrect ? '#2ea043' : '#da3633';
        ctx.fillStyle = fill; ctx.fill(); ctx.shadowBlur=0; ctx.strokeStyle='#8b949e'; ctx.stroke();
    }
    isClicked(mx, my) { return (this.x-mx)**2 + (this.y-my)**2 <= this.radius**2; }
}

function initTrackerGame() {
    resizeCanvas();
    const w = tCanvas.width, h = tCanvas.height;
    trackerState.numBalls = 4 + Math.floor(trackerState.level/2);
    trackerState.numTargets = 1 + Math.ceil(trackerState.level/3);
    trackerState.balls = []; trackerState.targetIndices = []; trackerState.selectedTargets = [];
    for(let i=0; i<trackerState.numBalls; i++) {
        let r=20, x=r+Math.random()*(w-r*2), y=r+Math.random()*(h-r*2), a=Math.random()*Math.PI*2, s=2.5+trackerState.level*0.5;
        trackerState.balls.push(new Ball(x, y, Math.cos(a)*s, Math.sin(a)*s, r));
    }
    while(trackerState.targetIndices.length < trackerState.numTargets) {
        let r = Math.floor(Math.random()*trackerState.numBalls);
        if(!trackerState.targetIndices.includes(r)) { trackerState.targetIndices.push(r); trackerState.balls[r].isTarget=true; }
    }
    trackerState.phase = 'memorize'; trackerState.isPlaying = true; tOverlay.classList.add('hidden');
    renderTracker();
    setTimeout(() => {
        if(!trackerState.isPlaying) return; trackerState.phase = 'move';
        setTimeout(() => {
            if(!trackerState.isPlaying) return; trackerState.phase='select';
            tOverlay.classList.remove('hidden'); tStartBtn.style.display='none';
        }, 4000);
    }, 2000);
}

function renderTracker() {
    if(!tCanvas.offsetParent) return;
    tCtx.clearRect(0,0,tCanvas.width,tCanvas.height);
    trackerState.balls.forEach(b => { b.update(tCanvas.width,tCanvas.height); b.draw(tCtx, trackerState.phase); });
    if(trackerState.isPlaying) trackerState.animationId = requestAnimationFrame(renderTracker);
}

tCanvas.addEventListener('mousedown', (e) => {
    if(trackerState.phase !== 'select') return;
    const rect=tCanvas.getBoundingClientRect(), mx=e.clientX-rect.left, my=e.clientY-rect.top;
    for(let b of trackerState.balls) {
        if(b.isClicked(mx, my) && !b.isSelected) {
            b.isSelected = true; b.isCorrect = b.isTarget;
            trackerState.selectedTargets.push(b);
            if(!b.isCorrect) { trackerState.isPlaying=false; trackerState.level=1; alert("选错了，重新开始！"); tOverlay.classList.remove('hidden'); tStartBtn.style.display='block'; return;}
            if(trackerState.selectedTargets.length === trackerState.numTargets) {
                trackerState.isPlaying=false; trackerState.level++; tLevelDisp.textContent=trackerState.level;
                alert("恭喜过关！"); tOverlay.classList.remove('hidden'); tStartBtn.style.display='block';
            }
            break;
        }
    }
});
tStartBtn.onclick = initTrackerGame;

// ====== 3. Placeholder Initializers for New Modules ======

// ====== 3. Visual Processing Speed (vis-speed) ======
const vSpeedTarget = document.getElementById('vis-speed-target');
const vSpeedGroup = document.getElementById('vis-speed-group');
const vSpeedTimer = document.getElementById('vis-speed-timer');
const vSpeedYes = document.getElementById('vis-speed-yes');
const vSpeedNo = document.getElementById('vis-speed-no');

let visSpeedState = { isPlaying: false, score: 0, timeLeft: 60, timer: null, currentTarget: '', currentGroup: [] };

const SYMBOLS = ['☀', '⚡', '❄', '☁', '★', '☕', '⚔', '⚖', '☯', '⚛'];

function initVisSpeed() {
    visSpeedState.score = 0; visSpeedState.timeLeft = 60;
    visSpeedState.isPlaying = true; vSpeedTimer.textContent = '60';
    nextVisSpeedRound();
    if(visSpeedState.timer) clearInterval(visSpeedState.timer);
    visSpeedState.timer = setInterval(() => {
        if(--visSpeedState.timeLeft <= 0) endVisSpeed();
        vSpeedTimer.textContent = visSpeedState.timeLeft;
    }, 1000);
}

function nextVisSpeedRound() {
    const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
    visSpeedState.currentTarget = shuffled[0];
    const present = Math.random() > 0.5;
    const group = shuffled.slice(1, 6); // 5 elements
    if(present) group[Math.floor(Math.random() * 5)] = visSpeedState.currentTarget;
    visSpeedState.currentGroup = group;
    
    vSpeedTarget.textContent = visSpeedState.currentTarget;
    vSpeedGroup.innerHTML = group.map(s => `<span class="search-symbol">${s}</span>`).join('');
}

function checkVisSpeed(val) {
    if(!visSpeedState.isPlaying) return;
    const exists = visSpeedState.currentGroup.includes(visSpeedState.currentTarget);
    if(val === exists) { visSpeedState.score++; nextVisSpeedRound(); }
    else { visSpeedState.timeLeft -= 2; nextVisSpeedRound(); } // Penalty
}

vSpeedYes.onclick = () => checkVisSpeed(true);
vSpeedNo.onclick = () => checkVisSpeed(false);

function endVisSpeed() {
    visSpeedState.isPlaying = false; clearInterval(visSpeedState.timer);
    alert(`测验结束！得分：${visSpeedState.score}`);
    updateDashboard();
}

// ====== 4. Visual Cancellation (vis-cancel) ======
const vCancelGrid = document.getElementById('vis-cancel-grid');
const vCancelTimer = document.getElementById('vis-cancel-timer');
const vCancelStart = document.getElementById('vis-cancel-start');

let visCancelState = { isPlaying: false, score: 0, timeLeft: 45, timer: null, targetChars: [] };

function initVisCancel() {
    vCancelGrid.innerHTML = ''; visCancelState.isPlaying = false;
    vCancelTimer.textContent = '45';
}

vCancelStart.onclick = () => {
    if(visCancelState.isPlaying) return;
    visCancelState.isPlaying = true; visCancelState.score = 0; visCancelState.timeLeft = 45;
    const chars = ['p', 'b', 'd', 'q'];
    vCancelGrid.innerHTML = '';
    for(let i=0; i<225; i++) {
        const char = chars[Math.floor(Math.random() * 4)];
        const cell = document.createElement('div');
        cell.className = 'cancel-cell';
        cell.textContent = char;
        cell.onclick = () => {
            if(!visCancelState.isPlaying) return;
            if(char === 'p') {
                if(!cell.classList.contains('selected')) { cell.classList.add('selected'); visCancelState.score++; }
            } else {
                visCancelState.timeLeft -= 1; // Penalty
            }
        };
        vCancelGrid.appendChild(cell);
    }
    visCancelState.timer = setInterval(() => {
        if(--visCancelState.timeLeft <= 0) endVisCancel();
        vCancelTimer.textContent = visCancelState.timeLeft;
    }, 1000);
};

function endVisCancel() {
    visCancelState.isPlaying = false; clearInterval(visCancelState.timer);
    alert(`测验结束！找到了 ${visCancelState.score} 个目标字符`);
    updateDashboard();
}

// ====== 5. Video Discrimination (vis-video) ======
const videoCanvas = document.getElementById('video-canvas');
const vCtx = videoCanvas.getContext('2d');
const videoStart = document.getElementById('video-start');
const videoOverlay = document.getElementById('video-overlay');
const videoQBox = document.getElementById('video-question-box');
const videoQText = document.getElementById('video-question');
const videoOptions = document.getElementById('video-options');

let videoState = { isPlaying: false, shapes: [], answer: 0 };

function initVisVideo() {
    videoOverlay.classList.remove('hidden');
    videoQBox.classList.add('hidden');
    videoCanvas.width = videoCanvas.parentElement.clientWidth;
    videoCanvas.height = videoCanvas.parentElement.clientHeight;
}

videoStart.onclick = () => {
    videoOverlay.classList.add('hidden');
    videoState.isPlaying = true;
    const colors = ['#da3633', '#40c4ff', '#2ea043']; // Red, Blue, Green
    const types = ['rect', 'circle'];
    const targetColor = colors[Math.floor(Math.random() * 3)];
    const targetType = types[Math.floor(Math.random() * 2)];
    
    videoState.shapes = [];
    let count = 0;
    for(let i=0; i<8; i++) {
        const c = colors[Math.floor(Math.random()*3)];
        const t = types[Math.floor(Math.random()*2)];
        if(c === targetColor && t === targetType) count++;
        videoState.shapes.push({
            x: Math.random() * videoCanvas.width,
            y: Math.random() * videoCanvas.height,
            vx: (Math.random()-0.5)*10,
            vy: (Math.random()-0.5)*10,
            c, t, size: 30 + Math.random()*20
        });
    }
    videoState.answer = count;

    let startTime = Date.now();
    function animateVideo() {
        if(!videoState.isPlaying) return;
        vCtx.clearRect(0,0,videoCanvas.width,videoCanvas.height);
        videoState.shapes.forEach(s => {
            s.x += s.vx; s.y += s.vy;
            if(s.x < 0 || s.x > videoCanvas.width) s.vx *= -1;
            if(s.y < 0 || s.y > videoCanvas.height) s.vy *= -1;
            vCtx.fillStyle = s.c;
            vCtx.beginPath();
            if(s.t === 'rect') vCtx.fillRect(s.x, s.y, s.size, s.size);
            else { vCtx.arc(s.x, s.y, s.size/2, 0, Math.PI*2); vCtx.fill(); }
        });
        if(Date.now() - startTime < 4000) requestAnimationFrame(animateVideo);
        else showVideoQuestion(targetColor, targetType);
    }
    animateVideo();
};

function showVideoQuestion(color, type) {
    videoState.isPlaying = false;
    vCtx.clearRect(0,0,videoCanvas.width,videoCanvas.height);
    videoQBox.classList.remove('hidden');
    const colorName = color === '#da3633' ? '红色' : color === '#40c4ff' ? '蓝色' : '绿色';
    const typeName = type === 'rect' ? '正方形' : '圆形';
    videoQText.textContent = `刚才画面中出现了几个 ${colorName} 的 ${typeName}？`;
    
    videoOptions.innerHTML = '';
    [videoState.answer, videoState.answer + 1, Math.max(0, videoState.answer - 1)]
        .sort(() => Math.random() - 0.5)
        .forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn glass';
            btn.textContent = opt;
            btn.onclick = () => {
                if(opt === videoState.answer) alert("正确！观察力很棒");
                else alert(`错误，正确答案是 ${videoState.answer}`);
                initVisVideo();
            };
            videoOptions.appendChild(btn);
        });
}

// ====== 6. Auditory Reaction (aud-react) ======
const audReactStart = document.getElementById('aud-react-start');
const audReactBtns = document.querySelectorAll('.btn-circle');
const audVisualizer = document.querySelector('.audio-visualizer');

let audReactState = { isPlaying: false, targetColor: '', startTime: 0 };

function initAudReact() { audReactState.isPlaying = false; audVisualizer.classList.remove('playing'); }

audReactStart.onclick = () => {
    if(audReactState.isPlaying) return;
    audReactState.isPlaying = true;
    audReactStart.disabled = true;
    
    // Random delay between 1-3s
    setTimeout(() => {
        const colors = ['red', 'blue', 'green'];
        const colorNames = { red: '红色', blue: '蓝色', green: '绿色' };
        audReactState.targetColor = colors[Math.floor(Math.random() * 3)];
        
        audVisualizer.classList.add('playing');
        Speech.speak(colorNames[audReactState.targetColor], () => {
            audVisualizer.classList.remove('playing');
            audReactState.startTime = Date.now();
        });
    }, 1000 + Math.random() * 2000);
};

audReactBtns.forEach(btn => {
    btn.onclick = () => {
        if(!audReactState.isPlaying || !audReactState.startTime) return;
        const clicked = btn.getAttribute('data-color');
        const reactionTime = Date.now() - audReactState.startTime;
        
        if(clicked === audReactState.targetColor) {
            alert(`反应正确！用时：${reactionTime}ms`);
        } else {
            alert("点错了！再接再厉");
        }
        audReactState.isPlaying = false; audReactState.startTime = 0;
        audReactStart.disabled = false;
    };
});

// ====== 7. Auditory Span (aud-span) ======
const audSpanStart = document.getElementById('aud-span-start');
const audSpanInputBox = document.getElementById('aud-span-input-box');
const audSpanInput = document.getElementById('aud-span-input');
const audSpanSubmit = document.getElementById('aud-span-submit');
const audSpanMsg = document.getElementById('aud-span-msg');
const audSpanStatus = document.getElementById('aud-span-status');

let audSpanState = { isPlaying: false, currentLevel: 3, sequence: [], userIdx: 0 };

function initAudSpan() {
    audSpanState.isPlaying = false; audSpanInputBox.classList.add('hidden');
    audSpanMsg.textContent = '准备好听数字序列了吗？';
}

audSpanStart.onclick = () => {
    if(audSpanState.isPlaying) return;
    audSpanState.isPlaying = true; audSpanStart.classList.add('hidden');
    startAudSpanRound();
};

function startAudSpanRound() {
    audSpanState.sequence = Array.from({length: audSpanState.currentLevel}, () => Math.floor(Math.random() * 10));
    audSpanMsg.textContent = `请听第 ${audSpanState.currentLevel} 级数字...`;
    audSpanStatus.textContent = '📢';
    
    let i = 0;
    const interval = setInterval(() => {
        if(i < audSpanState.sequence.length) {
            Speech.speak(audSpanState.sequence[i].toString());
            i++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                audSpanStatus.textContent = '⌨️';
                audSpanMsg.textContent = '请按顺序输入你听到的数字';
                audSpanInputBox.classList.remove('hidden');
                audSpanInput.value = ''; audSpanInput.focus();
            }, 1000);
        }
    }, 1200);
}

audSpanSubmit.onclick = handleAudSpanSubmit;
audSpanInput.onkeypress = (e) => { if(e.key === 'Enter') handleAudSpanSubmit(); };

function handleAudSpanSubmit() {
    const val = audSpanInput.value.trim();
    const correct = audSpanState.sequence.join('');
    if(val === correct) {
        audSpanState.currentLevel++;
        alert("正确！进入下一级");
        audSpanInputBox.classList.add('hidden');
        startAudSpanRound();
    } else {
        alert(`错误。正确答案是 ${correct}。你的得分是 ${audSpanState.currentLevel - 1} 级`);
        const best = parseInt(localStorage.getItem('focus_aud_span_best') || 0);
        if(audSpanState.currentLevel - 1 > best) localStorage.setItem('focus_aud_span_best', audSpanState.currentLevel - 1);
        
        audSpanState.isPlaying = false; audSpanState.currentLevel = 3;
        audSpanStart.classList.remove('hidden'); audSpanInputBox.classList.add('hidden');
        updateDashboard();
    }
}

// ====== 8. Reverse Speech (mem-reverse) ======
const memRevStart = document.getElementById('mem-rev-start');
const memRevInput = document.getElementById('mem-rev-input');
const memRevText = document.getElementById('mem-rev-text');

const WORDS = ['苹果', '大海', '蓝天', '森林', '书本', '阳光', '咖啡', '屏幕', '火箭', '相机'];

function initMemReverse() {
    memRevInput.disabled = true; memRevInput.value = '';
    memRevText.textContent = '系统会读出一个词，请逆序输入它。';
}

memRevStart.onclick = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    memRevText.textContent = '正在朗读...';
    Speech.speak(word, () => {
        memRevText.textContent = '请逆序写出刚才的词：';
        memRevInput.disabled = false; memRevInput.focus();
        memRevInput.onkeypress = (e) => {
            if(e.key === 'Enter') {
                const reversed = word.split('').reverse().join('');
                if(memRevInput.value.trim() === reversed) {
                    alert("正确！反应敏捷");
                    initMemReverse();
                } else {
                    alert(`可惜！正确答案是 "${reversed}"`);
                    initMemReverse();
                }
            }
        };
    });
};

// ====== 9. Word Repetition (mem-repeat) ======
const SENTENCES = [
    "森林公园里的松鼠正在采集松果",
    "蔚蓝的大海上漂浮着几只洁白的帆船",
    "操场上的运动员们正在进行百米冲刺练习",
    "清晨的阳光透过窗户洒满了安静的图书馆"
];

function initMemRepeat() {
    const s = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
    alert("请听一段话并完整复述（打字）：");
    Speech.speak(s, () => {
        const val = prompt("请输入刚才听到的完整句子：");
        if(val === s) alert("全对！记忆广度惊人");
        else alert(`有偏差。原句：${s}`);
        updateDashboard();
    });
}

// ====== 10. Auditory Interference (aud-inter) ======
function initAudInter() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    
    osc.start();
    const digits = Array.from({length: 4}, () => Math.floor(Math.random()*10)).join('');
    alert("背景噪音中请辨别数字序列：");
    Speech.speak(digits, () => {
        osc.stop();
        const val = prompt("请输入听到的4位数字：");
        if(val === digits) alert("抗干扰能力强！成功识别");
        else alert(`识别失败。原数字：${digits}`);
    });
}

// ====== 11. Wechsler Assessment (assessment-wechsler) ======
function initAssessmentWechsler() {
    const hasData = localStorage.getItem('focus_aud_span_best') && localStorage.getItem('focus_schulte_best_5');
    if(!hasData) {
        alert("请先完成一次【听觉广度】和【舒尔特方格】基础训练，才能生成韦氏综合评测报告。");
        return;
    }
    
    const sScore = parseFloat(localStorage.getItem('focus_schulte_best_5'));
    const aSpan = parseInt(localStorage.getItem('focus_aud_span_best'));
    
    const iqEst = Math.round(90 + (aSpan * 5) + (100 / sScore * 10));
    
    alert(`【韦氏认知评估简报】\n\n视觉加工速度：${sScore}s\n听觉工作记忆：${aSpan}级\n当前全维专注力预估：${iqEst} 分\n\n评估：${iqEst > 115 ? '优秀' : iqEst > 95 ? '良好' : '持续进步中'}`);
}

// ====== 4. Breathing Module (existing) ======
const bCircle = document.getElementById('b-circle');
const bText = document.getElementById('b-instruction');
const bStartBtn = document.getElementById('breathing-start');
let breathState = { isPlaying: false, interval: null, totalSeconds: 0 };

bStartBtn.onclick = () => breathState.isPlaying ? stopBreathing() : startBreathing();

function startBreathing() {
    breathState.isPlaying = true; bStartBtn.textContent = '停止';
    runCycle();
}
function stopBreathing() {
    breathState.isPlaying = false; clearTimeout(breathState.interval); bStartBtn.textContent = '开始呼吸';
    let mins = Math.floor(breathState.totalSeconds / 60);
    if(mins > 0) localStorage.setItem('focus_breath_mins', (parseInt(localStorage.getItem('focus_breath_mins')||0)) + mins);
    updateDashboard();
}
function runCycle() {
    if(!breathState.isPlaying) return;
    bText.textContent = '吸气...'; bCircle.className = 'b-circle glass inhale';
    breathState.interval = setTimeout(() => {
        bText.textContent = '呼气...'; bCircle.className = 'b-circle glass exhale';
        breathState.interval = setTimeout(() => { breathState.totalSeconds += 8; runCycle(); }, 4000);
    }, 4000);
}

// Global Init
updateDashboard();
generateSchulteGrid();
resizeCanvas();
