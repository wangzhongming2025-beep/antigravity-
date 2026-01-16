document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const defaultStudents = [
        "郭一涵", "毕梓涵", "王言竹", "周芸萍", "王晓玉",
        "高雨", "林凯", "赵世涵", "宋佳怡", "司雯竹",
        "刘嘉贺", "于卓然", "刘易航", "常瑞心", "马一恒",
        "曲心悦", "李明翰", "佟思宇", "程纪", "李书瑶",
        "李奕豪", "董琪", "尹智博", "姜依娜", "金悦"
    ];

    let allStudents = [...defaultStudents];
    let calledHistory = [];
    let isRunning = false;
    let timerId = null;

    // --- DOM Elements ---
    const els = {
        nameDisplay: document.getElementById('display-name'),
        btnStart: document.getElementById('btn-start'),
        btnStop: document.getElementById('btn-stop'),
        btnReset: document.getElementById('btn-reset'),
        statTotal: document.getElementById('stat-total'),
        statCalled: document.getElementById('stat-called'),
        historyList: document.getElementById('history-list'),
        inputNames: document.getElementById('input-names'),
        btnImport: document.getElementById('btn-import'),
        btnClear: document.getElementById('btn-clear'),
        studentGrid: document.getElementById('student-grid'),
        toggleMgmt: document.getElementById('toggle-mgmt'),
        mgmtBody: document.getElementById('mgmt-body')
    };

    // --- Initialization ---
    init();

    function init() {
        renderStats();
        renderGrid();
        renderHistory();

        // Event Listeners
        els.btnStart.addEventListener('click', startRoll);
        els.btnStop.addEventListener('click', stopRoll);
        els.btnReset.addEventListener('click', resetAll);
        els.btnImport.addEventListener('click', importNames);
        els.btnClear.addEventListener('click', clearNames);

        // Toggle Panel
        els.toggleMgmt.addEventListener('click', () => {
            const isHidden = els.mgmtBody.style.display === 'none';
            els.mgmtBody.style.display = isHidden ? 'block' : 'none';
            els.toggleMgmt.querySelector('.toggle-icon').style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
        });
    }

    // --- Core Logic ---
    function startRoll() {
        if (isRunning) return;

        if (allStudents.length === 0) {
            alert("名单为空，请先导入学生！");
            return;
        }

        isRunning = true;
        els.btnStart.disabled = true;
        els.btnStop.disabled = false;

        // High speed loop
        timerId = setInterval(() => {
            const randomIdx = Math.floor(Math.random() * allStudents.length);
            updateDisplay(allStudents[randomIdx]);
        }, 50); // 50ms interval for fast cycling
    }

    function stopRoll() {
        if (!isRunning) return;

        clearInterval(timerId);
        isRunning = false;
        els.btnStart.disabled = false;
        els.btnStop.disabled = true;

        // Final Choice
        // Logic: Pick one, maybe one that hasn't been called recently? 
        // For simple random, just pick random.
        const winnerIndex = Math.floor(Math.random() * allStudents.length);
        const winnerName = allStudents[winnerIndex];

        updateDisplay(winnerName);

        // Animation end
        els.nameDisplay.classList.add('animate-roll');
        setTimeout(() => els.nameDisplay.classList.remove('animate-roll'), 500);

        addToHistory(winnerName);
        renderStats();
    }

    function resetAll() {
        if (isRunning) stopRoll();
        calledHistory = [];
        els.nameDisplay.textContent = "准备好了吗？";
        renderHistory();
        renderStats();
    }

    // --- UI Updaters ---
    function updateDisplay(name) {
        els.nameDisplay.textContent = name;
    }

    function renderStats() {
        els.statTotal.textContent = allStudents.length;
        els.statCalled.textContent = calledHistory.length;
    }

    function renderHistory() {
        els.historyList.innerHTML = '';
        if (calledHistory.length === 0) {
            els.historyList.innerHTML = '<span class="placeholder-text">暂无记录</span>';
            return;
        }

        // Show last 5-10
        calledHistory.slice().reverse().forEach(name => {
            const tag = document.createElement('span');
            tag.className = 'history-tag';
            tag.textContent = name;
            els.historyList.appendChild(tag);
        });
    }

    function renderGrid() {
        els.studentGrid.innerHTML = '';
        allStudents.forEach(name => {
            const badge = document.createElement('div');
            badge.className = 'student-badge';
            badge.textContent = name;
            els.studentGrid.appendChild(badge);
        });
    }

    function addToHistory(name) {
        calledHistory.push(name);
        renderHistory();
    }

    // --- Management Logic ---
    function importNames() {
        const raw = els.inputNames.value.trim();
        if (!raw) {
            alert("请输入内容！");
            return;
        }

        // Parse: Split by newline or comma
        const newNames = raw.split(/[\n,，]+/).map(s => s.trim()).filter(s => s.length > 0);

        if (newNames.length > 0) {
            // Add unique names or replace? 
            // Default behavior: Replace current list for bulk import
            if (confirm(`确定要导入 ${newNames.length} 个名字吗？这将覆盖当前列表。`)) {
                allStudents = newNames;
                calledHistory = []; // Reset history as list changed
                resetAll();
                renderGrid();
                alert("导入成功！");
                els.inputNames.value = '';
            }
        }
    }

    function clearNames() {
        if (confirm("确定要清空所有学生名单吗？")) {
            allStudents = [];
            calledHistory = [];
            resetAll();
            renderGrid();
        }
    }
});
