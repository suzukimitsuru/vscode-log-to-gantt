const vscode = acquireVsCodeApi();
const editor = document.getElementById('editor');
const input = document.getElementById('searchInput');

const caseBtn = document.getElementById('caseBtn');
const wordBtn = document.getElementById('wordBtn');
const regexBtn = document.getElementById('regexBtn');

let isCaseSensitive = false;
let isRegex = false;
let matchWholeWord = false;

let matches = [];
let currentIndex = -1;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateEditorHighlight(text) {
  let search = input.value;
  if (!search) {
    editor.innerHTML = text;
    matches = [];
    return;
  }

  let flags = isCaseSensitive ? 'g' : 'gi';
  let pattern = search;

  if (!isRegex) {
    pattern = escapeRegex(pattern);
  }
  if (matchWholeWord) {
    pattern = `\\b${pattern}\\b`;
  }

  try {
    const regex = new RegExp(pattern, flags);
    let result = '';
    let lastIndex = 0;
    matches = [];

    for (const match of text.matchAll(regex)) {
      matches.push(match.index);
      result += text.slice(lastIndex, match.index);
      result += `<mark>${match[0]}</mark>`;
      lastIndex = match.index + match[0].length;
    }
    result += text.slice(lastIndex);
    editor.innerHTML = result;
  } catch (e) {
    editor.innerHTML = text; // fallback
    matches = [];
  }
}

function findNext() {
  if (matches.length === 0) return;
  currentIndex = (currentIndex + 1) % matches.length;
  scrollToMatch();
}

function findPrev() {
  if (matches.length === 0) return;
  currentIndex = (currentIndex - 1 + matches.length) % matches.length;
  scrollToMatch();
}

function scrollToMatch() {
  const marks = document.querySelectorAll('mark');
  if (marks[currentIndex]) {
    marks[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

input.addEventListener('input', () => updateEditorHighlight(editor.innerText));
editor.addEventListener('input', () => {
  vscode.postMessage({ type: 'edit', text: editor.innerText });
  updateEditorHighlight(editor.innerText);
});

// オプションボタン切替
function toggleOption(btn, prop) {
  btn.classList.toggle('active');
  window[prop] = !window[prop];
  updateEditorHighlight(editor.innerText);
}

caseBtn.addEventListener('click', () => {
  isCaseSensitive = !isCaseSensitive;
  toggleOption(caseBtn, 'isCaseSensitive');
});
wordBtn.addEventListener('click', () => {
  matchWholeWord = !matchWholeWord;
  toggleOption(wordBtn, 'matchWholeWord');
});
regexBtn.addEventListener('click', () => {
  isRegex = !isRegex;
  toggleOption(regexBtn, 'isRegex');
});

window.onload = () => {
  editor.innerText = window.initialText;
  updateEditorHighlight(window.initialText);
};
