// index.js 完整内容

// 1. 配置和全局变量
const TECH_CONFIG = {
    'HTML': { color: '#ffadad', link: 'https://my.feishu.cn/wiki/KK1ywC376ikQ35kpvXjcL0oIn5g' },
    'CSS': { color: '#ffd6a5', link: 'https://my.feishu.cn/wiki/HttEweqgEiwa5AkJqGQcgVZlnKg' },
    'JavaScript': { color: '#fdffb6', link: 'https://my.feishu.cn/wiki/CYxkwCpc3ikHVuk8HGIcLGcwnnh' },
    '工程化': { color: '#caffbf', link: 'https://my.feishu.cn/wiki/CYxkwCpc3ikHVuk8HGIcLGcwnnh' },
    'Vue': { color: '#9bf6ff', link: 'https://my.feishu.cn/wiki/Y8bZwrXB6ia4HakBtDSczoMfn8e' },
    'React': { color: '#a0c4ff', link: 'https://my.feishu.cn/wiki/Y8bZwrXB6ia4HakBtDSczoMfn8e' },
    '八股': { color: '#bdb2ff', link: 'https://my.feishu.cn/wiki/CYxkwCpc3ikHVuk8HGIcLGcwnnh' }
};

let appData = JSON.parse(localStorage.getItem('hannie_v6_data')) || {
    techMinutes: { 'HTML': 0, 'CSS': 0, 'JavaScript': 0, '工程化': 0, 'Vue': 0, 'React': 0, '八股': 0 },
    dailyLog: {}
};

let timeLeft = 25 * 60;
let timerId = null;
let isRunning = false;
let currentTech = 'HTML';
let pieChart, lineChart;

// --- 核心修改：等待页面加载完毕后再执行入口函数 ---
window.onload = function () {
    initButtons();
    updateUI();
    // 如果你有其他需要在启动时执行的逻辑放在这里
};

// 2. 初始化按钮（首页卡片和专注页切换按钮）
function initButtons() {
    const grid = document.getElementById('home-tech-grid');
    const box = document.getElementById('sector-btns');

    if (!grid || !box) return; // 安全检查

    grid.innerHTML = ''; // 清空原有内容
    box.innerHTML = '';

    Object.keys(TECH_CONFIG).forEach(tech => {
        grid.innerHTML += `<div class="tech-card" onclick="openFocus('${tech}')"><h3>${tech}</h3><span class="badge" id="b-${tech}">${appData.techMinutes[tech] || 0}m</span></div>`;
        box.innerHTML += `<button class="sector-btn" id="btn-${tech}" onclick="switchTech('${tech}')" style="background:${TECH_CONFIG[tech].color}; color:${['JavaScript', '工程化'].includes(tech) ? '#666' : '#fff'}">${tech}</button>`;
    });
    box.innerHTML += `<p style="font-size:0.8rem; text-align:center; margin:5px 0 0 0">当前选中: <b id="current-label" style="color:var(--pony-pink)">HTML</b></p>`;
}

// 3. 计时器核心逻辑
function formatHM(totalMin) { return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`; }

function toggleTimer() {
    if (!isRunning) {
        isRunning = true;
        document.getElementById('toggle-btn').innerText = "PAUSE FOCUS";
        document.getElementById('toggle-btn').classList.add('running');
        timerId = setInterval(tick, 1000);
    } else {
        pauseTimer();
    }
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerId);
    if (document.getElementById('toggle-btn')) {
        document.getElementById('toggle-btn').innerText = "RESUME FOCUS";
        document.getElementById('toggle-btn').classList.remove('running');
    }
}

function tick() {
    if (timeLeft > 0) {
        timeLeft--;
        renderTimer();
        if (timeLeft % 60 === 0) {
            const today = new Date().toISOString().split('T')[0];
            appData.techMinutes[currentTech]++;
            appData.dailyLog[today] = (appData.dailyLog[today] || 0) + 1;
            localStorage.setItem('hannie_v6_data', JSON.stringify(appData));
            updateUI();
        }
    } else {
        pauseTimer();
        alert("番茄完成！太棒了~ ✨");
    }
}

// 4. UI 刷新与图表更新
function updateUI() {
    const today = new Date().toISOString().split('T')[0];
    const statToday = document.getElementById('stat-today');
    const statWeek = document.getElementById('stat-week');

    if (statToday) statToday.innerText = formatHM(appData.dailyLog[today] || 0);

    let weekTotal = 0;
    const weekHours = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const min = appData.dailyLog[ds] || 0;
        weekTotal += min;
        weekHours.push((min / 60).toFixed(1));
    }

    if (statWeek) statWeek.innerText = formatHM(weekTotal);

    Object.keys(TECH_CONFIG).forEach(t => {
        const badge = document.getElementById('b-' + t);
        if (badge) badge.innerText = (appData.techMinutes[t] || 0) + 'm';
    });

    if (pieChart) {
        pieChart.data.datasets[0].data = Object.values(appData.techMinutes);
        pieChart.update();
    }
    if (lineChart) {
        lineChart.data.datasets[0].data = weekHours;
        lineChart.update();
    }
}

// 5. 初始化 Chart.js 实例
function initCharts() {
    const canvasP = document.getElementById('pieChart');
    const canvasL = document.getElementById('lineChart');
    if (!canvasP || !canvasL) return;

    pieChart = new Chart(canvasP.getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(TECH_CONFIG),
            datasets: [{
                data: Object.values(appData.techMinutes),
                backgroundColor: Object.values(TECH_CONFIG).map(t => t.color),
                borderWidth: 2, borderColor: '#fff'
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } },
                tooltip: { callbacks: { label: (context) => ` ${context.label}: ${formatHM(context.raw)}` } }
            }
        }
    });

    lineChart = new Chart(canvasL.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#ff69b4',
                backgroundColor: 'rgba(255,105,180,0.1)',
                fill: true, tension: 0.4
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 12 } },
            plugins: { legend: { display: false } }
        }
    });
}

// 6. 页面交互控制
function renderTimer() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    const display = document.getElementById('timer-display');
    if (display) display.innerText = `${m}:${s}`;
}

function setCustomTime() {
    pauseTimer();
    const min = prompt("设定专注分钟数:", "25");
    if (min && !isNaN(min)) { timeLeft = min * 60; renderTimer(); }
}

function switchTech(tech) {
    currentTech = tech;
    const label = document.getElementById('current-label');
    if (label) label.innerText = tech;
    document.querySelectorAll('.sector-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('btn-' + tech);
    if (btn) btn.classList.add('active');
}

function openLink() { window.open(TECH_CONFIG[currentTech].link, '_blank'); }

function openFocus(tech) {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('focus-page').style.display = 'block';
    switchTech(tech);
    if (!pieChart) initCharts(); // 第一次打开时初始化图表
    updateUI();
}

function closeFocus() {
    pauseTimer();
    document.getElementById('focus-page').style.display = 'none';
    document.getElementById('home-page').style.display = 'block';
    updateUI();
}

// 将函数挂载到 window 对象，确保 HTML 里的 onclick 能找到它们
window.openFocus = openFocus;
window.closeFocus = closeFocus;
window.toggleTimer = toggleTimer;
window.switchTech = switchTech;
window.setCustomTime = setCustomTime;
window.openLink = openLink;