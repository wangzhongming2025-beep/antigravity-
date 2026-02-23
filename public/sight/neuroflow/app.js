// NeuroFlow - Full Integrated Application Logic
document.addEventListener('DOMContentLoaded', () => {
    console.log('NeuroFlow AI Edition initialized...');

    // Global State
    let focusCoins = 1240;
    const coinDisplay = document.getElementById('focus-coins');

    // Persistence: Identity
    const savedIdentity = localStorage.getItem('neuro_identity');
    if (savedIdentity) {
        const dashVal = document.querySelector('#identity-engine .card-value');
        if (dashVal) dashVal.innerText = savedIdentity;
    }

    // Inject Tracker Script if not loaded
    if (!window.NeuroTracker) {
        const s = document.createElement('script');
        s.src = 'tracker.js';
        document.head.appendChild(s);
    }

    // DOM Elements
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.getElementById('close-modal');

    // Module Actions
    const modules = {
        'breath-cabin': initBreathingModule,
        'identity-engine': initIdentityModule,
        'task-deconstructor': initTaskModule,
        'recall-test': initRecallModule,
        'reward-shop': initRewardModule,
        'dopamine-detox': initDetoxModule,
        'neural-push': initPushModule,
        'weekly-insights': (c) => {
            c.innerHTML = '<h2 class="module-title">神经数据透视</h2><p style="color:var(--text-muted);">实时监测您的大脑节律稳定性。</p><button class="btn-primary" onclick="window.location.reload()">同步最新设备数据</button>';
        }
    };

    // Attach Click Events
    Object.keys(modules).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                // Prevent double trigger if button inside is clicked
                if (e.target.tagName === 'BUTTON') return;
                showModal(modules[id]);
            });
            // Also attach to the button inside specifically for clarity
            const btn = el.querySelector('button');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showModal(modules[id]);
                });
            }
        }
    });

    closeModal.addEventListener('click', hideModal);

    // Modal Management
    function showModal(contentFN) {
        modalContent.innerHTML = '';
        contentFN(modalContent);
        modalContainer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modalContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // --- Helper Logic ---
    async function callNeuroAI(type, content, extra = {}) {
        console.log(`正在请求 AI: ${type}...`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

            const response = await fetch('/api/neuro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, content, ...extra }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (data.error) {
                console.error("服务器报错:", data.error);
                // Ensure data.error is a string if it's an object from curl/http error
                const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
                return `神经中枢异常：${errorMsg}`;
            }

            if (data.choices && data.choices[0]) {
                return data.choices[0].message.content;
            }
            if (data.content) return data; // It's already parsed JSON from the new API
            return "AI 暂时没有给出有效指令，请重试。";
        } catch (e) {
            console.error("请求失败:", e);
            if (e.name === 'AbortError') return "神经中枢响应超时，请检查网络或重试。";
            return "连接神经中枢失败，请检查服务器 PHP 环境。";
        }
    }

    function triggerCoinEffect() {
        const overlay = document.getElementById('coin-overlay');
        for (let i = 0; i < 15; i++) {
            const coin = document.createElement('div');
            coin.innerHTML = '⚡';
            coin.style.position = 'absolute';
            coin.style.left = Math.random() * 100 + 'vw';
            coin.style.top = '100vh';
            coin.style.fontSize = '24px';
            coin.style.transition = `all ${1 + Math.random()}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            overlay.appendChild(coin);
            setTimeout(() => {
                coin.style.transform = `translateY(-110vh) rotate(${Math.random() * 360}deg)`;
                coin.style.opacity = '0';
            }, 50);
            setTimeout(() => coin.remove(), 2000);
        }
        focusCoins += 50;
        if (coinDisplay) coinDisplay.innerText = focusCoins.toLocaleString();
    }

    // --- Specific Modules ---
    function initBreathingModule(container) {
        container.innerHTML = `
            <h2 class="module-title" style="text-align:center;">神经唤醒：生理性叹息</h2>
            <div class="breathing-circle-container" style="display:flex; justify-content:center; align-items:center; height: 180px;">
                <div id="breath-circle" style="width: 80px; height: 80px; border-radius: 50%; background: var(--gradient-main); box-shadow: 0 0 50px var(--primary-neon); transition: all 3s ease-in-out;"></div>
            </div>
            <div id="breath-instruction" style="text-align:center; font-size: 20px; font-weight:700; color: var(--primary-neon); height: 40px; margin-bottom:20px;">准备好重置你的神经系统吗？</div>
            <button class="btn-primary" id="start-breath">开始 & 领取 50 专注币</button>
        `;
        const circle = document.getElementById('breath-circle');
        const instruction = document.getElementById('breath-instruction');
        const startBtn = document.getElementById('start-breath');
        startBtn.addEventListener('click', () => {
            startBtn.disabled = true;
            let cycle = 0; let phase = 0;
            const phases = [
                { text: '深吸气...', scale: 1.5, duration: 2500 },
                { text: '叠吸一小口!', scale: 1.8, duration: 800 },
                { text: '缓慢呼气...', scale: 0.8, duration: 5000 }
            ];
            function runPhase() {
                if (cycle >= 3) {
                    instruction.innerText = "神经重置完成！";
                    circle.style.transform = 'scale(1)';
                    triggerCoinEffect();
                    startBtn.innerText = "再回舱室";
                    startBtn.disabled = false;
                    return;
                }
                const p = phases[phase];
                instruction.innerText = p.text;
                circle.style.transform = `scale(${p.scale})`;
                circle.style.transitionDuration = `${p.duration}ms`;
                setTimeout(() => {
                    phase++;
                    if (phase >= phases.length) { phase = 0; cycle++; }
                    runPhase();
                }, p.duration);
            }
            runPhase();
        });
    }

    async function initIdentityModule(container) {
        container.innerHTML = `
            <h2 class="module-title">身份宣言引擎 (AI)</h2>
            <div id="id-editor">
                <p style="color:var(--text-muted); font-size:14px; margin-bottom:15px;">输入你现在的大脑状态：</p>
                <input type="text" id="id-input" placeholder="如：焦虑、拖延..." style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); padding:12px; border-radius:8px; color:#fff;">
                <button class="btn-primary" id="generate-id" style="margin-top:15px;">AI 重塑身份</button>
            </div>
            <div id="id-result-panel" style="display:none; margin-top:20px;">
                <div id="share-card" class="glass-panel" style="padding:40px; text-align:center; border:2px solid var(--primary-neon);">
                    <p id="id-text" style="font-size: 22px; font-weight: 700; font-style: italic;">--</p>
                </div>
                <button class="btn-primary" id="btn-regen-id" style="margin-top:15px; background:transparent; border:1px solid var(--glass-border);">换个说法</button>
            </div>
        `;
        const btn = document.getElementById('generate-id');
        const input = document.getElementById('id-input');
        const resPanel = document.getElementById('id-result-panel');
        const idText = document.getElementById('id-text');
        btn.addEventListener('click', async () => {
            const val = input.value.trim() || "正常";
            btn.innerText = "同步神经数据...";
            const aiData = await callNeuroAI('identity', val);
            const content = aiData.content || aiData;
            const cleanResponse = `“${content.replace(/\"/g, '')}”`;
            idText.innerText = cleanResponse;

            // Track Stress if AI provided impact
            if (aiData.stress_impact && window.NeuroTracker) {
                window.NeuroTracker.updateStress(aiData.stress_impact);
            }

            // Sync to Dashboard & LocalStorage
            localStorage.setItem('neuro_identity', cleanResponse);
            const dashVal = document.querySelector('#identity-engine .card-value');
            if (dashVal) dashVal.innerText = cleanResponse;

            document.getElementById('id-editor').style.display = 'none';
            resPanel.style.display = 'block';
        });
        document.getElementById('btn-regen-id').addEventListener('click', () => {
            resPanel.style.display = 'none';
            document.getElementById('id-editor').style.display = 'block';
            btn.innerText = "AI 重塑身份";
        });
    }

    function initTaskModule(container) {
        container.innerHTML = `
            <h2 class="module-title">多巴胺任务切片机 (Dopamine Slicer)</h2>
            <textarea id="task-input" placeholder="输入你想做但不敢开始的任务..." style="width:100%; height:80px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); padding:12px; border-radius:8px; color:#fff; margin-top:15px;"></textarea>
            <button class="btn-primary" id="deconstruct-btn" style="margin-top:15px;">让 AI 开始拆解</button>
            <div id="task-res" style="display:none; margin-top:20px;">
                <div id="task-list" style="color:var(--text-muted); font-size:14px; white-space:pre-wrap; line-height:1.8;"></div>
            </div>
        `;
        const btn = document.getElementById('deconstruct-btn');
        btn.addEventListener('click', async () => {
            const task = document.getElementById('task-input').value;
            if (!task) return;
            btn.innerText = "AI 拆解中...";
            const aiData = await callNeuroAI('task', task);
            document.getElementById('task-list').innerText = aiData.content || aiData;
            document.getElementById('task-res').style.display = 'block';
            btn.style.display = 'none';

            // Gain small focus coins for planning
            triggerCoinEffect();
        });
    }

    function initRecallModule(container) {
        container.innerHTML = `
            <h2 class="module-title">主动提取测试</h2>
            <div id="recall-step-1">
                <textarea id="original-content" placeholder="输入学习内容..." style="width:100%; height:100px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:#fff;"></textarea>
                <button class="btn-primary" id="btn-lock" style="margin-top:15px;">锁定并记忆</button>
            </div>
            <div id="recall-step-2" style="display:none;">
                <textarea id="recall-input" placeholder="请凭记忆复述..." style="width:100%; height:100px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:#fff;"></textarea>
                <button class="btn-primary" id="btn-eval" style="margin-top:15px;">提交比对</button>
            </div>
            <div id="recall-result" style="display:none; text-align:center; margin-top:20px;">
                <div id="neuro-score" style="font-size:40px; color:var(--primary-neon);">--</div>
                <p id="ai-eval" style="font-size:14px; color:var(--text-muted);"></p>
            </div>
        `;
        const s1 = document.getElementById('recall-step-1');
        const s2 = document.getElementById('recall-step-2');
        const res = document.getElementById('recall-result');
        document.getElementById('btn-lock').addEventListener('click', () => {
            if (document.getElementById('original-content').value) { s1.style.display = 'none'; s2.style.display = 'block'; }
        });
        document.getElementById('btn-eval').addEventListener('click', async () => {
            const original = document.getElementById('original-content').value;
            const recall = document.getElementById('recall-input').value;
            const btn = document.getElementById('btn-eval');
            btn.innerText = "比对中...";
            const aiData = await callNeuroAI('recall_eval', "", { original, recall });
            const score = aiData.score || 0;
            document.getElementById('neuro-score').innerText = score;
            document.getElementById('ai-eval').innerText = aiData.feedback || (typeof aiData === 'string' ? aiData : "分析完毕");
            s2.style.display = 'none'; res.style.display = 'block';
            if (parseInt(score) > 60) {
                triggerCoinEffect();
                if (window.NeuroTracker) window.NeuroTracker.recordFocus(5); // 5 min bonus for recall
            }
        });
    }

    function initRewardModule(container) {
        container.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <h2 class="module-title" style="color:var(--primary-neon);">NeuroFlow Pro</h2>
                <p style="color:var(--text-muted); margin-bottom:25px;">解锁无限神经潜力，获得全模块深度追踪</p>
                
                <div class="glass-panel" style="background:rgba(0,0,0,0.4); padding:30px; border:1px solid rgba(0,255,194,0.3); position:relative; overflow:hidden;">
                    <div style="font-size:12px; color:var(--primary-neon); margin-bottom:10px; font-family:Orbitron;">PREMIUM PLAN</div>
                    <div style="font-size:36px; font-weight:800; margin-bottom:5px;">¥69 <span style="font-size:14px; color:var(--text-muted); font-weight:400;">/ mo</span></div>
                    <p style="font-size:13px; color:var(--text-muted);">订阅即享 AI 实时分析与云端同步</p>
                    <button class="btn-primary" id="btn-sub" style="margin-top:25px; box-shadow:0 0 30px rgba(0,255,194,0.3);">立即升级</button>
                </div>

                <div style="margin-top:20px; text-align:left; font-size:12px; color:var(--text-muted);">
                    <div style="margin-bottom:8px;">✅ 无限次身份重塑</div>
                    <div style="margin-bottom:8px;">✅ 深度 40Hz 专注报表</div>
                    <div>✅ 专属感统训练计划</div>
                </div>
            </div>
        `;
        const subBtn = document.getElementById('btn-sub');
        if (subBtn) {
            subBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                container.innerHTML = `
                    <div style="text-align:center; padding: 10px;">
                        <h2 class="module-title" style="margin-bottom:10px;">扫码加入 Pro 计划</h2>
                        <p style="color:var(--text-muted); font-size:13px; margin-bottom:20px;">支持微信支付 | 即刻开启无限可能</p>
                        <div style="position:relative; width:220px; height:220px; margin:0 auto; padding:10px; background:#fff; border-radius:16px; box-shadow: 0 0 40px rgba(0,255,194,0.2);">
                            <img src="pay_qr.jpg" style="width:200px; height:200px; border-radius:8px; display:block;">
                        </div>
                        <p style="margin-top:20px; font-size:12px; color:var(--primary-neon); font-family:Orbitron;">SECURE PAYMENT GATEWAY</p>
                        <button class="btn-primary" style="margin-top:25px; background:var(--accent-purple); box-shadow:0 0 20px rgba(138,43,226,0.3);" onclick="hideModal()">我已完成支付</button>
                    </div>
                `;
            });
        }
    }

    function initDetoxModule(container) {
        container.innerHTML = `
            <h2 class="module-title">神经受体清洗计划 (Receptor Reset)</h2>
            <textarea id="detox-input" placeholder="输入你的依赖习惯..." style="width:100%; height:80px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:#fff;"></textarea>
            <button class="btn-primary" id="btn-detox" style="margin-top:15px;">AI 生成计划</button>
            <div id="detox-res" style="display:none; margin-top:20px; max-height:200px; overflow-y:auto; font-size:14px; background:rgba(0,0,0,0.2); padding:15px; border-radius:8px;"></div>
        `;
        const btn = document.getElementById('btn-detox');
        btn.addEventListener('click', async () => {
            const habits = document.getElementById('detox-input').value;
            if (!habits) return;
            btn.innerText = "分析中...";
            btn.disabled = true; // 防止重复点击
            const aiData = await callNeuroAI('detox', habits);
            document.getElementById('detox-res').innerText = aiData.content || aiData;
            document.getElementById('detox-res').style.display = 'block';
            if (window.NeuroTracker) window.NeuroTracker.updateStress(-5); // Motivation boost
            btn.innerText = "重新生成计划";
            btn.disabled = false;
        });
    }

    function initPushModule(container) {
        container.innerHTML = `
            <h2 class="module-title">神经原语同步</h2>
            <div class="glass-panel" style="background:rgba(255,255,255,0.05); padding:20px; border-radius:12px; margin-top:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <div>
                        <p style="font-weight:700;">浏览器极简通知</p>
                        <p style="font-size:12px; color:var(--text-muted);">离开页面时，强制同步您的身份宣言</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="push-cb" ${localStorage.getItem('neuro_push') === 'true' ? 'checked' : ''}>
                    </label>
                </div>
                <button class="btn-primary" id="btn-test-push" style="background:transparent; border:1px dashed var(--primary-neon); color:var(--primary-neon); font-size:12px;">发送一次测试同步</button>
            </div>
            <p style="font-size:12px; color:var(--text-muted); margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">同步时段设定：10:30 (晨间)、15:00 (午后能量低谷)</p>
            <button class="btn-primary" id="btn-save-push" style="margin-top:20px;">保存并锁定设置</button>
        `;

        const cb = document.getElementById('push-cb');

        // 测试推送按钮
        document.getElementById('btn-test-push').addEventListener('click', () => {
            sendNeuralPush("测试同步：我是节奏的掌握者！", true);
        });

        document.getElementById('btn-save-push').addEventListener('click', async () => {
            const enabled = cb.checked;

            if (enabled && Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    alert('请允许浏览器通知权限，否则同步功能将失效！');
                    return;
                }
            }

            localStorage.setItem('neuro_push', enabled);
            updatePushStatus(enabled);
            if (enabled) sendNeuralPush("神经基准线已建立，同步已激活。");
            hideModal();
        });
    }

    // 状态更新辅助函数
    function updatePushStatus(enabled) {
        const dot = document.getElementById('push-status-dot');
        const txt = document.getElementById('push-status-text');
        if (dot) {
            dot.style.background = enabled ? 'var(--primary-neon)' : '#888';
            dot.style.boxShadow = enabled ? '0 0 10px var(--primary-neon)' : 'none';
        }
        if (txt) txt.innerText = enabled ? '已激活 (极简同步中)' : '未激活';
    }

    // 核心推送逻辑
    function sendNeuralPush(msg, forceSystem = false) {
        const identity = localStorage.getItem('neuro_identity') || "记住你的身份。";
        const finalMsg = msg.includes("测试") ? msg : identity;

        // 桌面推送 (HTTPS 必备)
        if ((Notification.permission === 'granted' && localStorage.getItem('neuro_push') === 'true') || forceSystem) {
            try {
                new Notification("🧠 NEUROFLOW", { body: finalMsg.replace(/\"/g, '') });
            } catch (e) {
                console.log("Notification not supported or failed");
            }
        }

        // 页面内 Toast 提醒
        const toast = document.createElement('div');
        toast.className = 'glass-panel';
        toast.style.cssText = `position:fixed; top:20px; right:20px; z-index:3000; border-color:var(--primary-neon); padding:15px; animation:slideIn 0.5s ease-out; background:rgba(10,12,16,0.95); max-width:280px; box-shadow:0 0 30px rgba(0,255,194,0.2);`;
        toast.innerHTML = `<div style="color:var(--primary-neon); font-size:10px; font-family:Orbitron;">🧠 NEURAL PUSH</div><div style="font-size:14px; margin-top:5px;">${finalMsg}</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // Chart
    if (document.getElementById('neuro-chart')) {
        const ctx = document.getElementById('neuro-chart').getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 255, 194, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 194, 0)');

        const logs = (window.NeuroTracker) ? window.NeuroTracker.getWeeklyData() : { focus: [45, 120, 80, 190, 140, 210, 180], stress: [80, 60, 90, 40, 50, 30, 40] };

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '深度专注时长 (分钟)',
                    data: logs.focus,
                    borderColor: '#00ffc2',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#00ffc2'
                },
                {
                    label: '皮质醇水平 (焦虑度)',
                    data: logs.stress,
                    borderColor: '#FF4B4B',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#e0e0e0' } }
                },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0a0' } },
                    x: { grid: { display: false }, ticks: { color: '#a0a0a0' } }
                }
            }
        });
    }

    // Chart Info Modal
    const infoBtn = document.getElementById('chart-info-btn');
    if (infoBtn) {
        infoBtn.onclick = (e) => {
            e.stopPropagation();
            const modalContainer = document.getElementById('modal-container');
            const modalContent = document.getElementById('modal-content');
            modalContainer.style.display = 'flex';
            modalContent.innerHTML = `
                <div class="how-to-guide">
                    <h2>📈 神经优化手册</h2>
                    
                    <h4>1. 如何解读图表？</h4>
                    <p>这是一个<strong>双轴趋势图</strong>，记录了您的执行功能状态：</p>
                    <ul>
                        <li>🟢 <strong>深度专注时长 (Focus)</strong>: 每天进入高效工作状态的累计分钟数。理想状态是线条稳定在高位。</li>
                        <li>🔴 <strong>皮质醇水平 (Stress)</strong>: 代表神经系统的焦虑与负荷。理想状态是与专注曲线形成“反向关系”。</li>
                    </ul>

                    <h4>2. 数据是如何计算的？</h4>
                    <ul>
                        <li>⚡ <strong>实时捕获</strong>: 25分钟计时器每完成一个周期，自动记录 25min；40Hz 专注波开启时，每分钟实时累加。</li>
                        <li>🤖 <strong>AI 情感分析</strong>: 当您刷新身份宣言时，AI 会分析您的语义情绪，自动换算为 0-20 点的焦虑度冲击。</li>
                        <li>💾 <strong>本地持久化</strong>: 所有数据存储在您的浏览器中，每周会自动开启新的统计周期。</li>
                    </ul>

                    <h4>3. 神经优化策略</h4>
                    <ul>
                        <li><span class="tip-badge">巅峰</span> <strong>黄金交叉点</strong>：当绿色冲顶且红色探底时，是您的学习或创作最佳时机。</li>
                        <li><span class="tip-badge">警报</span> <strong>神经赤字</strong>：若红色虚线高于绿色，说明皮质醇过载。此时应强制开启 <strong>NSDR 休息</strong> 或 <strong>Dopamine Detox</strong>。</li>
                    </ul>
                </div>
            `;
        };
    }

    // Push Loop (System Level)
    setInterval(() => {
        if (localStorage.getItem('neuro_push') === 'true') {
            sendNeuralPush("神经同步提醒");
        }
    }, 600000); // 调整为10分钟一次，避免骚扰

    // Startup: Sync UI status
    updatePushStatus(localStorage.getItem('neuro_push') === 'true');
});
