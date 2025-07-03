function getMermaidTheme() {
  // Webviewの<html data-theme="...">属性を参照
  const theme = document.documentElement.getAttribute('data-theme');
  // VSCodeのtheme kind: 1=Light, 2=Dark, 3=HighContrast
  return (theme === '2' || theme === '3') ? 'dark' : 'default';
}

// Mermaid初期化は一度だけ
let lastMermaidCode = '';
mermaid.initialize({ startOnLoad: false, theme: getMermaidTheme() });

document.getElementById('search').onclick = async () => {
  const sectionRe = new RegExp(document.getElementById('section').value, 'i');
  const milestoneLabel = document.getElementById('milestoneLabel').value;
  const milestoneRe = new RegExp(document.getElementById('milestone').value, 'i');
  const startRe = new RegExp(document.getElementById('start').value, 'i');
  const endRe = new RegExp(document.getElementById('end').value, 'i');

  const lines = logContent.split(/\r?\n/);
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

  let start_time = null;
  for (const line_text of lines) {
    const line_time = parseTime(line_text);
    if (line_time) {
      const sectionMatch = line_text.match(sectionRe);
      const section = sectionMatch?.[0].trim();
      if (section) {
        if (!tasks[section]) { tasks[section] = { label: section, milestones: [], bars: {} }; }
        start_time = start_time || line_time; // 最初の時間を基準にする

        if (milestoneRe.test(line_text)) {
          tasks[section].milestones.push({ label: milestoneLabel, time: line_time });
        }
        if (startRe.test(line_text)) {
          tasks[section].bars.start = line_time;
        }
        if (endRe.test(line_text)) {
          tasks[section].bars.end = line_time;
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
  
  let chart = `gantt\ntitle ${logFilename}\ndateFormat HH:mm\naxisFormat %H:%M\ntodayMarker off\n\n`;
  for (const task of Object.values(tasks)) {
    chart += `section ${task.label}\n`;
    for (const m of task.milestones) {
      if (start_time) {
        const rel = timeToHHmm(m.time - start_time);
        chart += `  ${m.label}: milestone, ${rel}, 0m\n`;
      }
    }
    if (task.bars.start && task.bars.end && start_time) {
      const relStart = timeToHHmm(task.bars.start - start_time);
      const relEnd = timeToHHmm(task.bars.end - start_time);
      chart += `  ${task.label.replace(/[^a-zA-Z0-9]/g, '')}: ${relStart}, ${relEnd}\n`;
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
  } catch (err) {
    errorEl.textContent = `Mermaid Syntax error:\n${err.message || String(err)}`;
  }
};

document.getElementById('copy').onclick = () => {
  navigator.clipboard.writeText(lastMermaidCode);
};
