# vscode-log-to-gantt README

ログから実行時間を抽出して、`Mermaid`のガントチャートチャートを生成します。

## Features

### 1.CSVファイルからガントチャートを生成する

- a) ログファイルの中で右クリックし、メニューの'Log to Gantt'を選択する。
- b) 検索条件を入力して、表示ボタンを押す。
  - セクション検索: セクション名を検索する正規表現を入力 例) 'TASK:[0-9]* '
  - マイルストーン表示: マイルストーンの名称を入力 例) 'Receive'
  - マイルストーン検索: マイルストーンの行を検索する正規表現を入力 例) 'TASK:[0-9]* -- receive'
  - タスク開始検索: タスクを開始する行を検索する正規表現を入力 例) 'TASK:[0-9]* -- start'
  - タスク終了検索: タスクを終了する行を検索する正規表現を入力 例) 'TASK:[0-9]* -- finish'
- c) `Mermaid`でガントチャートチャートをレンダリングして表示する。
- d) コピーボタンを押すと、ガントチャートチャートをテキストで、クリップボードにコピーする。

  ``` mermaid
  gantt
      title Gantt Chart
      dateFormat  HH:mm
      axisFormat %H:%M

      section TASK:1
        Receive :milestone, stone, 00:00, 0m
        TASK1: bar, 00:20, 00:25
      section TASK:2
        Receive :milestone, stone, 00:01, 0m
        TASK2: bar, 00:10, 00:30
  ```

## Specification

### ChatGPT(GPT‑4o)にベースを作っていただきました

ログファイルから正規表現で指定した行の時間を使って、mermaidのganttを表示するソフトを作って下さい。

- 動作環境: VSCode 拡張機能
- 開発言語: Typescript
- 画面表示
  - 検索条件を画面上部に表示する。
  - その下に、mermaidのganttのプレビューを表示する。
  - 画面はVSCodeのテーマの配色を適用する事。
  - ボタンには、VSCodeのアイコンを表示する事。
- 操作方法
  - a) VSCodeでMarkdownのプレビューと同じで、ログファイルを右クリックしたメニューの'Log to Gantt'を選択する
  - b) タイトル'Gantt ログファイル名'の'vscode.WebviewPanel'を表示する。
  - c) 検索条件を入力して、表示ボタンを押す。
  - d) mermaidのganttをレンダリングして表示する。
  - e) mermaidのエラーは文字列で表示する。
  - f) コピーボタンを押すと、mermaidのganttをテキストで、クリップボードにコピーする。
- ログファイル
  - 日時は行の最初にあり、様々な形式に対応する事。

  ``` log
  Jul 2 10:00:00 TASK:1 -- receive
  Jul 2 10:00:01 TASK:2 -- receive
  Jul 2 10:00:10 TASK:2 -- start
  Jul 2 10:00:20 TASK:1 -- start
  Jul 2 10:00:25 TASK:1 -- finish
  Jul 2 10:00:30 TASK:2 -- finish
  ```

- 検索条件
  - セクション検索: 'TASK:[0-9]* '
  - マイルストーン表示: 'Receive'
  - マイルストーン検索: 'TASK:[0-9]* -- receive'
  - タスク開始検索: 'TASK:[0-9]* -- start'
  - タスク終了検索: 'TASK:[0-9]* -- finish'

- ガントチャート
  - ログファイルを検索条件で検索した結果、以下のガントチャートを出力する
  - 時分秒を日時分に変換する事。

  ``` mermaid
  gantt
      title Gantt Chart
      dateFormat  HH:mm
      axisFormat %H:%M

      section TASK:1
        Receive :milestone, stone, 00:00, 0m
        TASK1: bar, 00:20, 00:25
      section TASK:2
        Receive :milestone, stone, 00:01, 0m
        TASK2: bar, 00:10, 00:30
  ```

## Requirements

`Visual Studio Code`拡張機能をインストールして下さい。

- [Markdown Preview Mermaid Support / Matt Bierner](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
