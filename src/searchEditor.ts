import * as vscode from 'vscode';
import * as path from 'path';

export class SearchEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.html = this.getHtmlForWebview(
      webviewPanel.webview,
      document.getText()
    );

    webviewPanel.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case 'edit':
          this.applyEdit(document, message.text);
          break;
      }
    });

    // Document変更をWebviewに通知
    const changeDoc = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        webviewPanel.webview.postMessage({
          type: 'update',
          text: document.getText(),
        });
      }
    });

    webviewPanel.onDidDispose(() => changeDoc.dispose());
  }

  private applyEdit(document: vscode.TextDocument, text: string) {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
    );
    edit.replace(document.uri, fullRange, text);
    return vscode.workspace.applyEdit(edit);
    }

    private getHtmlForWebview(webview: vscode.Webview, text: string): string {
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'main.js'))
    );
    const codiconUri = 'https://microsoft.github.io/vscode-codicons/dist/codicon.css';

    return /*html*/ `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="${codiconUri}" />
        <style>
            body { font-family: var(--vscode-editor-font-family, monospace); margin: 0; }
            #toolbar {
            display: flex; align-items: center;
            background: var(--vscode-editor-background, #eee);
            padding: 4px;
            gap: 4px;
            }
            input[type="text"] {
            flex: 1;
            padding: 4px;
            font-family: inherit;
            font-size: 1em;
            }
            .icon-button {
            cursor: pointer;
            padding: 4px;
            border: none;
            background: transparent;
            color: var(--vscode-icon-foreground);
            }
            .icon-button.active {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            }
            #editor {
            white-space: pre-wrap;
            overflow: auto;
            padding: 8px;
            }
            mark { background: yellow; }
        </style>
        </head>
        <body>
        <div id="toolbar">
            <input type="text" id="searchInput" placeholder="検索..." />
            <button class="icon-button" id="caseBtn" title="Aa">
                <i class="codicon codicon-case-sensitive"></i>
            </button>
            <button class="icon-button" id="wordBtn" title="単語全体一致">
                <i class="codicon codicon-whole-word"></i>
            </button>
            <button class="icon-button" id="regexBtn" title=".*">
                <i class="codicon codicon-regex"></i>
            </button>
            <button class="icon-button" onclick="findPrev()">↑</button>
            <button class="icon-button" onclick="findNext()">↓</button>
        </div>
        <div id="editor" contenteditable="true"></div>
        <script>window.initialText = \`${text.replace(/`/g, '\\`')}\`;</script>
        <script src="${scriptUri}"></script>
        </body>
        </html>
    `;
  }
}
