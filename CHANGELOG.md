# Change Log

All notable changes to the "vscode-log-to-gantt" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [1.0.0] - 2025-07-05 Official release

- ログファイルを切り替える度に、Ganttパネルの内容を更新する。
- 検索条件の精査
  - バーの開始と終了を１つにまとめる。
  - タイトルの条件を追加する。

## [0.0.4] - 2025-07-03

- ログファイルの選択を別のファイルに変更した場合、同じ'vscode.WebviewPanel'で、検索対象とタイトル表示のみ変更する。
- 時間軸は分秒を時分として表示しているため、`00:23:59`を超えると不正な時刻になる。
  - このため、時間軸を開始時刻からの経過時刻にした。
- `Marmaid`レンダリングできる様にした。

## [0.0.3] - 2025-07-02

- alpha release
