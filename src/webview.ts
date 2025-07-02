import { Webview, Uri } from 'vscode';

export function getWebviewContent(webview: Webview, extensionUri: Uri, logContent: string, theme: number): string {
    const mermaidPath = webview.asWebviewUri(Uri.joinPath(extensionUri, 'media', 'mermaid.min.js'));
    const styleUri = webview.asWebviewUri(Uri.joinPath(extensionUri, 'media', 'style.css'));
    const scriptUri = webview.asWebviewUri(Uri.joinPath(extensionUri, 'media', 'main.js'));
    return `
<!DOCTYPE html>
<html data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <link href="${styleUri}" rel="stylesheet">
  <script src="${mermaidPath}"></script>
</head>
<body>
  <div class="controls">
    <label>セクション: <input type="text" id="section" value="TASK:[0-9]* "></label>
    <label>マイルストーン表示: <input type="text" id="milestoneLabel" value="Receive"></label>
    <label>マイルストーン: <input type="text" id="milestone" value="TASK:[0-9]* -- receive"></label>
    <label>開始: <input type="text" id="start" value="TASK:[0-9]* -- start"></label>
    <label>終了: <input type="text" id="end" value="TASK:[0-9]* -- finish"></label>
    <button id="generate">表示</button>
    <button id="copy">📋</button>
  </div>
  <div id="error" class="error"></div>
  <div class="mermaid" id="chart"></div>
  <script>
    const log = \`${logContent.replace(/`/g, '\\`')}\`;
  </script>
  <script src="${scriptUri}"></script>
</body>
</html>
`;
}
