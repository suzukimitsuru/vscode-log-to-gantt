// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParse from 'csv-parse/sync';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-log-to-gantt" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vscode-log-to-gantt.generateGantt', async () => {
		const uri = await vscode.window.showOpenDialog({
			filters: { 'CSV Files': ['csv'] },
			canSelectMany: false
		});

		if (!uri || uri.length === 0) {
			vscode.window.showErrorMessage('CSVファイルが選択されていません。');
		} else {
			const content = fs.readFileSync(uri[0].fsPath, 'utf-8');
			const records = csvParse.parse(content, {
				columns: true,
				skip_empty_lines: true,
			});

			const mermaidCode = generateMermaidGantt(records);

			const editor = vscode.window.activeTextEditor;
			if (!editor || editor.document.languageId !== 'markdown') {
				showMermaidWebview(context, mermaidCode);
			} else {
				editor.edit(editBuilder => {
					const pos = editor.selection.active;
					editBuilder.insert(pos, '``` mermaid\n' + mermaidCode + '\n```\n');
				});
				vscode.window.showInformationMessage('Mermaid GanttチャートをMarkdownに挿入しました。');
			}
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function generateMermaidGantt(data: any[]): string {
	const lines = ['gantt', '    title Gantt Chart', '    dateFormat  YYYY-MM-DD'];
	for (const row of data) {
		lines.push(`    ${row.task} : ${row.id}, ${row.start}, ${row.duration}`);
	}
	return lines.join('\n');
}

function showMermaidWebview(context: vscode.ExtensionContext, mermaidCode: string) {
  const panel = vscode.window.createWebviewPanel(
    'ganttChart',
    'Mermaid Gantt Preview',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
    }
  );

  const mermaidPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'mermaid.min.js');
  const mermaidSrc = panel.webview.asWebviewUri(mermaidPath);

  panel.webview.html = getWebviewContent(mermaidCode, mermaidSrc.toString());
}

function getWebviewContent(mermaidCode: string, mermaidJsUri: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mermaid Gantt Chart</title>
</head>
<body>
  <div class="mermaid">
    ${mermaidCode}
  </div>
  <script src="${mermaidJsUri}"></script>
  <script>
    mermaid.initialize({ startOnLoad: true });
  </script>
</body>
</html>`;
}
