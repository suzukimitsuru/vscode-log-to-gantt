// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getWebviewContent } from './webview';
import * as path from 'path';
import * as fs from 'fs';

// The command has been defined in the package.json file
// Now provide the implementation of the command with registerCommand
// The commandId parameter must match the command field in package.json
let panel: vscode.WebviewPanel | undefined;
let panel_webview_is_loded = false;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const settingsPath = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath || '', '.vscode', 'settings.json');

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-log-to-gantt" is now active!');

	// エディタ切り替え時に.logファイルなら自動でコマンド実行
	vscode.window.onDidChangeActiveTextEditor(async (editor) => {
		if (editor && editor.document && editor.document.languageId === 'log') {
			if (panel) {
				const filenode = path.basename(editor.document.fileName);
				const content = editor.document.getText();
				panel.title = `Gantt ${filenode}`;
				panel.webview.postMessage({ command: 'update', filename: filenode, content: content });
				console.debug(`onDidChangeActiveTextEditor: ${filenode}: ${content.length} bytes`);
			}
		}
	});

	// VSCodeのカラーテーマ変更時にWebviewへ通知
	vscode.window.onDidChangeActiveColorTheme((e) => {
		if (panel) {
			panel.webview.postMessage({ command: 'theme', kind: e.kind });
		}
	});

	// ファイル内容が変更された場合のリスナ
	vscode.workspace.onDidChangeTextDocument((event) => {
		const editor = vscode.window.activeTextEditor;
		if (editor && editor.document === event.document && editor.document.languageId === 'log') {
			if (panel) {
				const filenode = require('path').basename(editor.document.fileName);
				const content = editor.document.getText();
				panel.title = `Gantt ${filenode}`;
				panel.webview.postMessage({ command: 'update', filename: filenode, content: content });
				console.debug(`onDidChangeTextDocument: ${filenode}: ${content.length} bytes`);
			}
		}
	});
	
	function loadSearchSettings(path: string) {
		try {
			const json = fs.readFileSync(path, 'utf8');
			const obj = JSON.parse(json);
			return obj['logToGantt.search'] || {
				section: 'TASK:[0-9]* ',
				milestone: 'TASK:[0-9]* -- receive',
				bar: 'TASK:[0-9]* -- (start|finish)',
				name: '.*title: (.*)'
			};
		} catch {
			return {};
		}
	}

	function saveSearchSettings(path: string, settings: any) {
		let obj: any = {};
		try {
			obj = JSON.parse(fs.readFileSync(path, 'utf8'));
		} catch {}
		obj['logToGantt.search'] = settings;
		fs.writeFileSync(path, JSON.stringify(obj, null, 2));
	}

	context.subscriptions.push(vscode.commands.registerCommand('vscode-log-to-gantt.showGantt', async (uri?: vscode.Uri) => {
		let doc = vscode.window.activeTextEditor?.document || null;
		// エクスプローラーから起動
		if (uri) {
			// 開いていない場合、ログファイルを開く
			doc = doc || await vscode.workspace.openTextDocument(uri);
		}
		if (doc) {
			const filenode = path.basename(doc.fileName);
			const content = doc.getText();
			const settings = loadSearchSettings(settingsPath);

			// ganttパネルが開いている場合
			if (panel) {
				panel.title = `Gantt ${filenode}`;
				panel.reveal();
			} else {
				panel = vscode.window.createWebviewPanel(
					'logToGantt',
					`Gantt ${filenode}`,
					vscode.ViewColumn.One,
					{
						enableScripts: true,
						retainContextWhenHidden: true,
					}
				);
				panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, vscode.window.activeColorTheme.kind);
				
				// パネルが閉じられたときの処理
				panel.onDidDispose(() => { panel = undefined; }, null, context.subscriptions);

				// メッセージ受信イベント
				panel.webview.onDidReceiveMessage(async event => {
					switch (event.command) {
						case 'ready':
							// Webviewが準備完了
							panel?.webview.postMessage({ command: 'theme', kind: vscode.window.activeColorTheme.kind });
							panel?.webview.postMessage({ command: 'update', filename: filenode, content: content });
							panel?.webview.postMessage({ command: 'settings', settings: settings });
							console.debug(`ready: ${filenode}: ${content.length} bytes`);
							panel_webview_is_loded = true;
							break;
						case 'save':
							saveSearchSettings(settingsPath, event.settings);
							console.debug('検索条件を保存しました');
							break;
						case 'debug':
							console.debug('debug: ' + event.line);
							break;
						default:
							break;
					}
				}, null, context.subscriptions);
			}

			// Webviewがロードされていたら、表示内容を更新
			if (panel_webview_is_loded) {
				panel.webview.postMessage({ command: 'theme', kind: vscode.window.activeColorTheme.kind });
				panel.webview.postMessage({ command: 'update', filename: filenode, content: content });
				panel.webview.postMessage({ command: 'settings', settings: settings });
			}
		}
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}

