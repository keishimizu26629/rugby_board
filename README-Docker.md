# Rugby Board Docker 環境

## 🚀 環境構成

統合された `compose.yml` で以下の環境をサポート：

- **Development**: 開発環境（ホットリロード対応）
- **Production**: 本番環境（Nginx + 最適化ビルド）
- **Test**: テスト環境（Jest ユニットテスト）
- **Integration**: 統合テスト環境（Firebase Emulator 含む）

## 📋 使用方法

### VS Code Tasks（推奨）

1. `Ctrl/Cmd + Shift + P` を押す
2. `Tasks: Run Task` を選択
3. 以下のタスクから選択：
   - 🚀 Rugby Board - Development
   - 🧪 Rugby Board - Test
   - 🏭 Rugby Board - Production
   - 🧪 Rugby Board - Integration Test

### コマンドライン

```bash
# 開発環境
npm run docker:dev
# または
docker compose down && docker compose --profile dev up --build

# テスト環境
npm run docker:test
# または
docker compose down && docker compose --profile test up --build

# 本番環境
npm run docker:prod
# または
docker compose down && docker compose --profile prod up --build

# 統合テスト環境
npm run docker:integration
# または
docker compose down && docker compose --profile integration up --build
```

### 個別操作

```bash
# コンテナ停止・削除
docker compose down

# ログ確認
docker compose logs -f

# テストのみ実行（ビルドなし）
docker compose --profile test up rugby-board-test
```

## 🌐 アクセス URL

| 環境                 | URL                   | 説明                    |
| -------------------- | --------------------- | ----------------------- |
| Development          | http://localhost:5527 | 開発サーバー            |
| Production           | http://localhost:80   | 本番サーバー            |
| Firebase Emulator UI | http://localhost:4000 | Firebase エミュレーター |

## 🔧 VS Code 統合

### Launch Configurations

- F5 キーで以下の設定から選択可能：
  - 🚀 Rugby Board - Development
  - 🧪 Rugby Board - Test
  - 🏭 Rugby Board - Production

### Tasks

- `Ctrl/Cmd + Shift + P` → `Tasks: Run Task` で実行
- 自動的に `docker compose down` してからクリーンな状態で起動

## 📊 テスト環境

### ユニットテスト

```bash
# フルテストスイート実行
npm run docker:test

# テストのみ（ビルドスキップ）
npm run docker:test:unit
```

### 統合テスト

```bash
# Firebase Emulator 含む統合テスト
npm run docker:integration
```

## 🐳 Docker Profiles

| Profile       | Services                             | 用途           |
| ------------- | ------------------------------------ | -------------- |
| `dev`         | rugby-board-dev                      | 開発環境       |
| `prod`        | rugby-board-prod                     | 本番環境       |
| `test`        | rugby-board-test                     | ユニットテスト |
| `integration` | rugby-board-test + firebase-emulator | 統合テスト     |

## 🔄 自動クリーンアップ

すべてのタスクとスクリプトは実行前に `docker compose down` を実行し、クリーンな状態から開始します。

## 📦 ボリューム管理

- `dev_node_modules`: 開発環境用 node_modules
- `test_node_modules`: テスト環境用 node_modules
- `coverage`: テストカバレッジ出力

## 🚦 トラブルシューティング

### ポート競合

```bash
# 使用中のポートを確認
lsof -i :5527
lsof -i :80

# 強制的にコンテナを停止
docker compose down --remove-orphans
```

### キャッシュクリア

```bash
# ビルドキャッシュクリア
docker compose build --no-cache

# イメージとボリューム削除
docker compose down --volumes --rmi all
```

## プロジェクト構成

```
rugby_board/
├── Dockerfile                 # マルチステージビルド設定
├── docker-compose.yml         # 基本設定
├── docker-compose.dev.yml     # 開発環境設定
├── docker-compose.prod.yml    # 本番環境設定
├── .dockerignore              # Docker除外ファイル
└── docker/
    └── nginx/
        └── nginx.conf         # 本番環境用Nginx設定
```
