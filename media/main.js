document.getElementById('generate').onclick = async () => {
  mermaid.initialize({ startOnLoad: false });

  const sectionRe = new RegExp(document.getElementById('section').value, 'i');
  const milestoneLabel = document.getElementById('milestoneLabel').value;
  const milestoneRe = new RegExp(document.getElementById('milestone').value, 'i');
  const startRe = new RegExp(document.getElementById('start').value, 'i');
  const endRe = new RegExp(document.getElementById('end').value, 'i');

  const lines = log.split(/\r?\n/);
  const tasks = {};

  function parseTime(text) {
    let time = null;
    const match = text.match(/\b(\d{1,2}):(\d{2}):(\d{2})\b/);
    if (match) {
      time = `${match[2].padStart(2, '0')}:${match[3]}`;
    }
    return time;
  }

  for (const line of lines) {
    const time = parseTime(line);
    if (time) {
      const sectionMatch = line.match(sectionRe);
      const section = sectionMatch?.[0].trim();
      if (section) {
        if (!tasks[section]) { tasks[section] = { label: section, milestones: [], bars: {} }; }

        if (milestoneRe.test(line)) {
          tasks[section].milestones.push({ label: milestoneLabel, time });
        }
        if (startRe.test(line)) {
          tasks[section].bars.start = time;
        }
        if (endRe.test(line)) {
          tasks[section].bars.end = time;
        }
      }
    }
  }

  let chart = `gantt\ntitle Gantt Chart\ndateFormat  HH:mm\naxisFormat %H:%M\n\n`;
  for (const task of Object.values(tasks)) {
    chart += `section ${task.label}\n`;
    for (const m of task.milestones) {
      chart += `  ${m.label} :milestone, stone, ${m.time}, 0m\n`;
    }
    if (task.bars.start && task.bars.end) {
      chart += `  ${task.label.replace(/[^a-zA-Z0-9]/g, '')}: bar, ${task.bars.start}, ${task.bars.end}\n`;
    }
  }
  const chartEl = document.getElementById('chart');
  const errorEl = document.getElementById('error');
  try {
    // Mermaid構文チェック（ここで例外が投げられる）

    mermaid.parse(chart);
    chartEl.textContent = chart;
    errorEl.textContent = ''; // エラー消去
    //mermaid.init(undefined, chartEl);
    await mermaid.run({ nodes: [chartEl] });
  } catch (err) {
    container.textContent = ''; // 描画キャンセル
    errorEl.textContent = `Mermaid 構文エラー:\n${err.message || String(err)}`;
  }
};

document.getElementById('copy').onclick = () => {
  navigator.clipboard.writeText(document.getElementById('chart').textContent);
};
