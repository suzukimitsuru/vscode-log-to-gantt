const vscode = acquireVsCodeApi();
window.addEventListener('DOMContentLoaded', () => {
  vscode.postMessage({ command: 'ready' });
});

// Mermaid初期化は一度だけ
let lastMermaidCode = '';

// メッセージを受け取る
window.addEventListener("message", (event) => {
  switch (event.data.command) {
    case 'update':
      logFilename = event.data.filename;
      logContent = event.data.content.replace(/`/g, '\\`');
      vscode.postMessage({ command: 'debug', line: 'update: ' + logContent.length + ' bytes' });
      break;
    case 'theme':
      // themeKind: 1=Light, 2=Dark, 3=HighContrast
      const theme = (event.data.kind === 2 || event.data.kind === 3) ? 'dark' : 'default';
      mermaid.initialize({ startOnLoad: false, theme });
      break;
    case 'settings':
      // 検索設定を受け取る
      document.getElementById('regexp-section').value = event.data.settings.section;
      document.getElementById('regexp-milestone').value = event.data.settings.milestone;
      document.getElementById('regexp-bar').value = event.data.settings.bar;
      document.getElementById('regexp-name').value = event.data.settings.name;
      break;
  }
});
vscode.postMessage({ command: 'ready' });

document.getElementById('search').onclick = async () => {
  const sectionValue = document.getElementById('regexp-section').value;
  const milestoneValue = document.getElementById('regexp-milestone').value;
  const barValue = document.getElementById('regexp-bar').value;
  const nameValue = document.getElementById('regexp-name').value;
  const sectionRe = new RegExp(sectionValue, 'i');
  const milestoneRe = new RegExp(milestoneValue, 'i');
  const barRe = new RegExp(barValue, 'i');
  const nameRe = new RegExp(nameValue, 'i');

  const lines = logContent.split(/\r?\n/);
  vscode.postMessage({ command: 'debug', line: 'search: ' + logContent.length + ' bytes' });
  const tasks = {};

  function parseTime(text) {
    let time = null;
    const match = text.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (match) {
      // 時刻を秒単位に変換
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const s = parseInt(match[3], 10);
      time = (((h * 60) + m) * 60) + s ;
    }
    return time;
  }

  // ログを解析
  let start_time = null;
  for (const line_text of lines) {
    const line_time = parseTime(line_text);
    if (line_time) {
      const sectionMatch = line_text.match(sectionRe);
      const section = sectionMatch?.[0].trim();
      if (section) {
        if (!tasks[section]) { tasks[section] = { label: section, milestones: [], bars: { name: section } }; }
        start_time = start_time || line_time; // 最初の時間を基準にする

        if (milestoneRe.test(line_text)) {
          tasks[section].milestones.push({ time: line_time });
        }
        if (barRe.test(line_text)) {
          tasks[section].bars.start = tasks[section].bars.start ? (line_time < tasks[section].bars.start ? line_time : tasks[section].bars.start) : line_time;
          tasks[section].bars.end = tasks[section].bars.end ? (tasks[section].bars.end < line_time ? line_time : tasks[section].bars.end) : line_time;
        }
        const name_match = line_text.match(nameRe);
        if (name_match && name_match.length > 1) {
          tasks[section].bars.name = name_match[1];
        }
      }
    }
  }

  // 時刻を`HH:mm`形式に変換
  function timeToHHmm(minutes) {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  
  // Mermaid Ganttを生成
  let chart = `gantt\n  title ${logFilename}\n  dateFormat HH:mm\n  axisFormat %H:%M\n  todayMarker off\n\n`;
  for (const task of Object.values(tasks)) {
    chart += `  section ${task.label.replace(/[,:]/g, ' ')}\n`;
    for (const milestone of task.milestones) {
      if (start_time) {
        const rel = timeToHHmm(milestone.time - start_time);
        chart += `    +: milestone, ${rel}, 0m\n`;
      }
    }
    if (task.bars.start && task.bars.end && start_time) {
      const relStart = timeToHHmm(task.bars.start - start_time);
      const relEnd = timeToHHmm(task.bars.end - start_time);
      chart += `    ${task.bars.name.replace(/[,:]/g, ' ')}: ${relStart}, ${relEnd}\n`;
    }
  }
  // 最後に生成したMermaidコードを保存
  lastMermaidCode = chart;

  const oldChartEl = document.getElementById('chart');
  const newChartEl = document.createElement('div');
  newChartEl.className = 'mermaid';
  newChartEl.id = 'chart';
  oldChartEl.replaceWith(newChartEl);
  const errorEl = document.getElementById('error');
  try {
    // Mermaid構文チェック（ここで例外が投げられる）
    mermaid.parse(chart);
    errorEl.textContent = '';
    newChartEl.textContent = chart;
    await mermaid.run({ nodes: [newChartEl] });
    vscode.postMessage({
      command: 'save',
      settings: { section: sectionValue, milestone: milestoneValue, bar: barValue, name: nameValue } 
    });
  } catch (err) {
    errorEl.textContent = `Mermaid Syntax error:\n${err.message || String(err)}`;
  }
};

document.getElementById('copy').onclick = () => {
  navigator.clipboard.writeText(lastMermaidCode);
};
