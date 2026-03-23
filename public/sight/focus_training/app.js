// ====== Global State & Navigation ======
const navLinks = document.querySelectorAll('.nav-links li');
const views = document.querySelectorAll('.view');
const viewTitle = document.getElementById('view-title');

const state = {
    currentView: 'dashboard'
};

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetView = link.getAttribute('data-view');
        if(state.currentView === targetView) return;
        
        // Active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        views.forEach(v => v.classList.remove('active-view'));
        document.getElementById(targetView).classList.add('active-view');
        
        viewTitle.textContent = link.querySelector('span:last-child') ? link.querySelector('span:last-child').textContent : 'Focus Pro';
        state.currentView = targetView;
        
        initView(targetView);
    });
});

function initView(viewId) {
    if(viewId === 'dashboard') updateDashboard();
    if(viewId === 'schulte' && !schulteState.isPlaying) generateSchulteGrid();
    if(viewId === 'tracker' && !trackerState.isPlaying) renderTracker(0); // initial draw
}

// ====== Dashboard System ======
function updateDashboard() {
    const schulteBest = localStorage.getItem('focus_schulte_best_5') || '--:--';
    document.getElementById('ds-schulte-best').textContent = schulteBest;
    
    const trackerV = localStorage.getItem('focus_tracker_lvl') || '1';
    document.getElementById('ds-tracker-best').textContent = `Lv ${trackerV}`;
    
    const breathMins = localStorage.getItem('focus_breath_mins') || '0';
    document.getElementById('ds-breath-time').textContent = `${breathMins} 分钟`;
}

// Initialize on Load
updateDashboard();

// ====== 1. Schulte Grid Module ======
const sGrid = document.getElementById('schulte-grid');
const sSizeSelect = document.getElementById('schulte-size');
const sTimerDisplay = document.getElementById('schulte-timer');
const sStartBtn = document.getElementById('schulte-start');

let schulteState = {
    isPlaying: false,
    expectedNumber: 1,
    size: 5,
    timerInterval: null,
    startTime: 0
};

sStartBtn.addEventListener('click', () => {
    if(schulteState.isPlaying) {
        endSchulteGame(false);
    } else {
        startSchulteGame();
    }
});

sSizeSelect.addEventListener('change', (e) => {
    if(schulteState.isPlaying) endSchulteGame(false);
    schulteState.size = parseInt(e.target.value);
    generateSchulteGrid();
});

function generateSchulteGrid() {
    sGrid.innerHTML = '';
    const size = schulteState.size;
    const totalCells = size * size;
    
    sGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    sGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
    // Responsive sizing
    let cellSize = size === 3 ? '100px' : size === 4 ? '80px' : '65px';
    if(window.innerWidth < 600) {
        cellSize = size === 3 ? '80px' : size === 4 ? '65px' : '52px';
    }
    
    let numbers = Array.from({length: totalCells}, (_, i) => i + 1);
    // Shuffle Array
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    numbers.forEach(num => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.style.width = cellSize;
        cell.style.height = cellSize;
        cell.textContent = num;
        
        // click event
        cell.addEventListener('mousedown', () => handleCellClick(cell, num));
        
        sGrid.appendChild(cell);
    });
}

function handleCellClick(cell, num) {
    if (!schulteState.isPlaying) return;
    
    if (num === schulteState.expectedNumber) {
        // Success Hit
        cell.classList.add('active-hit');
        schulteState.expectedNumber++;
        setTimeout(() => cell.classList.remove('active-hit'), 200);
        
        if (schulteState.expectedNumber > schulteState.size * schulteState.size) {
            endSchulteGame(true);
        }
    } else {
        // Error Hit
        cell.classList.add('error-hit');
        // add time penalty
        schulteState.startTime -= 1000; 
        
        setTimeout(() => cell.classList.remove('error-hit'), 300);
    }
}

function startSchulteGame() {
    schulteState.isPlaying = true;
    schulteState.expectedNumber = 1;
    sStartBtn.textContent = '放弃挑战';
    sStartBtn.classList.replace('primary', 'danger');
    generateSchulteGrid();
    
    schulteState.startTime = Date.now();
    schulteState.timerInterval = setInterval(() => {
        const elapsed = (Date.now() - schulteState.startTime) / 1000;
        sTimerDisplay.textContent = elapsed.toFixed(2);
    }, 40);
}

function endSchulteGame(completed) {
    schulteState.isPlaying = false;
    clearInterval(schulteState.timerInterval);
    sStartBtn.textContent = '开始挑战';
    sStartBtn.classList.replace('danger', 'primary');
    
    if (completed) {
        const finalTime = (Date.now() - schulteState.startTime) / 1000;
        sTimerDisplay.textContent = finalTime.toFixed(2);
        
        // Save best score
        const storageKey = `focus_schulte_best_${schulteState.size}`;
        const currentBest = parseFloat(localStorage.getItem(storageKey)) || Infinity;
        
        if(finalTime < currentBest) {
            localStorage.setItem(storageKey, finalTime.toFixed(2));
            setTimeout(() => alert(`🎉 新纪录！用时：${finalTime.toFixed(2)} 秒`), 100);
        } else {
            setTimeout(() => alert(`完成！用时：${finalTime.toFixed(2)} 秒`), 100);
        }
        updateDashboard();
    } else {
        sTimerDisplay.textContent = "00.00";
    }
}

generateSchulteGrid();

// ====== 2. Tracker Module ======
const tCanvas = document.getElementById('tracker-canvas');
const tCtx = tCanvas.getContext('2d');
const tStartBtn = document.getElementById('tracker-start');
const tOverlay = document.getElementById('tracker-overlay');
const tScoreDisp = document.getElementById('tracker-score');
const tLevelDisp = document.getElementById('tracker-level');
const tTitle = document.getElementById('tracker-overlay-title');
const tDesc = document.getElementById('tracker-overlay-desc');

let trackerState = {
    isPlaying: false,
    score: 0,
    level: 1,
    balls: [],
    targetIndices: [],
    numBalls: 5,
    numTargets: 2,
    speed: 1.5,
    phase: 'idle', // idle, memorize, move, select
    animationId: null,
    selectedTargets: []
};

function resizeCanvas() {
    tCanvas.width = tCanvas.parentElement.clientWidth;
    tCanvas.height = tCanvas.parentElement.clientHeight;
}
window.addEventListener('resize', () => {
    if(state.currentView === 'tracker') resizeCanvas();
});

class Ball {
    constructor(x, y, vx, vy, radius) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.isTarget = false;
        this.isSelected = false;
        this.isCorrect = false;
        this.color = '#30363d';
    }
    
    update(width, height) {
        if (trackerState.phase === 'move') {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x - this.radius <= 0 || this.x + this.radius >= width) {
                this.vx *= -1;
                this.x = this.x - this.radius <= 0 ? this.radius : width - this.radius;
            }
            if (this.y - this.radius <= 0 || this.y + this.radius >= height) {
                this.vy *= -1;
                this.y = this.y - this.radius <= 0 ? this.radius : height - this.radius;
            }
        }
    }
    
    draw(ctx, phase) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        let fillStyle = this.color;
        
        if (phase === 'memorize' && this.isTarget) {
            fillStyle = '#58a6ff'; // target highlight
            ctx.shadowColor = '#58a6ff';
            ctx.shadowBlur = 15;
        } else if (phase === 'select') {
            if (this.isSelected) {
                if (this.isCorrect) fillStyle = '#2ea043'; 
                else fillStyle = '#da3633'; 
            }
        }
        
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0; 
        
        ctx.strokeStyle = '#8b949e';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    isClicked(mx, my) {
        const dx = this.x - mx;
        const dy = this.y - my;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }
}

function initTrackerGame() {
    resizeCanvas();
    const w = tCanvas.width;
    const h = tCanvas.height;
    
    trackerState.numBalls = 4 + Math.floor(trackerState.level / 2);
    trackerState.numTargets = 1 + Math.ceil(trackerState.level / 3);
    trackerState.speed = 1.0 + (trackerState.level * 0.2);
    
    trackerState.balls = [];
    trackerState.targetIndices = [];
    trackerState.selectedTargets = [];
    
    for(let i=0; i<trackerState.numBalls; i++) {
        let radius = window.innerWidth < 600 ? 16 : 22;
        let x = Math.random() * (w - radius * 2) + radius;
        let y = Math.random() * (h - radius * 2) + radius;
        let angle = Math.random() * Math.PI * 2;
        let vx = Math.cos(angle) * trackerState.speed;
        let vy = Math.sin(angle) * trackerState.speed;
        
        trackerState.balls.push(new Ball(x, y, vx, vy, radius));
    }
    
    while(trackerState.targetIndices.length < trackerState.numTargets) {
        let r = Math.floor(Math.random() * trackerState.numBalls);
        if(trackerState.targetIndices.indexOf(r) === -1) {
            trackerState.targetIndices.push(r);
            trackerState.balls[r].isTarget = true;
        }
    }
    
    trackerState.phase = 'memorize';
    trackerState.isPlaying = true;
    tOverlay.classList.add('hidden');
    
    renderTracker();
    
    setTimeout(() => {
        if(!trackerState.isPlaying) return;
        trackerState.phase = 'move';
        setTimeout(() => {
            if(!trackerState.isPlaying) return;
            trackerState.phase = 'select';
            tTitle.textContent = "现在的目标在哪里？";
            tDesc.textContent = `请点出刚才闪烁的 ${trackerState.numTargets} 个目标`;
            tOverlay.classList.remove('hidden');
            tStartBtn.style.display = 'none'; 
        }, 4500);
    }, 2500);
}

function renderTracker(time) {
    if(!tCanvas.offsetParent) return; 
    
    tCtx.clearRect(0, 0, tCanvas.width, tCanvas.height);
    
    trackerState.balls.forEach(ball => {
        ball.update(tCanvas.width, tCanvas.height);
    });
    
    if(trackerState.phase === 'move') {
        for(let i=0; i<trackerState.balls.length; i++) {
            for(let j=i+1; j<trackerState.balls.length; j++) {
                let b1 = trackerState.balls[i];
                let b2 = trackerState.balls[j];
                let dx = b2.x - b1.x;
                let dy = b2.y - b1.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let minDist = b1.radius + b2.radius;
                
                if(dist < minDist) {
                    let tempVx = b1.vx;
                    let tempVy = b1.vy;
                    b1.vx = b2.vx;
                    b1.vy = b2.vy;
                    b2.vx = tempVx;
                    b2.vy = tempVy;
                    
                    let overlap = minDist - dist;
                    let nx = dx/dist || 1;
                    let ny = dy/dist || 0;
                    b1.x -= nx * overlap/2;
                    b1.y -= ny * overlap/2;
                    b2.x += nx * overlap/2;
                    b2.y += ny * overlap/2;
                }
            }
        }
    }
    
    trackerState.balls.forEach(ball => {
        ball.draw(tCtx, trackerState.phase);
    });
    
    if(trackerState.isPlaying) {
        trackerState.animationId = requestAnimationFrame(renderTracker);
    }
}

tCanvas.addEventListener('mousedown', (e) => {
    if(trackerState.phase !== 'select') return;
    
    const rect = tCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    let hit = false;
    for(let ball of trackerState.balls) {
        if(ball.isClicked(mx, my)) {
            if(!ball.isSelected) {
                ball.isSelected = true;
                ball.isCorrect = ball.isTarget;
                trackerState.selectedTargets.push(ball);
                hit = true;
                break;
            }
        }
    }
    
    if(hit) {
        tCtx.clearRect(0, 0, tCanvas.width, tCanvas.height);
        trackerState.balls.forEach(b => b.draw(tCtx, trackerState.phase));
        
        let mistakes = trackerState.selectedTargets.filter(b => !b.isCorrect).length;
        let correctPicks = trackerState.selectedTargets.filter(b => b.isCorrect).length;
        
        if(mistakes > 0) {
            trackerState.isPlaying = false;
            trackerState.score = 0;
            trackerState.level = 1;
            tScoreDisp.textContent = trackerState.score;
            tLevelDisp.textContent = trackerState.level;
            
            setTimeout(() => {
                tTitle.textContent = "很遗憾，选错了";
                tDesc.textContent = "需要重置等级，再试一次？";
                tStartBtn.textContent = "重新开始";
                tStartBtn.style.display = 'block';
                tOverlay.classList.remove('hidden');
            }, 600);
            
        } else if (correctPicks === trackerState.numTargets) {
            trackerState.isPlaying = false;
            trackerState.score++;
            trackerState.level++;
            
            let bestLv = parseInt(localStorage.getItem('focus_tracker_lvl') || '1');
            if(trackerState.level > bestLv) {
                localStorage.setItem('focus_tracker_lvl', trackerState.level);
                updateDashboard();
            }
            
            tScoreDisp.textContent = trackerState.score;
            tLevelDisp.textContent = trackerState.level;
            
            setTimeout(() => {
                tTitle.textContent = "追踪成功！👏";
                tDesc.textContent = `准备进入第 ${trackerState.level} 关`;
                tStartBtn.textContent = "挑战下一关";
                tStartBtn.style.display = 'block';
                tOverlay.classList.remove('hidden');
            }, 800);
        }
    }
});

tCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if(trackerState.phase !== 'select') return;
    const rect = tCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
    tCanvas.dispatchEvent(new MouseEvent('mousedown', fakeEvent));
}, {passive: false});

tStartBtn.addEventListener('click', () => {
    initTrackerGame();
});

// ====== 3. Breathing Module ======
const bPatternSelect = document.getElementById('breathing-pattern');
const bStartBtn = document.getElementById('breathing-start');
const bCircle = document.getElementById('b-circle');
const bText = document.getElementById('b-instruction');
const bProgress = document.getElementById('b-progress');
const bProgressCont = document.querySelector('.b-progress-container');

let breathState = {
    isPlaying: false,
    interval: null,
    totalSeconds: 0,
    startTime: 0,
};

bStartBtn.addEventListener('click', () => {
    if(breathState.isPlaying) {
        stopBreathing();
    } else {
        startBreathing();
    }
});

function stopBreathing() {
    breathState.isPlaying = false;
    clearTimeout(breathState.interval);
    bStartBtn.textContent = '开始呼吸';
    bStartBtn.classList.replace('danger', 'primary');
    bCircle.className = 'b-circle glass';
    bCircle.style.transition = 'transform 0.5s ease, background 0.5s ease';
    bText.textContent = '完成';
    bProgressCont.style.display = 'none';
    
    let minutes = Math.floor(breathState.totalSeconds / 60);
    if(minutes > 0) {
        let current = parseInt(localStorage.getItem('focus_breath_mins') || 0);
        localStorage.setItem('focus_breath_mins', current + minutes);
        updateDashboard();
    }
}

function startBreathing() {
    breathState.isPlaying = true;
    bStartBtn.textContent = '结束训练';
    bStartBtn.classList.replace('primary', 'danger');
    breathState.totalSeconds = 0;
    
    bProgressCont.style.display = 'block';
    
    const pattern = bPatternSelect.value;
    runCycle(pattern);
}

function runCycle(pattern) {
    if(!breathState.isPlaying) return;
    
    if(pattern === '478') { 
        bText.textContent = '吸气...';
        bCircle.style.transition = 'transform 4s linear, background 4s linear, box-shadow 4s linear';
        bCircle.className = 'b-circle glass inhale';
        animateProgress(4000);
        
        breathState.interval = setTimeout(() => {
            if(!breathState.isPlaying) return;
            bText.textContent = '屏住呼吸';
            bCircle.style.transition = 'transform 7s linear, background 7s linear, box-shadow 7s linear';
            bCircle.className = 'b-circle glass hold';
            animateProgress(7000);
            
            breathState.interval = setTimeout(() => {
                if(!breathState.isPlaying) return;
                bText.textContent = '呼气...';
                bCircle.style.transition = 'transform 8s linear, background 8s linear, box-shadow 8s linear';
                bCircle.className = 'b-circle glass exhale';
                animateProgress(8000);
                
                breathState.interval = setTimeout(() => {
                    breathState.totalSeconds += 19;
                    runCycle(pattern);
                }, 8000);
            }, 7000);
        }, 4000);
    } else {
        bText.textContent = '吸气...';
        bCircle.style.transition = 'transform 4s linear, background 4s linear, box-shadow 4s linear';
        bCircle.className = 'b-circle glass inhale';
        animateProgress(4000);
        
        breathState.interval = setTimeout(() => {
            if(!breathState.isPlaying) return;
            bText.textContent = '屏住呼吸';
            bCircle.style.transition = 'transform 4s linear, background 4s linear, box-shadow 4s linear';
            bCircle.className = 'b-circle glass hold';
            animateProgress(4000);
            
            breathState.interval = setTimeout(() => {
                if(!breathState.isPlaying) return;
                bText.textContent = '呼气...';
                bCircle.style.transition = 'transform 4s linear, background 4s linear, box-shadow 4s linear';
                bCircle.className = 'b-circle glass exhale';
                animateProgress(4000);
                
                breathState.interval = setTimeout(() => {
                    if(!breathState.isPlaying) return;
                    bText.textContent = '屏息...';
                    bCircle.style.transition = 'transform 4s linear, background 4s linear, box-shadow 4s linear';
                    bCircle.className = 'b-circle glass hold';
                    animateProgress(4000);
                    
                    breathState.interval = setTimeout(() => {
                        breathState.totalSeconds += 16;
                        runCycle(pattern);
                    }, 4000);
                }, 4000);
            }, 4000);
        }, 4000);
    }
}

function animateProgress(duration) {
    bProgress.style.transition = 'none';
    bProgress.style.width = '0%';
    void bProgress.offsetWidth; 
    bProgress.style.transition = `width ${duration}ms linear`;
    bProgress.style.width = '100%';
}
