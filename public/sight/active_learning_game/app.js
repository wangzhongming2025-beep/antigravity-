// ========== 全局配置与状态 ==========
const themes = {
  ninja: {
    emoji: "🥷",
    image: "assets/ninja.png",
    titleSuffix: "的主动学习大冒险",
    nodes: [
      { name: "出发准备", desc: "理清文具,桌面整洁", icon: "🎒" },
      { name: "制定清单", desc: "分类任务,填入板中", icon: "📝" },
      { name: "攻坚挑战", desc: "挑出最难的任务开写", icon: "⚔️", bonus: "+1pt" },
      { name: "二连击破", desc: "连续完成两项简单任务", icon: "⚡" },
      { name: "专注挑战", desc: "开启15分钟专注护盾", icon: "🛡️" },
      { name: "中等突破", desc: "搞定中等难度任务", icon: "🔥" },
      { name: "能量补给", desc: "伸个懒腰，喝杯温水", icon: "🥛" },
      { name: "困难解决", desc: "最难任务已全部击破", icon: "🏆", bonus: "+2pt" },
      { name: "胜利冲刺", desc: "收拾好桌面，大功告成", icon: "🏁" }
    ]
  },
  space: {
    emoji: "🚀",
    image: "assets/space.png",
    titleSuffix: "的星际自驱航行",
    nodes: [
      { name: "飞船整备", desc: "桌面及文具准备就绪", icon: "🛸" },
      { name: "星图规划", desc: "梳理今日学习任务", icon: "🗺️" },
      { name: "突破引力", desc: "首战攻克最难任务", icon: "💥", bonus: "+1pt" },
      { name: "流星加速", desc: "快速消灭两个简单任务", icon: "☄️" },
      { name: "护盾充能", desc: "保持专注，屏蔽噪音", icon: "🔋" },
      { name: "跃迁航行", desc: "搞定中等难度任务", icon: "🌀" },
      { name: "空间补给", desc: "深呼吸，喝水充电", icon: "🍎" },
      { name: "征服黑洞", desc: "终极困难任务全部搞定", icon: "🌌", bonus: "+2pt" },
      { name: "降落母星", desc: "检查收拾，胜利返航", icon: "🌍" }
    ]
  },
  magic: {
    emoji: "🏰",
    image: "assets/magic.png",
    titleSuffix: "的魔法自驱修炼",
    nodes: [
      { name: "魔法准备", desc: "文具就位，心境沉静", icon: "🔮" },
      { name: "法术清单", desc: "列出魔法学习步骤", icon: "📜" },
      { name: "挑战魔王", desc: "首先击破高难度魔法", icon: "👹", bonus: "+1pt" },
      { name: "小试身手", desc: "快速搞定两个简单魔法", icon: "✨" },
      { name: "冥想专注", desc: "进入静音魔法力场", icon: "🧘" },
      { name: "高级魔法", desc: "击破中等难度挑战", icon: "💫" },
      { name: "魔力泉补给", desc: "伸展身体，饮水休整", icon: "🧪" },
      { name: "终极禁咒", desc: "困难任务已彻底解开", icon: "👑", bonus: "+2pt" },
      { name: "点亮法阵", desc: "完美收拾，魔法满盈", icon: "🌟" }
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
      
      // 控制点计算，形成平滑的S曲线
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
  // 1. 孩子名字与标题/吉祥物
  const name = document.getElementById('child-name').value.trim() || '宝贝';
  const themeInfo = themes[currentTheme];
  
  document.getElementById('meta-child-name').innerText = name;
  document.getElementById('mascot-img').src = themeInfo.image;
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
