import { Webview, Uri } from 'vscode';

export function getWebviewContent(webview: Webview, extensionUri: Uri, logFilenode: string, logContent: string, theme: number): string {
    const mermaidPath = webview.asWebviewUri(Uri.joinPath(extensionUri, 'media', 'mermaid.min.js'));
    const codiconsUri = webview.asWebviewUri(Uri.joinPath(extensionUri, 'media', 'vscode-codicons.css'));
    const styleUri = webview.asWebviewUri(Uri.joinPath(extensionUri, 'media', 'style.css'));
    const scriptUri = webview.asWebviewUri(Uri.joinPath(extensionUri, 'media', 'main.js'));
    return `
<!DOCTYPE html>
<html data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <link href="${codiconsUri}" rel="stylesheet" />
  <link href="${styleUri}" rel="stylesheet">
  <script src="${mermaidPath}"></script>
</head>
<body>
  <div class="controls">
    <label>セクション: <input type="text" id="section" value="TASK:[0-9]* "></label>
    <label>マイルストーン名: <input type="text" id="milestoneLabel" value="Receive"></label>
    <label>マイルストーン: <input type="text" id="milestone" value="TASK:[0-9]* -- receive"></label>
    <label>開始: <input type="text" id="start" value="TASK:[0-9]* -- start"></label>
    <label>終了: <input type="text" id="end" value="TASK:[0-9]* -- finish"></label>
    <button id="search" title="Search"><span class="codicon codicon-search"></span></button>
    <button id="copy" title="Copy"><span class="codicon codicon-copy"></button>
  </div>
  <div id="error" class="error"></div>
  <div class="mermaid" id="chart"></div>
  <script>
    const logContent = \`${logContent.replace(/`/g, '\\`')}\`;
    const logFilename = '${logFilenode}';
  </script>
  <script src="${scriptUri}"></script>
</body>
</html>
`;
}
