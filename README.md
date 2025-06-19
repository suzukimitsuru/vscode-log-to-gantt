# vscode-log-to-gantt README

ログから実行時間を抽出して、`Mermaid`のガントチャートチャートを生成します。

## Features

### 1.CSVファイルからガントチャートを生成する

- a) `Ctrl(⌘)+Shift(⇧)+P`キーを押し、コマンドパレットを出力する。
- b) `Log to Gantt: Generate Mermaid Gantt Chart`コマンドを選ぶ。
- c) CSVファイルを選ぶ。

    ``` csv
    id,task,start,duration
    a1,Planning,2025-06-01,5d
    a2,Coding,2025-06-06,10d
    a3,Testing,2025-06-17,4d
    ```

  - d) `Markdown`編集中は、`Mermaid`のガントチャートを貼り付ける。

    ``` text
        ``` mermaid
        gantt
            title Gantt Chart
            dateFormat  YYYY-MM-DD
            Planning : a1, 2025-06-01, 5d
            Coding : a2, 2025-06-06, 10d
            Testing : a3, 2025-06-17, 4d
        ```
    ```

- e) 他のファイルを編集中は、`Mermaid Gantt Preview`エディタを開いてプレビューする。

    ``` mermaid
    gantt
        title Gantt Chart
        dateFormat  YYYY-MM-DD
        Planning : a1, 2025-06-01, 5d
        Coding : a2, 2025-06-06, 10d
        Testing : a3, 2025-06-17, 4d
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
