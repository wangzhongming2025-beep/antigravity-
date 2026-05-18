// NeuroFlow - ADHD-Optimized Dashboard
document.addEventListener('DOMContentLoaded', () => {
  console.log('NeuroFlow ADHD Edition initialized...');

  // ===== STATE =====
  let focusCoins = parseInt(localStorage.getItem('neuro_coins')) || 1240;
  const coinDisplay = document.getElementById('focus-coins');
  const coinBadge = document.getElementById('coin-badge');

  // ===== ONBOARDING (first visit) =====
  if (!localStorage.getItem('neuro_onboarded')) {
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  document.querySelectorAll('.onboarding-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.dataset.mood;
      localStorage.setItem('neuro_onboarded', 'true');
      document.getElementById('onboarding-overlay').style.display = 'none';
      // Small delay so the overlay dismissal feels smooth
      setTimeout(() => triggerWizard(mood), 400);
    });
  });

  const skipBtn = document.getElementById('onboarding-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      localStorage.setItem('neuro_onboarded', 'true');
      document.getElementById('onboarding-overlay').style.display = 'none';
    });
  }

  // ===== QUICK-START WIZARD =====
  document.querySelectorAll('.quick-start-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.dataset.wizard;
      triggerWizard(mood);
    });
  });

  function triggerWizard(mood) {
    const routes = {
      scattered: { name: '5分钟呼吸唤醒', url: null, module: 'breath-cabin', desc: '先用呼吸法让脑子安静下来。只需要5分钟。' },
      stuck: { name: '任务切片', url: null, module: 'task-deconstructor', desc: '把不想做的事扔进来，AI帮你切成小步。' },
      tired: { name: 'NSDR 深度休息', url: 'nsdr.html', desc: '10分钟重置神经系统，比睡觉高效。' },
      anxious: { name: '40Hz 专注波', url: '40hz.html', desc: '戴上耳机，让双耳节拍帮你 calm down。' }
    };
    const route = routes[mood] || routes.scattered;

    showModal((container) => {
      container.innerHTML = `
        <div style="text-align:center; padding: 20px 10px;">
          <div style="font-size: 48px; margin-bottom: 16px;">
            ${mood === 'scattered' ? '😫' : mood === 'stuck' ? '🧱' : mood === 'tired' ? '😴' : '🤯'}
          </div>
          <h2 class="module-title" style="margin-bottom: 8px;">${route.name}</h2>
          <p style="color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 24px;">${route.desc}</p>
          <button class="btn-primary" id="wizard-go" style="font-size: 16px; padding: 16px;">
            ${route.url ? '👉 去看看' : '🚀 开始'}
          </button>
          <button class="btn-secondary" id="wizard-cancel" style="margin-top: 8px;">算了，我自己看看</button>
        </div>
      `;

      document.getElementById('wizard-go').addEventListener('click', () => {
        hideModal();
        if (route.url) {
          window.location.href = route.url;
        } else if (route.module) {
          const el = document.getElementById(route.module);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.borderColor = 'var(--primary-neon)';
            el.style.boxShadow = '0 0 40px rgba(0,255,194,0.3)';
            setTimeout(() => {
              el.style.borderColor = '';
              el.style.boxShadow = '';
            }, 2000);
            // Auto-trigger the module's modal
            setTimeout(() => el.click(), 500);
          }
        }
      });

      document.getElementById('wizard-cancel').addEventListener('click', hideModal);
    });
  }

  // ===== FLOATING HELP BUTTON =====
  const helpBtn = document.getElementById('float-help-btn');
  const helpOptions = document.getElementById('help-options');
  let helpOpen = false;

  if (helpBtn) {
    helpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      helpOpen = !helpOpen;
      helpOptions.classList.toggle('open', helpOpen);
    });

    document.addEventListener('click', (e) => {
      if (helpOpen && !document.getElementById('float-help').contains(e.target)) {
        helpOpen = false;
        helpOptions.classList.remove('open');
      }
    });
  }

  document.getElementById('help-quick-start')?.addEventListener('click', () => {
    helpOpen = false;
    helpOptions.classList.remove('open');
    showWizardChoice();
  });

  document.getElementById('help-partner')?.addEventListener('click', () => {
    helpOpen = false;
    helpOptions.classList.remove('open');
    showPartnerModal();
  });

  // ===== WIZARD CHOICE MODAL (from help button) =====
  function showWizardChoice() {
    showModal((container) => {
      container.innerHTML = `
        <div style="text-align:center; padding: 20px 10px;">
          <h2 class="module-title" style="margin-bottom: 16px;">你现在感觉怎么样？</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
            ${[
              { mood: 'scattered', emoji: '😫', label: '脑子一团乱' },
              { mood: 'stuck', emoji: '🧱', label: '有事不想做' },
              { mood: 'tired', emoji: '😴', label: '累了/困了' },
              { mood: 'anxious', emoji: '🤯', label: '焦虑停不下来' }
            ].map(o => `
              <button class="onboarding-opt" data-wiz="${o.mood}">
                <span class="emoji">${o.emoji}</span>
                <span class="label">${o.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      container.querySelectorAll('.onboarding-opt').forEach(b => {
        b.addEventListener('click', () => {
          hideModal();
          triggerWizard(b.dataset.wiz);
        });
      });
    });
  }

  // ===== MODAL MANAGEMENT =====
  const modalContainer = document.getElementById('modal-container');
  const modalContent = document.getElementById('modal-content');
  const closeModal = document.getElementById('close-modal');

  window.showModal = function(contentFN) {
    modalContent.innerHTML = '';
    contentFN(modalContent);
    modalContainer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.hideModal = function() {
    modalContainer.style.display = 'none';
    document.body.style.overflow = 'auto';
  };

  if (closeModal) closeModal.addEventListener('click', hideModal);
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) hideModal();
  });

  // ===== MODULE ACTIONS =====
  const moduleActions = {
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

  Object.keys(moduleActions).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
        showModal(moduleActions[id]);
      });
      const btn = el.querySelector('button');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          showModal(moduleActions[id]);
        });
      }
    }
  });

  // ===== COIN EFFECT =====
  function triggerCoinEffect(amount = 50) {
    const overlay = document.getElementById('coin-overlay');
    for (let i = 0; i < 20; i++) {
      const coin = document.createElement('div');
      coin.innerHTML = ['⚡', '✨', '🎯'][Math.floor(Math.random() * 3)];
      coin.style.position = 'absolute';
      coin.style.left = (10 + Math.random() * 80) + 'vw';
      coin.style.top = '100vh';
      coin.style.fontSize = (18 + Math.random() * 16) + 'px';
      coin.style.transition = `all ${0.8 + Math.random() * 0.8}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      overlay.appendChild(coin);
      setTimeout(() => {
        coin.style.transform = `translateY(-120vh) rotate(${Math.random() * 720 - 360}deg)`;
        coin.style.opacity = '0';
      }, 50);
      setTimeout(() => coin.remove(), 2200);
    }
    focusCoins += amount;
    localStorage.setItem('neuro_coins', focusCoins);
    if (coinDisplay) coinDisplay.innerText = focusCoins.toLocaleString();
    if (coinBadge) {
      coinBadge.classList.remove('pop');
      void coinBadge.offsetWidth; // force reflow
      coinBadge.classList.add('pop');
    }
  }

  function showCelebration(text) {
    const el = document.createElement('div');
    el.className = 'celebration-text';
    el.innerText = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }

  // ===== BREATHING MODULE =====
  function initBreathingModule(container) {
    container.innerHTML = `
      <h2 class="module-title" style="text-align:center;">5分钟让大脑进入状态</h2>
      <div style="display:flex; justify-content:center; align-items:center; height: 180px;">
        <div id="breath-circle" style="width: 80px; height: 80px; border-radius: 50%; background: var(--gradient-main); box-shadow: 0 0 50px var(--primary-neon); transition: all 3s ease-in-out;"></div>
      </div>
      <div id="breath-instruction" style="text-align:center; font-size: 22px; font-weight:700; color: var(--primary-neon); height: 40px; margin-bottom:20px;">
        准备好重置你的神经系统了吗？
      </div>
      <button class="btn-primary" id="start-breath">开始 & 领取 50 专注币</button>
    `;
    const circle = document.getElementById('breath-circle');
    const instruction = document.getElementById('breath-instruction');
    const startBtn = document.getElementById('start-breath');
    startBtn.addEventListener('click', () => {
      startBtn.disabled = true;
      let cycle = 0, phase = 0;
      const phases = [
        { text: '深吸气...', scale: 1.5, duration: 2500 },
        { text: '叠吸一小口!', scale: 1.8, duration: 800 },
        { text: '缓慢呼气...', scale: 0.8, duration: 5000 }
      ];

      function runPhase() {
        if (cycle >= 3) {
          instruction.innerText = '✅ 神经重置完成！';
          circle.style.transform = 'scale(1)';
          triggerCoinEffect(50);
          showCelebration('🧠 完成！');
          if (window.NeuroTracker) window.NeuroTracker.recordFocus(5);
          startBtn.innerText = '再来一次';
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

  // ===== IDENTITY MODULE =====
  async function initIdentityModule(container) {
    container.innerHTML = `
      <h2 class="module-title">身份宣言引擎 (AI)</h2>
      <div id="id-editor">
        <p style="color:var(--text-muted); font-size:14px; margin-bottom:15px;">输入你现在的大脑状态：</p>
        <input type="text" id="id-input" placeholder="如：焦虑、拖延..." style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); padding:12px; border-radius:8px; color:#fff;">
        <button class="btn-primary" id="generate-id" style="margin-top:15px;">AI 重塑身份</button>
      </div>
      <div id="id-result-panel" style="display:none; margin-top:20px;">
        <div class="glass-panel" style="padding:40px; text-align:center; border:2px solid var(--primary-neon);">
          <p id="id-text" style="font-size: 22px; font-weight: 700; font-style: italic;">--</p>
        </div>
        <button class="btn-secondary" id="btn-regen-id" style="margin-top:15px;">换个说法</button>
      </div>
    `;
    const btn = document.getElementById('generate-id');
    const input = document.getElementById('id-input');
    const resPanel = document.getElementById('id-result-panel');
    const idText = document.getElementById('id-text');
    btn.addEventListener('click', async () => {
      const val = input.value.trim() || '正常';
      btn.innerText = '同步神经数据...';
      btn.disabled = true;
      const aiData = await callNeuroAI('identity', val);
      const content = aiData.content || aiData;
      const cleanResponse = `"${content.replace(/\"/g, '')}"`;
      idText.innerText = cleanResponse;
      if (aiData.stress_impact && window.NeuroTracker) {
        window.NeuroTracker.updateStress(aiData.stress_impact);
      }
      localStorage.setItem('neuro_identity', cleanResponse);
      const dashVal = document.querySelector('#identity-engine .card-value');
      if (dashVal) dashVal.innerText = cleanResponse;
      document.getElementById('id-editor').style.display = 'none';
      resPanel.style.display = 'block';
      showCelebration('✨ 身份已刷新');
      btn.disabled = false;
    });
    document.getElementById('btn-regen-id').addEventListener('click', () => {
      resPanel.style.display = 'none';
      document.getElementById('id-editor').style.display = 'block';
      btn.innerText = 'AI 重塑身份';
    });
  }

  // ===== TASK MODULE =====
  function initTaskModule(container) {
    container.innerHTML = `
      <h2 class="module-title">把大任务切成小步骤</h2>
      <textarea id="task-input" placeholder="输入你想做但不敢开始的任务...\\n比如：整理房间、写周报、准备PPT" style="width:100%; height:80px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); padding:12px; border-radius:8px; color:#fff; margin-top:15px; font-family:Inter; font-size:14px;"></textarea>
      <button class="btn-primary" id="deconstruct-btn" style="margin-top:15px;">🔪 开始拆解</button>
      <div id="task-res" style="display:none; margin-top:20px;">
        <div id="task-list" style="color:var(--text-muted); font-size:14px; white-space:pre-wrap; line-height:1.8; background:rgba(0,0,0,0.2); padding:16px; border-radius:12px;"></div>
      </div>
    `;
    const btn = document.getElementById('deconstruct-btn');
    btn.addEventListener('click', async () => {
      const task = document.getElementById('task-input').value;
      if (!task) return;
      btn.innerText = '拆解中...';
      btn.disabled = true;
      const aiData = await callNeuroAI('task', task);
      document.getElementById('task-list').innerText = aiData.content || aiData;
      document.getElementById('task-res').style.display = 'block';
      btn.style.display = 'none';
      triggerCoinEffect(30);
      showCelebration('🧩 拆好了！');
    });
  }

  // ===== RECALL MODULE =====
  function initRecallModule(container) {
    container.innerHTML = `
      <h2 class="module-title">主动提取测试</h2>
      <div id="recall-step-1">
        <textarea id="original-content" placeholder="输入你想记住的内容..." style="width:100%; height:100px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:#fff; padding:12px; font-family:Inter;"></textarea>
        <button class="btn-primary" id="btn-lock" style="margin-top:15px;">锁定并记忆</button>
      </div>
      <div id="recall-step-2" style="display:none;">
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:8px;">凭记忆复述刚才的内容：</p>
        <textarea id="recall-input" placeholder="写你记住的..." style="width:100%; height:100px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:#fff; padding:12px; font-family:Inter;"></textarea>
        <button class="btn-primary" id="btn-eval" style="margin-top:15px;">提交比对</button>
      </div>
      <div id="recall-result" style="display:none; text-align:center; margin-top:20px;">
        <div id="neuro-score" style="font-size:48px; color:var(--primary-neon); font-weight:800;">--</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">记忆提取率</p>
        <p id="ai-eval" style="font-size:14px; color:var(--text-muted);"></p>
      </div>
    `;
    const s1 = document.getElementById('recall-step-1');
    const s2 = document.getElementById('recall-step-2');
    const res = document.getElementById('recall-result');
    document.getElementById('btn-lock').addEventListener('click', () => {
      if (document.getElementById('original-content').value) {
        s1.style.display = 'none';
        s2.style.display = 'block';
      }
    });
    document.getElementById('btn-eval').addEventListener('click', async () => {
      const original = document.getElementById('original-content').value;
      const recall = document.getElementById('recall-input').value;
      const btn = document.getElementById('btn-eval');
      btn.innerText = '比对中...';
      btn.disabled = true;
      const aiData = await callNeuroAI('recall_eval', '', { original, recall });
      const score = aiData.score || 0;
      document.getElementById('neuro-score').innerText = score + '%';
      document.getElementById('ai-eval').innerText = aiData.feedback || (typeof aiData === 'string' ? aiData : '分析完毕');
      s2.style.display = 'none';
      res.style.display = 'block';
      if (parseInt(score) > 60) {
        triggerCoinEffect(40);
        showCelebration('🧠 好记性！');
        if (window.NeuroTracker) window.NeuroTracker.recordFocus(5);
      }
    });
  }

  // ===== REWARD MODULE =====
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

  // ===== DETOX MODULE =====
  function initDetoxModule(container) {
    container.innerHTML = `
      <h2 class="module-title">24小时给大脑"大扫除"</h2>
      <div id="detox-step-1">
        <p style="color:var(--text-muted); font-size:13px; margin-bottom:10px;">你平时有哪些想戒掉的习惯？</p>
        <textarea id="detox-input" placeholder="如：刷短视频到1点、每天喝3杯咖啡、每隔10分钟看手机..." style="width:100%; height:80px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:#fff; padding:12px; font-family:Inter;"></textarea>
        <button class="btn-primary" id="btn-detox" style="margin-top:15px;">AI 生成计划</button>
      </div>
      <div id="detox-res" style="display:none; margin-top:20px; max-height:220px; overflow-y:auto; font-size:14px; line-height:1.8; background:rgba(0,0,0,0.2); padding:16px; border-radius:12px;"></div>
    `;
    const btn = document.getElementById('btn-detox');
    btn.addEventListener('click', async () => {
      const habits = document.getElementById('detox-input').value;
      if (!habits) return;
      btn.innerText = '分析中...';
      btn.disabled = true;
      const aiData = await callNeuroAI('detox', habits);
      document.getElementById('detox-res').innerText = aiData.content || aiData;
      document.getElementById('detox-res').style.display = 'block';
      if (window.NeuroTracker) window.NeuroTracker.updateStress(-5);
      btn.innerText = '重新生成';
      btn.disabled = false;
      showCelebration('🚀 计划就绪！');
    });
  }

  // ===== PUSH MODULE =====
  function initPushModule(container) {
    container.innerHTML = `
      <h2 class="module-title">到点提醒你"你是谁"</h2>
      <div class="glass-panel" style="background:rgba(255,255,255,0.05); padding:20px; border-radius:12px; margin-top:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div>
            <p style="font-weight:700;">浏览器通知</p>
            <p style="font-size:12px; color:var(--text-muted);">离开页面时，强提醒你的身份宣言</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="push-cb" ${localStorage.getItem('neuro_push') === 'true' ? 'checked' : ''}>
          </label>
        </div>
        <button class="btn-secondary" id="btn-test-push" style="border-style:dashed; font-size:12px; padding:8px 16px;">发送一次测试</button>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
        ⏰ 推荐时段：10:30 (晨间) · 15:00 (午后能量低谷)
      </p>
      <button class="btn-primary" id="btn-save-push" style="margin-top:20px;">保存设置</button>
    `;

    const cb = document.getElementById('push-cb');

    document.getElementById('btn-test-push').addEventListener('click', () => {
      sendNeuralPush('🧠 测试同步：我是节奏的掌握者！', true);
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
      if (enabled) sendNeuralPush('🧠 神经基准线已建立，同步已激活。');
      hideModal();
    });
  }

  // ===== PUSH HELPERS =====
  function updatePushStatus(enabled) {
    const dot = document.getElementById('push-status-dot');
    const txt = document.getElementById('push-status-text');
    if (dot) {
      dot.style.background = enabled ? 'var(--primary-neon)' : '#888';
      dot.style.boxShadow = enabled ? '0 0 10px var(--primary-neon)' : 'none';
    }
    if (txt) {
      txt.innerText = enabled ? '已激活 (同步中)' : '未激活';
      txt.style.color = enabled ? 'var(--primary-neon)' : 'var(--text-muted)';
    }
  }

  function sendNeuralPush(msg, forceSystem = false) {
    const identity = localStorage.getItem('neuro_identity') || '记住你的身份。';
    const finalMsg = msg.includes('测试') ? msg : identity;
    if ((Notification.permission === 'granted' && localStorage.getItem('neuro_push') === 'true') || forceSystem) {
      try {
        new Notification('🧠 NEUROFLOW', { body: finalMsg.replace(/\"/g, '') });
      } catch (e) { /* noop */ }
    }
    const toast = document.createElement('div');
    toast.className = 'glass-panel';
    toast.style.cssText = `position:fixed; top:20px; right:20px; z-index:3000; border-color:var(--primary-neon); padding:15px; animation:slideIn 0.5s ease-out; background:rgba(10,12,16,0.95); max-width:280px; box-shadow:0 0 30px rgba(0,255,194,0.2);`;
    toast.innerHTML = `<div style="color:var(--primary-neon); font-size:10px; font-family:Orbitron;">🧠 NEURAL PUSH</div><div style="font-size:14px; margin-top:5px;">${finalMsg}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  updatePushStatus(localStorage.getItem('neuro_push') === 'true');

  // ===== PERSISTED IDENTITY =====
  const savedIdentity = localStorage.getItem('neuro_identity');
  if (savedIdentity) {
    const dashVal = document.querySelector('#identity-engine .card-value');
    if (dashVal) dashVal.innerText = savedIdentity;
  }

  // ===== CHART =====
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
        }, {
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

  // ===== CHART INFO BUTTON =====
  const infoBtn = document.getElementById('chart-info-btn');
  if (infoBtn) {
    infoBtn.onclick = (e) => {
      e.stopPropagation();
      showModal((container) => {
        container.innerHTML = `
          <div class="how-to-guide">
            <h2>📈 神经优化手册</h2>
            <h4>1. 如何解读图表？</h4>
            <p>双轴趋势图，记录你的执行功能状态：</p>
            <ul>
              <li>🟢 <strong>深度专注时长</strong>: 每天高效状态的累计分钟数。线条稳定在高位 = 理想。</li>
              <li>🔴 <strong>皮质醇水平</strong>: 神经系统的焦虑与负荷。与专注曲线形成"反向关系"为佳。</li>
            </ul>
            <h4>2. 数据怎么来的？</h4>
            <ul>
              <li>⚡ 25分钟计时器每完成一个周期，自动记录 25min</li>
              <li>🤖 AI 情感分析：刷新身份宣言时，AI 分析语义情绪换算焦虑度</li>
              <li>💾 数据存在浏览器本地，每周自动开启新周期</li>
            </ul>
            <h4>3. 优化策略</h4>
            <ul>
              <li><span class="tip-badge">巅峰</span> 绿色冲顶 + 红色探底 = 最佳学习/创作时机</li>
              <li><span class="tip-badge">警报</span> 红色高于绿色 = 皮质醇过载。去 NSDR 休息或做 Dopamine Detox</li>
            </ul>
          </div>
        `;
      });
    };
  }

  // ===== AI CALL =====
  async function callNeuroAI(type, content, extra = {}) {
    console.log(`请求 AI: ${type}...`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch('/api/neuro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, ...extra }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.error) {
        const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
        return `神经中枢异常：${errorMsg}`;
      }
      if (data.choices && data.choices[0]) return data.choices[0].message.content;
      if (data.content) return data;
      return 'AI 暂时没有给出有效指令，请重试。';
    } catch (e) {
      if (e.name === 'AbortError') return '神经中枢响应超时，请检查网络或重试。';
      return '连接神经中枢失败，请检查服务器 PHP 环境。';
    }
  }

  // ===== PARTNER =====
  const showPartnerModal = () => {
    showModal((container) => {
      container.innerHTML = `
        <div style="text-align:center; padding: 20px;">
          <h2 class="module-title" style="color:var(--primary-neon);">2026 脑科学商业合伙人</h2>
          <p style="color:var(--text-muted); margin-bottom:20px; font-size:14px; line-height:1.6;">
            如果您拥有资源、流量或对脑科学商业化有极高热情，欢迎申请成为我们的核心合伙人。<br>
            由"首席渐构师"亲自 1:1 战略辅导，对接千万级流量变现体系。
          </p>
          <div style="position:relative; width:220px; height:220px; margin:0 auto; padding:10px; background:#fff; border-radius:16px; box-shadow: 0 0 40px rgba(0,255,194,0.2);">
            <img src="lwdz2026.jpg" style="width:200px; height:200px; border-radius:8px; display:block;">
          </div>
          <p style="margin-top:20px; font-size:12px; color:var(--primary-neon); font-family:Orbitron;">SCAN TO APPLY VIA WECHAT</p>
          <p style="font-size:12px; color:var(--text-muted); margin-top:10px;">添加时请备注：合伙人申请</p>
          <button class="btn-primary" style="margin-top:25px;" onclick="hideModal()">了解更多</button>
        </div>
      `;
    });
  };

  document.getElementById('partner-link')?.addEventListener('click', (e) => { e.preventDefault(); showPartnerModal(); });
  document.getElementById('partner-compact')?.addEventListener('click', showPartnerModal);

  // ===== PUSH LOOP =====
  setInterval(() => {
    if (localStorage.getItem('neuro_push') === 'true') {
      sendNeuralPush('神经同步提醒');
    }
  }, 600000);

  // ===== STREAK (persisted) =====
  const streakEl = document.getElementById('streak-count');
  let streak = parseInt(localStorage.getItem('neuro_streak')) || 5;
  if (streakEl) streakEl.innerText = streak;

  // Track daily visit for streak
  const lastVisit = localStorage.getItem('neuro_last_visit');
  const today = new Date().toDateString();
  if (lastVisit !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastVisit === yesterday) {
      streak++;
    } else if (lastVisit) {
      streak = 1;
    } else {
      streak = 1;
    }
    localStorage.setItem('neuro_streak', streak);
    localStorage.setItem('neuro_last_visit', today);
    if (streakEl) streakEl.innerText = streak;
  }
});
