// ========== 主题配置 ==========
const themes = {
  ninja: {
    emoji: '🥷',
    titleSuffix: '修炼游戏本',
    speech: '修炼开始，冲啊！',
    image: 'assets/ninja.png',
    nodes: [
      { label: '出发准备', desc: '整理文具', bonus: '+1', icon: '🎒' },
      { label: '制作清单', desc: '分类作业', bonus: '', icon: '📝' },
      { label: '简单热身', desc: '轻松热手', bonus: '+1', icon: '🔥' },
      { label: '挑战困难', desc: '先啃硬骨头', bonus: '+3', icon: '⚔️' },
      { label: '简单清零', desc: '解锁奖励', bonus: '+1', icon: '💰' },
      { label: '二连击破', desc: '搞定两项', bonus: '+2', icon: '💥' },
      { label: '专注挑战', desc: '15分钟不中断', bonus: '+2', icon: '🎯' },
      { label: '攻坚挑战', desc: '30分钟冲刺', bonus: '+3', icon: '🏔️' },
      { label: '突破', desc: '最难已击破', bonus: '+2', icon: '🚀' },
      { label: '困难清零', desc: '解锁大奖', bonus: '+3', icon: '🏆' },
      { label: '最后冲刺', desc: '一气呵成', bonus: '+1', icon: '⚡' },
      { label: '今日清空', desc: '超级奖励', bonus: '+5', icon: '🌟' }
    ]
  },
  space: {
    emoji: '🚀',
    titleSuffix: '星际探索本',
    speech: '飞船启动，目标星辰大海！',
    image: 'assets/space.png',
    nodes: [
      { label: '发射准备', desc: '检查装备', bonus: '+1', icon: '🛸' },
      { label: '导航设定', desc: '规划路线', bonus: '', icon: '🗺️' },
      { label: '低空巡航', desc: '简单热身', bonus: '+1', icon: '🌍' },
      { label: '穿越小行星', desc: '困难任务', bonus: '+3', icon: '☄️' },
      { label: '能量补给', desc: '简单任务', bonus: '+1', icon: '⚡' },
      { label: '双星连跳', desc: '两项搞定', bonus: '+2', icon: '⭐' },
      { label: '深空探测', desc: '专注15分', bonus: '+2', icon: '🔭' },
      { label: '黑洞挑战', desc: '30分钟冲刺', bonus: '+3', icon: '🕳️' },
      { label: '跃迁加速', desc: '突破自我', bonus: '+2', icon: '💫' },
      { label: '星系清理', desc: '困难清零', bonus: '+3', icon: '🌌' },
      { label: '终点冲刺', desc: '最后一段', bonus: '+1', icon: '🏁' },
      { label: '登陆星球', desc: '超级奖励', bonus: '+5', icon: '🪐' }
    ]
  },
  magic: {
    emoji: '🧙',
    titleSuffix: '魔法城堡本',
    speech: '咒语念起，魔法开启！',
    image: 'assets/magic.png',
    nodes: [
      { label: '魔法阵激活', desc: '准备文具', bonus: '+1', icon: '✨' },
      { label: '咒语书写', desc: '列清单', bonus: '', icon: '📜' },
      { label: '小火球术', desc: '简单热身', bonus: '+1', icon: '🔥' },
      { label: '巨龙挑战', desc: '困难任务', bonus: '+3', icon: '🐉' },
      { label: '治愈之光', desc: '简单任务', bonus: '+1', icon: '💚' },
      { label: '双重魔法', desc: '连击两项', bonus: '+2', icon: '💎' },
      { label: '冥想专注', desc: '15分钟', bonus: '+2', icon: '🧘' },
      { label: '史诗副本', desc: '30分钟', bonus: '+3', icon: '🏰' },
      { label: '魔力觉醒', desc: '突破极限', bonus: '+2', icon: '⚡' },
      { label: '清场魔法', desc: '困难清零', bonus: '+3', icon: '🌪️' },
      { label: '最终咒语', desc: '最后冲刺', bonus: '+1', icon: '🔮' },
      { label: '宝藏开启', desc: '超级奖励', bonus: '+5', icon: '👑' }
    ]
  },
  pirate: {
    emoji: '🏴‍☠️',
    titleSuffix: '海盗寻宝本',
    speech: '扬帆起航，寻找宝藏！',
    image: 'assets/ninja.png',
    nodes: [
      { label: '登船准备', desc: '整理装备', bonus: '+1', icon: '⚓' },
      { label: '绘制海图', desc: '列出任务', bonus: '', icon: '🗺️' },
      { label: '顺风启航', desc: '简单热身', bonus: '+1', icon: '⛵' },
      { label: '海怪挑战', desc: '困难任务', bonus: '+3', icon: '🐙' },
      { label: '淡水补给', desc: '简单任务', bonus: '+1', icon: '💧' },
      { label: '双桅连击', desc: '两项搞定', bonus: '+2', icon: '🎯' },
      { label: '暴风雨专注', desc: '15分钟', bonus: '+2', icon: '🌊' },
      { label: '沉船探险', desc: '30分钟', bonus: '+3', icon: '🚢' },
      { label: '乘风破浪', desc: '突破自我', bonus: '+2', icon: '💨' },
      { label: '岛屿清理', desc: '困难清零', bonus: '+3', icon: '🏝️' },
      { label: '最终航程', desc: '最后冲刺', bonus: '+1', icon: '🧭' },
      { label: '宝藏开启', desc: '超级奖励', bonus: '+5', icon: '💰' }
    ]
  },
  animal: {
    emoji: '🦊',
    titleSuffix: '动物王国本',
    speech: '森林冒险，出发啦！',
    image: 'assets/ninja.png',
    nodes: [
      { label: '晨间集合', desc: '整理文具', bonus: '+1', icon: '🌅' },
      { label: '路线规划', desc: '列出任务', bonus: '', icon: '🗺️' },
      { label: '慢跑热身', desc: '简单任务', bonus: '+1', icon: '🐾' },
      { label: '穿越丛林', desc: '困难任务', bonus: '+3', icon: '🌴' },
      { label: '溪边饮水', desc: '简单任务', bonus: '+1', icon: '💧' },
      { label: '双兽同行', desc: '两项搞定', bonus: '+2', icon: '🐻' },
      { label: '高空飞翔', desc: '专注15分', bonus: '+2', icon: '🦅' },
      { label: '山顶挑战', desc: '30分钟', bonus: '+3', icon: '⛰️' },
      { label: '飞跃峡谷', desc: '突破自我', bonus: '+2', icon: '🦜' },
      { label: '领地清理', desc: '困难清零', bonus: '+3', icon: '🐺' },
      { label: '归巢之路', desc: '最后冲刺', bonus: '+1', icon: '🏠' },
      { label: '荣耀加冕', desc: '超级奖励', bonus: '+5', icon: '👑' }
    ]
  },
  dino: {
    emoji: '🦕',
    titleSuffix: '恐龙世界本',
    speech: '穿越侏罗纪，冒险开始！',
    image: 'assets/ninja.png',
    nodes: [
      { label: '蛋中孵化', desc: '准备文具', bonus: '+1', icon: '🥚' },
      { label: '足迹追踪', desc: '列出任务', bonus: '', icon: '👣' },
      { label: '草丛穿梭', desc: '简单热身', bonus: '+1', icon: '🌿' },
      { label: '霸王龙挑战', desc: '困难任务', bonus: '+3', icon: '🦖' },
      { label: '河流饮水', desc: '简单任务', bonus: '+1', icon: '🌊' },
      { label: '双翼连飞', desc: '两项搞定', bonus: '+2', icon: '🦎' },
      { label: '火山专注', desc: '15分钟', bonus: '+2', icon: '🌋' },
      { label: '深海探秘', desc: '30分钟', bonus: '+3', icon: '🐋' },
      { label: '闪电奔跑', desc: '突破自我', bonus: '+2', icon: '⚡' },
      { label: '领地清扫', desc: '困难清零', bonus: '+3', icon: '🦕' },
      { label: '陨石冲刺', desc: '最后冲刺', bonus: '+1', icon: '☄️' },
      { label: '远古宝藏', desc: '超级奖励', bonus: '+5', icon: '💎' }
    ]
  }
};

// ========== 当前状态 ==========
let currentTheme = 'ninja';

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  renderNodes();
  renderPointsGrid();
  renderTomatoProgress();
  renderWeeklyChallenge();
  renderAchievementTree();
  updateBoard();
  bindEvents();
});

// ========== 渲染地图节点 ==========
function renderNodes() {
  const container = document.getElementById('nodes-container');
  const themeInfo = themes[currentTheme];
  container.innerHTML = '';

  themeInfo.nodes.forEach((node, i) => {
    const div = document.createElement('div');
    div.className = 'node';
    div.innerHTML = `
      <div class="node-circle">
        <span>${node.icon}</span>
        ${node.bonus ? `<span class="node-bonus">${node.bonus}</span>` : ''}
      </div>
      <div class="node-label">${node.label}</div>
      <div class="node-desc">${node.desc}</div>
    `;
    container.appendChild(div);
  });

  // 延迟绘制连接线
  setTimeout(drawSvgPath, 100);
}

// ========== 绘制SVG连接线 ==========
function drawSvgPath() {
  const container = document.getElementById('board-map');
  const pathEl = document.getElementById('map-path-line');
  if (!container || !pathEl) return;

  const nodes = document.querySelectorAll('.node');
  if (nodes.length < 2) return;

  const containerRect = container.getBoundingClientRect();
  let pathD = '';

  nodes.forEach((node, index) => {
    const circle = node.querySelector('.node-circle');
    const circleRect = circle.getBoundingClientRect();
    const x = (circleRect.left + circleRect.width / 2) - containerRect.left;
    const y = (circleRect.top + circleRect.height / 2) - containerRect.top;

    if (index === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      const prevCircle = nodes[index - 1].querySelector('.node-circle');
      const prevCircleRect = prevCircle.getBoundingClientRect();
      const prevX = (prevCircleRect.left + prevCircleRect.width / 2) - containerRect.left;
      const prevY = (prevCircleRect.top + prevCircleRect.height / 2) - containerRect.top;

      const cpX1 = prevX + (x - prevX) / 2;
      const cpY1 = prevY;
      const cpX2 = prevX + (x - prevX) / 2;
      const cpY2 = y;

      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
    }
  });

  pathEl.setAttribute('d', pathD);
}

// ========== 渲染积分盖章区 ==========
function renderPointsGrid() {
  const grid = document.getElementById('points-grid-draw');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const box = document.createElement('div');
    box.className = 'points-box';
    grid.appendChild(box);
  }
}

// ========== 渲染番茄钟进度 ==========
function renderTomatoProgress() {
  const progress = document.getElementById('tomato-progress');
  if (!progress) return;
  progress.innerHTML = '';
  const target = parseInt(document.getElementById('tomato-target')?.value) || 4;
  for (let i = 0; i < target; i++) {
    const cell = document.createElement('div');
    cell.className = 'tomato-cell';
    cell.textContent = '🍅';
    cell.onclick = () => {
      cell.classList.toggle('filled');
      updateTomatoCount();
    };
    progress.appendChild(cell);
  }
  updateTomatoCount();
}

function updateTomatoCount() {
  const cells = document.querySelectorAll('.tomato-cell');
  const filled = document.querySelectorAll('.tomato-cell.filled').length;
  const currentEl = document.getElementById('tomato-current');
  if (currentEl) currentEl.textContent = filled;
}

// ========== 渲染周挑战 ==========
function renderWeeklyChallenge() {
  const grid = document.getElementById('week-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const labels = ['一', '二', '三', '四', '五', '六', '日'];

  days.forEach((day, i) => {
    const input = document.getElementById(`week-${day}`);
    const value = input ? input.value.trim() : '';
    const div = document.createElement('div');
    div.className = 'week-day';
    div.innerHTML = `
      <span class="day-label">周${labels[i]}</span>
      <span class="day-text">${value || '...'}</span>
      <span class="day-check">☐</span>
    `;
    grid.appendChild(div);
  });
}

// ========== 渲染成就树 ==========
function renderAchievementTree() {
  const grid = document.getElementById('tree-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const icons = ['🌱', '🌿', '🌳', '🍃', '🌺'];
  for (let i = 1; i <= 5; i++) {
    const input = document.getElementById(`achieve-${i}`);
    const value = input ? input.value.trim() : '';
    const div = document.createElement('div');
    div.className = 'tree-node';
    div.innerHTML = `
      <span class="tree-icon">${icons[i - 1]}</span>
      <span>${value || `成就${i}`}</span>
    `;
    grid.appendChild(div);
  }
}

// ========== 事件绑定 ==========
function bindEvents() {
  // 主题切换
  document.querySelectorAll('.theme-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.theme-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      currentTheme = opt.dataset.theme;
      document.body.className = `theme-${currentTheme}`;
      renderNodes();
      updateBoard();
    });
  });

  // 所有输入监听
  const allInputs = document.querySelectorAll('.input-field');
  allInputs.forEach(el => {
    el.addEventListener('input', () => {
      updateBoard();
      // 特殊处理
      if (el.id === 'tomato-target') renderTomatoProgress();
      if (el.id.startsWith('week-')) renderWeeklyChallenge();
      if (el.id.startsWith('achieve-')) renderAchievementTree();
    });
  });
}

// ========== 同步控制面板到打印预览区 ==========
function updateBoard() {
  // 1. 基础信息
  const name = document.getElementById('child-name').value.trim() || '宝贝';
  const parentName = document.getElementById('parent-name').value.trim();
  const themeInfo = themes[currentTheme];

  document.getElementById('meta-child-name').innerText = name;
  document.getElementById('mascot-img').src = themeInfo.image;
  document.getElementById('mascot-speech-text').innerText = themeInfo.speech;
  document.getElementById('board-title-text').innerText = `${themeInfo.emoji} ${name}${themeInfo.titleSuffix}`;

  // 2. 任务列表
  ['easy', 'med', 'hard'].forEach(level => {
    const container = document.getElementById(`tasks-${level}-list`);
    if (!container) return;
    let html = '';
    const prefix = level === 'easy' ? 'task-easy' : level === 'med' ? 'task-med' : 'task-hard';
    const max = level === 'easy' ? 4 : level === 'med' ? 3 : 2;
    for (let i = 1; i <= max; i++) {
      const input = document.getElementById(`${prefix}-${i}`);
      const val = input ? input.value.trim() : '';
      if (val) {
        html += `<div class="task-item">${val}</div>`;
      }
    }
    container.innerHTML = html || '<div class="task-item" style="color:var(--text-light)">暂无今日任务</div>';
  });

  // 3. 积分兑换卡
  [50, 100, 200, 500, 1000].forEach(pt => {
    const input = document.getElementById(`reward-${pt}`);
    const display = document.getElementById(`reward-${pt}-text`);
    if (input && display) {
      display.innerText = input.value.trim() || '未设定';
    }
  });

  // 4. 日期
  const dateLine = document.querySelector('.date-line');
  if (dateLine) {
    const today = new Date();
    dateLine.innerText = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
  }

  // 5. 家长寄语
  const msgEl = document.getElementById('parent-msg');
  const msgDisplay = document.getElementById('parent-msg-display');
  if (msgEl && msgDisplay) {
    msgDisplay.innerText = msgEl.value.trim() || '加油！';
  }

  // 6. 家长签名
  const sigEl = document.getElementById('parent-signature');
  if (sigEl) {
    sigEl.innerText = parentName ? `—— ${parentName}` : '';
  }

  // 7. 重新绘制连接线
  setTimeout(drawSvgPath, 50);
}
