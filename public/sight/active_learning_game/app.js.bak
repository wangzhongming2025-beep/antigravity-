// ========== 9款超可爱的手绘风动物头像 SVG 模版 (供盖章涂色) ==========
const ANIMAL_SVGS = {
  cat: `<svg viewBox="0 0 100 100" class="node-svg-icon" style="width:38px; height:38px; fill:none; stroke:currentColor; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round;">
    <path d="M 25,68 A 28,28 0 1,0 75,68" />
    <path d="M 24,42 L 10,18 L 39,26" />
    <path d="M 76,42 L 90,18 L 61,26" />
    <circle cx="38" cy="48" r="3.5" fill="currentColor" />
    <circle cx="62" cy="48" r="3.5" fill="currentColor" />
    <path d="M 50,54 L 46,59 L 54,59 Z" fill="currentColor" />
    <path d="M 43,65 C 47,68 50,68 50,65 C 50,68 53,68 57,65" />
  </svg>`,
  bear: `<svg viewBox="0 0 100 100" class="node-svg-icon" style="width:38px; height:38px; fill:none; stroke:currentColor; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round;">
    <path d="M 25,65 A 28,28 0 1,0 75,65" />
    <circle cx="26" cy="30" r="10" />
    <circle cx="74" cy="30" r="10" />
    <circle cx="38" cy="48" r="3.5" fill="currentColor" />
    <circle cx="62" cy="48" r="3.5" fill="currentColor" />
    <ellipse cx="50" cy="62" rx="10" ry="7" />
    <path d="M 47,60 L 50,63 L 53,60" />
  </svg>`,
  bunny: `<svg viewBox="0 0 100 100" class="node-svg-icon" style="width:38px; height:38px; fill:none; stroke:currentColor; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round;">
    <path d="M 26,72 A 26,26 0 1,0 74,72" />
    <path d="M 32,44 C 22,12 42,6 44,38" />
    <path d="M 68,44 C 78,12 58,6 56,38" />
    <circle cx="38" cy="52" r="3.5" fill="currentColor" />
    <circle cx="62" cy="52" r="3.5" fill="currentColor" />
    <polygon points="50,59 46,63 54,63" fill="currentColor" />
    <path d="M 44,70 C 47,72 50,72 50,70 C 50,72 53,72 56,70" />
  </svg>`,
  panda: `<svg viewBox="0 0 100 100" class="node-svg-icon" style="width:38px; height:38px; fill:none; stroke:currentColor; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round;">
    <path d="M 25,65 A 28,28 0 1,0 75,65" />
    <circle cx="25" cy="28" r="9" fill="currentColor" />
    <circle cx="75" cy="28" r="9" fill="currentColor" />
    <ellipse cx="36" cy="48" rx="8" ry="10" fill="currentColor" />
    <ellipse cx="64" cy="48" rx="8" ry="10" fill="currentColor" />
    <circle cx="36" cy="48" r="3" fill="white" />
    <circle cx="64" cy="48" r="3" fill="white" />
    <ellipse cx="50" cy="62" rx="7" ry="4.5" fill="currentColor" />
  </svg>`,
  pig: `<svg viewBox="0 0 100 100" class="node-svg-icon" style="width:38px; height:38px; fill:none; stroke:currentColor; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round;">
    <circle cx="50" cy="50" r="30" />
    <path d="M 22,32 L 14,20 L 32,24" />
    <path d="M 78,32 L 86,20 L 68,24" />
    <circle cx="38" cy="42" r="3.5" fill="currentColor" />
    <circle cx="62" cy="42" r="3.5" fill="currentColor" />
    <ellipse cx="50" cy="58" rx="11" ry="8" />
    <circle cx="45" cy="58" r="2.5" fill="currentColor" />
    <circle cx="55" cy="58" r="2.5" fill="currentColor" />
  </svg>`,
  frog: `<svg viewBox="0 0 100 100" class="node-svg-icon" style="width:38px; height:38px; fill:none; stroke:currentColor; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round;">
    <path d="M 20,60 A 30,22 0 0,0 80,60" />
    <circle cx="30" cy="38" r="11" />
    <circle cx="70" cy="38" r="11" />
    <circle cx="30" cy="38" r="4.5" fill="currentColor" />
    <circle cx="70" cy="38" r="4.5" fill="currentColor" />
    <path d="M 32,60 Q 50,75 68,60" />
    <circle cx="22" cy="54" r="3" fill="currentColor" style="opacity:0.3;" />
    <circle cx="78" cy="54" r="3" fill="currentColor" style="opacity:0.3;" />
  </svg>`,
  fox: `<svg viewBox="0 0 100 100" class="node-svg-icon" style="width:38px; height:38px; fill:none; stroke:currentColor; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round;">
    <polygon points="50,82 15,42 85,42" />
    <polygon points="15,42 10,16 38,30" />
    <polygon points="85,42 90,16 62,30" />
    <circle cx="34" cy="48" r="3.5" fill="currentColor" />
    <circle cx="66" cy="48" r="3.5" fill="currentColor" />
    <circle cx="50" cy="80" r="4.5" fill="currentColor" />
  </svg>`,
  tiger: `<svg viewBox="0 0 100 100" class="node-svg-icon" style="width:38px; height:38px; fill:none; stroke:currentColor; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round;">
    <circle cx="50" cy="52" r="28" />
    <path d="M 24,34 Q 15,22 28,24" />
    <path d="M 76,34 Q 85,22 72,24" />
    <!-- Stripes -->
    <path d="M 50,24 L 50,34 M 46,26 L 46,31 M 54,26 L 54,31" />
    <path d="M 22,52 L 30,52 M 78,52 L 70,52" />
    <circle cx="38" cy="48" r="3.5" fill="currentColor" />
    <circle cx="62" cy="48" r="3.5" fill="currentColor" />
    <polygon points="50,59 47,63 53,63" fill="currentColor" />
    <path d="M 44,70 Q 50,75 56,70" />
  </svg>`,
  koala: `<svg viewBox="0 0 100 100" class="node-svg-icon" style="width:38px; height:38px; fill:none; stroke:currentColor; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round;">
    <path d="M 26,66 A 26,26 0 1,0 74,66" />
    <circle cx="22" cy="35" r="12" />
    <circle cx="78" cy="35" r="12" />
    <circle cx="38" cy="48" r="3.5" fill="currentColor" />
    <circle cx="62" cy="48" r="3.5" fill="currentColor" />
    <ellipse cx="50" cy="58" rx="7" ry="11" fill="currentColor" />
  </svg>`
};

// ========== 全局配置与状态 ==========
const themes = {
  ninja: {
    emoji: "🥷",
    image: "assets/ninja.png",
    speech: "修炼开始，冲啊！",
    titleSuffix: "的主动学习大冒险",
    nodes: [
      { name: "出发准备", desc: "将作业和文具整齐摆放在桌上", icon: ANIMAL_SVGS.cat },
      { name: "制作任务清单", desc: "将作业分类，填写在清单中", icon: ANIMAL_SVGS.bear },
      { name: "挑战困难任务", desc: "拿出最难的一项作业先攻克", icon: ANIMAL_SVGS.bunny, bonus: "+1pt" },
      { name: "简单任务清零", desc: "解锁小奖励！学习积分+1", icon: ANIMAL_SVGS.panda },
      { name: "二连击破", desc: "搞定两项简单任务啦！", icon: ANIMAL_SVGS.pig },
      { name: "攻坚突破", desc: "你太强了！最难任务已被击破", icon: ANIMAL_SVGS.frog },
      { name: "困难任务清零", desc: "解锁大奖励！学习积分+2", icon: ANIMAL_SVGS.fox, bonus: "+2pt" },
      { name: "最后冲刺", desc: "只剩中等难度，一鼓作气冲刺", icon: ANIMAL_SVGS.tiger },
      { name: "通关胜利", desc: "收拾好桌面，通关大奖我来啦", icon: ANIMAL_SVGS.koala }
    ]
  },
  space: {
    emoji: "🚀",
    image: "assets/space.png",
    speech: "起航！探索星辰大海！",
    titleSuffix: "的星际自驱航行",
    nodes: [
      { name: "飞船整备", desc: "桌面及文具整理就绪", icon: ANIMAL_SVGS.cat },
      { name: "星图规划", desc: "梳理今日学习任务", icon: ANIMAL_SVGS.bear },
      { name: "突破引力", desc: "首战攻克最难任务", icon: ANIMAL_SVGS.bunny, bonus: "+1pt" },
      { name: "流星加速", desc: "快速消灭两项简单任务", icon: ANIMAL_SVGS.panda },
      { name: "护盾充能", desc: "保持专注，屏蔽噪音", icon: ANIMAL_SVGS.pig },
      { name: "跃迁航行", desc: "搞定中等难度任务", icon: ANIMAL_SVGS.frog },
      { name: "空间补给", desc: "深呼吸，喝水充电", icon: ANIMAL_SVGS.fox },
      { name: "征服黑洞", desc: "终极困难任务全部搞定", icon: ANIMAL_SVGS.tiger, bonus: "+2pt" },
      { name: "降落母星", desc: "检查收拾，胜利返航", icon: ANIMAL_SVGS.koala }
    ]
  },
  magic: {
    emoji: "🏰",
    image: "assets/magic.png",
    speech: "法咒咏唱，拖延退散！",
    titleSuffix: "的魔法自驱修炼",
    nodes: [
      { name: "魔法准备", desc: "文具就位，心境沉静", icon: ANIMAL_SVGS.cat },
      { name: "法术清单", desc: "列出魔法学习步骤", icon: ANIMAL_SVGS.bear },
      { name: "挑战魔王", desc: "首先击破高难度魔法", icon: ANIMAL_SVGS.bunny, bonus: "+1pt" },
      { name: "小试身手", desc: "快速搞定两个简单魔法", icon: ANIMAL_SVGS.panda },
      { name: "冥想专注", desc: "进入静音魔法力场", icon: ANIMAL_SVGS.pig },
      { name: "高级魔法", desc: "击破中等难度挑战", icon: ANIMAL_SVGS.frog },
      { name: "魔力泉补给", desc: "伸展身体，饮水休整", icon: ANIMAL_SVGS.fox },
      { name: "终极禁咒", desc: "困难任务已彻底解开", icon: ANIMAL_SVGS.tiger, bonus: "+2pt" },
      { name: "点亮法阵", desc: "完美收拾，魔法满盈", icon: ANIMAL_SVGS.koala }
    ]
  }
};

let currentTheme = 'ninja';

// ========== S形曲线节点坐标定义 (百分比) ==========
const nodePositions = [
  { left: 10, top: 15 },
  { left: 48, top: 10 },
  { left: 82, top: 18 },
  { left: 82, top: 50 },
  { left: 48, top: 44 },
  { left: 12, top: 48 },
  { left: 12, top: 80 },
  { left: 48, top: 84 },
  { left: 82, top: 78 }
];

// ========== 初始化及事件绑定 ==========
document.addEventListener("DOMContentLoaded", () => {
  renderNodes();
  bindEvents();
  updateBoard();
  
  // 监听窗口大小变化以重新绘制 SVG 路径线
  window.addEventListener('resize', drawSvgPath);
  
  // 延迟绘制一次确保 DOM 渲染完成
  setTimeout(drawSvgPath, 500);
});

// ========== 渲染关卡节点 ==========
function renderNodes() {
  const container = document.getElementById('nodes-container');
  container.innerHTML = '';
  
  const currentNodes = themes[currentTheme].nodes;
  
  currentNodes.forEach((node, index) => {
    const pos = nodePositions[index];
    const nodeEl = document.createElement('div');
    nodeEl.className = 'map-node';
    nodeEl.style.left = `${pos.left}%`;
    nodeEl.style.top = `${pos.top}%`;
    
    nodeEl.innerHTML = `
      <div class="node-circle">
        <span class="node-illustration">${node.icon}</span>
        ${node.bonus ? `<span class="node-bonus">${node.bonus}</span>` : ''}
      </div>
      <span class="node-label">${node.name}</span>
      <span class="node-desc" title="${node.desc}">${node.desc}</span>
    `;
    
    container.appendChild(nodeEl);
  });
  
  // 节点更新后重新画连接线
  setTimeout(drawSvgPath, 100);
}

// ========== 绘制连接线 ==========
function drawSvgPath() {
  const container = document.getElementById('board-map');
  const pathEl = document.getElementById('map-path-line');
  const nodes = document.querySelectorAll('.map-node');
  
  if (!container || !pathEl || nodes.length < 2) return;
  
  const containerRect = container.getBoundingClientRect();
  let pathD = '';
  
  nodes.forEach((node, index) => {
    const circle = node.querySelector('.node-circle');
    const circleRect = circle.getBoundingClientRect();
    
    // 计算圆圈中心点相对于地图容器的坐标
    const x = (circleRect.left + circleRect.width / 2) - containerRect.left;
    const y = (circleRect.top + circleRect.height / 2) - containerRect.top;
    
    if (index === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      // 绘制贝塞尔曲线，使折角更圆润
      const prevCircle = nodes[index - 1].querySelector('.node-circle');
      const prevCircleRect = prevCircle.getBoundingClientRect();
      const prevX = (prevCircleRect.left + prevCircleRect.width / 2) - containerRect.left;
      const prevY = (prevCircleRect.top + prevCircleRect.height / 2) - containerRect.top;
      
      // 控制点计算，形成平滑 S 曲线
      const cpX1 = prevX + (x - prevX) / 2;
      const cpY1 = prevY;
      const cpX2 = prevX + (x - prevX) / 2;
      const cpY2 = y;
      
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
    }
  });
  
  pathEl.setAttribute('d', pathD);
}

// ========== 事件绑定 ==========
function bindEvents() {
  // 主题切换按钮
  const themeOpts = document.querySelectorAll('.theme-opt');
  themeOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      themeOpts.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      
      const themeName = opt.getAttribute('data-theme');
      currentTheme = themeName;
      
      // 更新 Body 的 class
      document.body.className = `theme-${themeName}`;
      
      // 重新渲染节点并刷新图纸
      renderNodes();
      updateBoard();
    });
  });
  
  // 表单输入监听
  const inputs = [
    'child-name', 'task-easy-1', 'task-easy-2', 'task-med-1', 'task-med-2', 'task-hard-1',
    'reward-100', 'reward-200', 'reward-700', 'reward-1000'
  ];
  
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateBoard);
    }
  });
}

// ========== 同步控制面板到打印预览区 ==========
function updateBoard() {
  // 1. 孩子名字与标题/吉祥物/气泡
  const name = document.getElementById('child-name').value.trim() || '宝贝';
  const themeInfo = themes[currentTheme];
  
  document.getElementById('meta-child-name').innerText = name;
  document.getElementById('mascot-img').src = themeInfo.image;
  document.getElementById('mascot-speech-text').innerText = themeInfo.speech;
  document.getElementById('board-title-text').innerText = `${themeInfo.emoji} ${name}${themeInfo.titleSuffix}`;
  
  // 2. 简单任务列表
  const easy1 = document.getElementById('task-easy-1').value.trim();
  const easy2 = document.getElementById('task-easy-2').value.trim();
  let easyHtml = '';
  if (easy1) easyHtml += `<div class="task-item">${easy1}</div>`;
  if (easy2) easyHtml += `<div class="task-item">${easy2}</div>`;
  document.getElementById('tasks-easy-list').innerHTML = easyHtml || '<div class="task-item" style="color:var(--text-light)">暂无今日任务</div>';
  
  // 3. 中等任务列表
  const med1 = document.getElementById('task-med-1').value.trim();
  const med2 = document.getElementById('task-med-2').value.trim();
  let medHtml = '';
  if (med1) medHtml += `<div class="task-item">${med1}</div>`;
  if (med2) medHtml += `<div class="task-item">${med2}</div>`;
  document.getElementById('tasks-med-list').innerHTML = medHtml || '<div class="task-item" style="color:var(--text-light)">暂无今日任务</div>';
  
  // 4. 困难任务列表
  const hard1 = document.getElementById('task-hard-1').value.trim();
  let hardHtml = '';
  if (hard1) hardHtml += `<div class="task-item">${hard1}</div>`;
  document.getElementById('tasks-hard-list').innerHTML = hardHtml || '<div class="task-item" style="color:var(--text-light)">暂无今日任务</div>';
  
  // 5. 积分兑换卡
  const rew100 = document.getElementById('reward-100').value.trim() || '未设定奖励';
  const rew200 = document.getElementById('reward-200').value.trim() || '未设定奖励';
  const rew700 = document.getElementById('reward-700').value.trim() || '未设定奖励';
  const rew1000 = document.getElementById('reward-1000').value.trim() || '未设定奖励';
  
  document.getElementById('reward-100-text').innerText = rew100;
  document.getElementById('reward-200-text').innerText = rew200;
  document.getElementById('reward-700-text').innerText = rew700;
  document.getElementById('reward-1000-text').innerText = rew1000;
  
  // 6. 今日日期自动填充
  const dateLine = document.querySelector('.date-line');
  if (dateLine) {
    const today = new Date();
    dateLine.innerText = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
  }
  
  // 每次内容更新后重新画连接线以防布局大小微调
  setTimeout(drawSvgPath, 50);
}
