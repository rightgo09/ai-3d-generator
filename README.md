# AI 3D Generator

Blender と Gemini API を使用して、テキストプロンプトから 3D モデルを生成するプロトタイプです。

## 機能

- Web ブラウザでプロンプトを入力
- Gemini API が Blender Python スクリプトを生成
- Blender でプリミティブを組み合わせて 3D モデルを作成
- Three.js で生成されたモデルをブラウザに表示

## 必要な環境

### 1. Blender のインストール

**macOS:**
```bash
brew install --cask blender
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install blender
```

**Windows:**
[Blender 公式サイト](https://www.blender.org/download/)からダウンロード

インストール後、コマンドラインから `blender --version` を実行して確認してください。

### 2. Node.js

Node.js 18 以上が必要です。

```bash
node --version
```

## セットアップ

1. **依存関係のインストール:**

```bash
cd 3d-generator
npm install
```

2. **環境変数の設定:**

Gemini API を使用するため、API キーが必要です。

`.env` ファイルを作成：

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

API キーは [Google AI Studio](https://aistudio.google.com/apikey) から取得できます。

## 使い方

### 1. サーバーの起動

```bash
npm start
```

サーバーは http://localhost:3000 で起動します。

### 2. ブラウザでアクセス

ブラウザで http://localhost:3000 を開きます。

### 3. モデルの生成

1. 左側のテキストエリアにプロンプトを入力（例: "兎"、"ロボット"、"家"）
2. "Generate Model" ボタンをクリック
3. AI が Blender スクリプトを生成し、Blender が実行されます
4. 生成されたモデルが右側の 3D ビューアに表示されます

### 4. サンプルスクリプトでテスト

Gemini API を使わずに、サンプルスクリプトで動作確認できます：

```bash
# Blender でサンプルを実行
blender --background --python sample_rabbit.py -- test_model.glb

# 生成されたファイルを確認
ls -lh test_model.glb
```

## プロジェクト構成

```
3d-generator/
├── package.json          # Node.js 依存関係
├── server.js            # Express サーバー
├── public/
│   └── index.html       # フロントエンド
├── models/              # 生成されたモデルの保存先（自動作成）
├── sample_rabbit.py     # サンプル Blender スクリプト
└── README.md
```

## 制限事項

### 現在のプロトタイプの制限

1. **シンプルなモデルのみ**: プリミティブ（立方体、球、円柱）の組み合わせで作成されるため、複雑なモデルは生成できません

2. **AI の理解度**: Gemini は 3D モデリングに特化していないため、生成されるモデルは抽象的になる可能性があります

3. **エラーハンドリング**: Blender スクリプトがエラーになる場合があります

### 改善案

より高品質なモデルを生成するには：

1. **Text-to-3D AI の統合**
   - OpenAI の Shap-E や Point-E を使用
   - Stable Diffusion 3D などの専用モデル

2. **テンプレートベースの生成**
   - 事前に用意したテンプレートをパラメータで調整
   - より予測可能で安定した結果

3. **MCP サーバーの実装**
   - Blender を操作する専用 MCP ツール
   - より構造化されたモデル生成

## トラブルシューティング

### Blender が見つからない

```
Error: Blenderの実行に失敗: spawn blender ENOENT
```

解決方法:
- Blender がインストールされているか確認
- PATH に Blender が追加されているか確認
- Windows の場合、フルパスを指定: `C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe`

### ポート 3000 が使用中

```
Error: listen EADDRINUSE: address already in use :::3000
```

解決方法:
```bash
# プロセスを終了
lsof -ti:3000 | xargs kill -9

# または別のポートを使用（server.js の PORT を変更）
```

### Gemini API エラー

```
Gemini API error: 401
```

解決方法:
- `.env` ファイルに `GEMINI_API_KEY` が正しく設定されているか確認
- API キーが有効かどうか [Google AI Studio](https://aistudio.google.com/apikey) で確認

## ライセンス

MIT License

## 参考リンク

- [Blender Python API](https://docs.blender.org/api/current/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Gemini API](https://ai.google.dev/docs)
