# Notion Customize

## 概要

NotionのUIをカスタマイズするためのChrome拡張機能です。<br>
`Notion-Boost-browser-extension-main`配下は拡張機能「Notion Boost」を自分用にカスタマイズしたものです。

## Notion-Boost-browser-extension-main

### 機能

開発元の機能：https://gourav.io/notion-boost

追加した機能

* フォントがDefaultの場合、Noto Sans JPを使用
* 「Add indentation lines to lists」をトグルopen時も線が表示されるよう改修

### インストール方法

1. 依存関係のインストール\
   notion_customizeディレクトリで下記コマンドを実行
    ```
    cd Notion-Boost-browser-extension-main
    # pnpm がなければ npm install でも可
    pnpm install
    （pnpm-lock.yaml があるので、可能なら pnpm を使うのがベストです）
    ```
2. 拡張機能をビルド\
   同じディレクトリで下記コマンドを実行
   ```
   下記コマンドで build/ フォルダの中にChrome拡張として読み込める成果物が生成されます。
   pnpm build

   下記を実行すると wxt zip が走り、Chrome ウェブストア用の .zip も作られます（ローカルテストだけなら zip は不要）。
   pnpm package-chrome
   ```
3. Chrome に読み込む\
    1. Chrome を開き、アドレスバーに「chrome://extensions/」と入力
    2. 右上の 「デベロッパーモード」 をオン
    3. 左上の 「パッケージ化されていない拡張機能を読み込む」をクリック
    4. build/ ディレクトリの1個下の階層のディレクトリを選択

### ファイル構成

```
Notion-Boost-browser-extension-main/
├── components/
│   ├── features/
│   │   ├── codeLineNumbers.ts   # コードブロックに行番号を追加する機能
│   │   ├── openFullPage.ts      # ページプレビューを常に全画面で開く等の機能
│   │   └── outline.ts           # ページ内見出しからアウトライン（目次）を生成・表示する機能
│   └── settings.ts              # 拡張機能の機能設定や一覧などの管理
├── styles/
│   └── content.scss             # 拡張機能で利用するスタイルシート（Sass）
├── manifest.json                # Chrome拡張機能の基本情報・権限・エントリーポイント等を定義
├── background.js                # バックグラウンドで動作する処理（タブ管理やメッセージ受信等）
├── content.js                   # Notion ページ内に注入されるメインスクリプト
├── popup.html                   # 拡張機能アイコンをクリックした際に表示されるポップアップUI
├── popup.js                     # ポップアップUIの挙動を制御するスクリプト
└── ...                          # その他の補助ファイルやライブラリ等
```

> ※ `components/features/` 以下に、機能ごとの TypeScript ファイルが格納されています。主要な UI 関連や設定処理は `components/` 配下にあります。

---

## 自作

### 機能

実装済み
* **画面topへのボタン**: 右下にスクロールトップボタンを表示します（300px以上スクロールで表示）
* **Noto Sansフォント**: フォントがDefaultの場合、Noto Sans JP/Noto Sansを使用します

実装前
* **Outlineをサイドバーに表示**: ページの見出しを自動的に抽出し、右側に固定表示される目次を表示します
* **コードブロックに行番号表示**: コードブロックに自動的に行番号を追加します
* **コードブロック内でスペルチェック**: コードブロック内でもスペルチェックが有効になります
* **箇条書きリストに垂直のインデント行**: 箇条書きリストの項目間に垂直線を表示します
* **Todoリストに垂直のインデント行**: Todoリストの項目間に垂直線を表示します
* **コメントセクションの削除**: 全てのページからコメントセクションを非表示にします

### インストール方法

1. このリポジトリをクローンまたはダウンロードします
2. Chromeで `chrome://extensions/` を開きます
3. 右上の「デベロッパーモード」を有効にします
4. 「パッケージ化されていない拡張機能を読み込む」をクリックします
5. このプロジェクトのフォルダを選択します

### ファイル構成

```
notion_customize/
├── manifest.json        # 拡張機能の設定ファイル
├── content.js           # 処理を記載
├── styles.css
├── jquery-3.7.1.min.js  # jQueryを使用
└── README.md
```

### 使用方法

インストール後、Notion（https://www.notion.so）を開くと自動的に機能が有効になります。

### 注意事項

* NotionのUIが更新されると、一部の機能が動作しなくなる可能性があります
* この拡張機能は非公式のものであり、Notion公式とは関係ありません
