import { Webview, Uri } from 'vscode';

export function getWebviewContent(webview: Webview, extensionUri: Uri, theme: number): string {
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
    <label>section: <input type="text" id="regexp-section" value="TASK:[0-9]* "></label>
    <label>milestone: <input type="text" id="regexp-milestone" value="TASK:[0-9]* -- receive"></label>
    <label>bar: <input type="text" id="regexp-bar" value="TASK:[0-9]* -- (start|finish)"></label>
    <label>name: <input type="text" id="regexp-name" value=".*title: (.*)"></label>
    <button id="search" title="Search"><span class="codicon codicon-search"></span></button>
    <button id="copy" title="Copy"><span class="codicon codicon-copy"></button>
  </div>
  <div id="error" class="error"></div>
  <div class="mermaid" id="chart"></div>
  <script>
    let logContent = '';
    let logFilename = '';
  </script>
  <script src="${scriptUri}"></script>
</body>
</html>
`;
}
