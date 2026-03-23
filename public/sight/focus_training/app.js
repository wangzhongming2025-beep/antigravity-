// ====== 0. Global State & Infrastructure ======
const state = {
    currentView: 'dashboard',
    speechEnabled: 'speechSynthesis' in window
};

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('view-title');

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
    }
}

function stopAllActivities() {
    if(schulteState.isPlaying) endSchulteGame(false);
    if(trackerState.isPlaying) { trackerState.isPlaying = false; cancelAnimationFrame(trackerState.animationId); }
    if(breathState.isPlaying) stopBreathing();
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
let schulteState = { isPlaying: false, expectedNumber: 1, size: 5, timerInterval: null, startTime: 0 };
function generateSchulteGrid() {
    const sGrid = document.getElementById('schulte-grid');
    if(!sGrid) return;
    sGrid.innerHTML = '';
    const size = schulteState.size;
    sGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    let cellSize = size === 3 ? '100px' : size === 4 ? '80px' : '65px';
    let numbers = Array.from({length: size*size}, (_, i) => i + 1).sort(() => Math.random() - 0.5);
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
    const btn = document.getElementById('schulte-start');
    btn.textContent = '放弃挑战'; btn.classList.replace('primary', 'danger');
    generateSchulteGrid();
    schulteState.startTime = Date.now();
    schulteState.timerInterval = setInterval(() => {
        document.getElementById('schulte-timer').textContent = ((Date.now() - schulteState.startTime) / 1000).toFixed(2);
    }, 40);
}
function endSchulteGame(completed) {
    schulteState.isPlaying = false; clearInterval(schulteState.timerInterval);
    const btn = document.getElementById('schulte-start');
    btn.textContent = '开始挑战'; btn.classList.replace('danger', 'primary');
    document.getElementById('schulte-next').textContent = '--';
    if (completed) {
        const final = parseFloat(document.getElementById('schulte-timer').textContent);
        const key = `focus_schulte_best_${schulteState.size}`;
        if(final < (parseFloat(localStorage.getItem(key)) || Infinity)) localStorage.setItem(key, final);
        alert(`完成！用时：${final} 秒`);
        updateDashboard();
    }
}

// ====== 2. Tracker ======
let trackerState = { isPlaying: false, score: 0, level: 1, balls: [], targetIndices: [], numBalls: 5, numTargets: 2, phase: 'idle', animationId: null, selectedTargets: [] };
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

function resizeCanvas() { 
    const tCanvas = document.getElementById('tracker-canvas');
    if(tCanvas) { tCanvas.width = tCanvas.parentElement.clientWidth; tCanvas.height = tCanvas.parentElement.clientHeight; } 
}
function initTrackerGame() {
    resizeCanvas();
    const tCanvas = document.getElementById('tracker-canvas');
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
    trackerState.phase = 'memorize'; trackerState.isPlaying = true; document.getElementById('tracker-overlay').classList.add('hidden');
    renderTracker();
    setTimeout(() => {
        if(!trackerState.isPlaying) return; trackerState.phase = 'move';
        setTimeout(() => {
            if(!trackerState.isPlaying) return; trackerState.phase='select';
            document.getElementById('tracker-overlay').classList.remove('hidden'); 
            document.getElementById('tracker-start').style.display='none';
        }, 4000);
    }, 2000);
}
function renderTracker() {
    const tCanvas = document.getElementById('tracker-canvas');
    const tCtx = tCanvas.getContext('2d');
    if(!tCanvas.offsetParent) return;
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

let visCancelState = { isPlaying: false, score: 0, timeLeft: 45, timer: null };
function initVisCancel() {
    document.getElementById('vis-cancel-grid').innerHTML = ''; visCancelState.isPlaying = false;
    document.getElementById('vis-cancel-timer').textContent = '45';
}

// ====== 4. Video Discrimination ======
let videoState = { isPlaying: false, shapes: [], answer: 0 };
function initVisVideo() {
    document.getElementById('video-overlay').classList.remove('hidden');
    document.getElementById('video-question-box').classList.add('hidden');
}

// ====== 5. Auditory Modules ======
let audReactState = { isPlaying: false, targetColor: '', startTime: 0 };
function initAudReact() { audReactState.isPlaying = false; }

let audSpanState = { isPlaying: false, currentLevel: 3, sequence: [], userIdx: 0 };
function initAudSpan() { audSpanState.isPlaying = false; document.getElementById('aud-span-input-box').classList.add('hidden'); }

let memRevState = { isPlaying: false };
function initMemReverse() { document.getElementById('mem-rev-input').disabled = true; document.getElementById('mem-rev-input').value = ''; }

// ====== 6. New Interface Modules (Aud Inter, Word Repeat, Wechsler) ======
let audInterTarget = "";
function initAudInter() {
    document.getElementById('aud-inter-input-box').classList.add('hidden');
    document.getElementById('aud-inter-start').classList.remove('hidden');
}

let memRepeatTarget = "";
function initMemRepeat() {
    document.getElementById('mem-repeat-input-box').classList.add('hidden');
    document.getElementById('mem-repeat-start').classList.remove('hidden');
}

function initAssessmentWechsler() {
    const sScoreStr = localStorage.getItem('focus_schulte_best_5');
    const aSpanStr = localStorage.getItem('focus_aud_span_best');
    if(sScoreStr) document.getElementById('wec-vis-score').textContent = sScoreStr + "s";
    if(aSpanStr) document.getElementById('wec-aud-score').textContent = aSpanStr + "级";
    const sScore = parseFloat(sScoreStr), aSpan = parseInt(aSpanStr);
    if(sScore && aSpan) {
        const iqEst = Math.round(90 + (aSpan * 5) + (100 / sScore * 10));
        document.getElementById('wec-iq-score').textContent = iqEst;
        document.getElementById('wec-advice').textContent = `评估状态：${iqEst > 115 ? '优秀' : iqEst > 95 ? '良好' : '均衡进步中'}。`;
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
    setupNavigation();
    updateDashboard();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Event Bindings
    document.getElementById('schulte-start').onclick = () => schulteState.isPlaying ? endSchulteGame(false) : startSchulteGame();
    document.getElementById('schulte-size').onchange = (e) => { schulteState.size = parseInt(e.target.value); generateSchulteGrid(); };
    document.getElementById('tracker-start').onclick = initTrackerGame;
    document.getElementById('vis-speed-yes').onclick = () => { if(visSpeedState.isPlaying) { const win = visSpeedState.currentGroup.includes(visSpeedState.currentTarget); if(win) visSpeedState.score++; else visSpeedState.timeLeft -= 2; nextVisSpeedRound(); } };
    document.getElementById('vis-speed-no').onclick = () => { if(visSpeedState.isPlaying) { const win = visSpeedState.currentGroup.includes(visSpeedState.currentTarget); if(!win) visSpeedState.score++; else visSpeedState.timeLeft -= 2; nextVisSpeedRound(); } };
    
    document.getElementById('vis-cancel-start').onclick = () => {
        const grid = document.getElementById('vis-cancel-grid');
        grid.innerHTML = ''; visCancelState.isPlaying = true; visCancelState.score = 0; visCancelState.timeLeft = 45;
        for(let i=0; i<225; i++) {
            const char = ['p','b','d','q'][Math.floor(Math.random()*4)];
            const cell = document.createElement('div'); cell.className = 'cancel-cell'; cell.textContent = char;
            cell.onclick = () => { if(visCancelState.isPlaying && char === 'p' && !cell.classList.contains('selected')) { cell.classList.add('selected'); visCancelState.score++; } };
            grid.appendChild(cell);
        }
        visCancelState.timer = setInterval(() => {
            if(--visCancelState.timeLeft <= 0) { clearInterval(visCancelState.timer); visCancelState.isPlaying = false; alert(`结束！找到 ${visCancelState.score} 个目标`); updateDashboard(); }
            document.getElementById('vis-cancel-timer').textContent = visCancelState.timeLeft;
        }, 1000);
    };

    document.getElementById('video-start').onclick = () => {
        document.getElementById('video-overlay').classList.add('hidden');
        videoState.isPlaying = true;
        const colors = ['#da3633', '#40c4ff', '#2ea043'], types = ['rect', 'circle'];
        const targetColor = colors[Math.floor(Math.random()*3)], targetType = types[Math.floor(Math.random()*2)];
        videoState.shapes = []; let count = 0;
        const vCanvas = document.getElementById('video-canvas'), vCtx = vCanvas.getContext('2d');
        for(let i=0; i<8; i++) {
            const c = colors[Math.floor(Math.random()*3)], t = types[Math.floor(Math.random()*2)];
            if(c === targetColor && t === targetType) count++;
            videoState.shapes.push({x: Math.random()*vCanvas.width, y: Math.random()*vCanvas.height, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, c, t, size: 30+Math.random()*20});
        }
        videoState.answer = count;
        let start = Date.now();
        const anim = () => {
            if(!videoState.isPlaying) return;
            vCtx.clearRect(0,0,vCanvas.width,vCanvas.height);
            videoState.shapes.forEach(s => {
                s.x += s.vx; s.y += s.vy; if(s.x<0 || s.x>vCanvas.width) s.vx*=-1; if(s.y<0 || s.y>vCanvas.height) s.vy*=-1;
                vCtx.fillStyle = s.c; vCtx.beginPath(); if(s.t==='rect') vCtx.fillRect(s.x, s.y, s.size, s.size); else { vCtx.arc(s.x, s.y, s.size/2, 0, Math.PI*2); vCtx.fill(); }
            });
            if(Date.now()-start < 4000) requestAnimationFrame(anim);
            else {
                videoState.isPlaying = false; vCtx.clearRect(0,0,vCanvas.width,vCanvas.height);
                document.getElementById('video-question-box').classList.remove('hidden');
                document.getElementById('video-question').textContent = `出现了几个 ${targetColor==='#da3633'?'红色':targetColor==='#40c4ff'?'蓝色':'绿色'} 的 ${targetType==='rect'?'正方形':'圆形'}？`;
                const opts = document.getElementById('video-options'); opts.innerHTML = '';
                [videoState.answer, videoState.answer+1, Math.max(0, videoState.answer-1)].sort(()=>Math.random()-0.5).forEach(opt => {
                    const b = document.createElement('button'); b.className = 'btn glass'; b.textContent = opt;
                    b.onclick = () => { alert(opt===videoState.answer?"正确！":"错误！"); initVisVideo(); };
                    opts.appendChild(b);
                });
            }
        }; anim();
    };

    document.getElementById('aud-react-start').onclick = () => {
        audReactState.isPlaying = true; document.getElementById('aud-react-start').disabled = true;
        setTimeout(() => {
            const c = ['red', 'blue', 'green'][Math.floor(Math.random()*3)];
            audReactState.targetColor = c;
            Speech.speak(c==='red'?'红色':c==='blue'?'蓝色':'绿色', () => { audReactState.startTime = Date.now(); });
        }, 1000 + Math.random()*2000);
    };
    document.querySelectorAll('.btn-circle').forEach(b => {
        b.onclick = () => {
            if(!audReactState.isPlaying || !audReactState.startTime) return;
            if(b.getAttribute('data-color') === audReactState.targetColor) alert(`正确！用时 ${Date.now()-audReactState.startTime}ms`);
            else alert("选错了！");
            audReactState.isPlaying = false; audReactState.startTime = 0; document.getElementById('aud-react-start').disabled = false;
        };
    });

    document.getElementById('aud-span-start').onclick = () => {
        audSpanState.isPlaying = true; document.getElementById('aud-span-start').classList.add('hidden');
        audSpanState.sequence = Array.from({length: audSpanState.currentLevel}, () => Math.floor(Math.random()*10));
        let i = 0;
        const iv = setInterval(() => {
            if(i < audSpanState.sequence.length) Speech.speak(audSpanState.sequence[i++].toString());
            else {
                clearInterval(iv); setTimeout(() => {
                    document.getElementById('aud-span-input-box').classList.remove('hidden');
                    document.getElementById('aud-span-input').value = ''; document.getElementById('aud-span-input').focus();
                }, 1000);
            }
        }, 1200);
    };
    document.getElementById('aud-span-submit').onclick = () => {
        if(document.getElementById('aud-span-input').value === audSpanState.sequence.join('')) {
            audSpanState.currentLevel++; alert("正确！"); document.getElementById('aud-span-input-box').classList.add('hidden'); document.getElementById('aud-span-start').classList.remove('hidden');
        } else {
            alert(`失败！得分 ${audSpanState.currentLevel-1}`); localStorage.setItem('focus_aud_span_best', Math.max(audSpanState.currentLevel-1, parseInt(localStorage.getItem('focus_aud_span_best')||0)));
            audSpanState.currentLevel = 3; initAudSpan(); document.getElementById('aud-span-start').classList.remove('hidden'); updateDashboard();
        }
    };

    document.getElementById('mem-rev-start').onclick = () => {
        const w = ['苹果','大海','蓝天','森林','书本'][Math.floor(Math.random()*5)];
        Speech.speak(w, () => {
            const inp = document.getElementById('mem-rev-input'); inp.disabled = false; inp.value = ''; inp.focus();
            inp.onkeypress = (e) => { if(e.key==='Enter') { if(inp.value === w.split('').reverse().join('')) alert("全对！"); else alert("不正确！"); initMemReverse(); } };
        });
    };

    document.getElementById('aud-inter-start').onclick = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        audInterTarget = Array.from({length: 4}, () => Math.floor(Math.random()*10)).join('');
        document.getElementById('aud-inter-start').classList.add('hidden');
        osc.start(); Speech.speak(audInterTarget, () => {
            osc.stop(); document.getElementById('aud-inter-input-box').classList.remove('hidden');
            document.getElementById('aud-inter-input').value = ''; document.getElementById('aud-inter-input').focus();
        });
    };
    document.getElementById('aud-inter-submit').onclick = () => {
        if(document.getElementById('aud-inter-input').value === audInterTarget) alert("正确！");
        else alert("失败！"); initAudInter();
    };

    document.getElementById('mem-repeat-start').onclick = () => {
        memRepeatTarget = SENTENCES[Math.floor(Math.random()*SENTENCES.length)];
        document.getElementById('mem-repeat-start').classList.add('hidden');
        Speech.speak(memRepeatTarget, () => {
            document.getElementById('mem-repeat-input-box').classList.remove('hidden');
            document.getElementById('mem-repeat-input').value = ''; document.getElementById('mem-repeat-input').focus();
        });
    };
    document.getElementById('mem-repeat-submit').onclick = () => {
        if(document.getElementById('mem-repeat-input').value.trim() === memRepeatTarget) alert("全对！");
        else alert("有偏误！"); initMemRepeat();
    };

    document.getElementById('wec-run').onclick = () => { initAssessmentWechsler(); alert("评估报告已刷新！"); };

    document.getElementById('breathing-start').onclick = () => {
        if(breathState.isPlaying) stopBreathing();
        else {
            breathState.isPlaying = true; document.getElementById('breathing-start').textContent = '停止';
            const cycle = () => {
                if(!breathState.isPlaying) return;
                const c = document.getElementById('b-circle'); const t = document.getElementById('b-instruction');
                t.textContent = '吸气...'; c.className = 'b-circle glass inhale';
                breathState.interval = setTimeout(() => {
                    t.textContent = '呼气...'; c.className = 'b-circle glass exhale';
                    breathState.interval = setTimeout(() => { breathState.totalSeconds += 8; cycle(); }, 4000);
                }, 4000);
            }; cycle();
        }
    };
});
