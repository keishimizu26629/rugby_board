# Rugby Board Docker 環境

このプロジェクトは Docker を使用して開発・本番環境を構築できます。

## 前提条件

- Docker がインストールされていること
- Docker Compose がインストールされていること

## 開発環境での起動

### 方法 1: メインの docker-compose.yml を使用

```bash
docker compose up --build
```

### 方法 2: 開発専用の docker-compose.dev.yml を使用（推奨）

```bash
docker compose -f docker-compose.dev.yml up --build
```

開発サーバーが起動後、以下の URL でアクセスできます：

- http://localhost:5527

## 本番環境での起動

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

本番環境は以下の URL でアクセスできます：

- http://localhost

## 便利なコマンド

### コンテナのログを確認

```bash
# 開発環境
docker compose -f docker-compose.dev.yml logs -f

# 本番環境
docker compose -f docker-compose.prod.yml logs -f
```

### コンテナに入る

```bash
# 開発環境
docker compose -f docker-compose.dev.yml exec rugby-board-dev sh

# 本番環境
docker compose -f docker-compose.prod.yml exec rugby-board-prod sh
```

### コンテナを停止

```bash
# 開発環境
docker compose -f docker-compose.dev.yml down

# 本番環境
docker compose -f docker-compose.prod.yml down
```

### イメージとボリュームを完全削除

```bash
docker compose -f docker-compose.dev.yml down --rmi all --volumes
```

## 開発時の注意点

1. **ホットリロード**: 開発環境では、ファイルの変更が自動的に反映されます
2. **ポート**: 開発環境は 5527 番ポート、本番環境は 80 番ポートを使用します
3. **ボリュームマウント**: 開発環境では、ローカルのファイルがコンテナ内にマウントされます

## トラブルシューティング

### ポートが既に使用されている場合

```bash
# ポート使用状況確認
lsof -i :5527

# プロセス終了
kill -9 <PID>
```

### Docker キャッシュをクリア

```bash
docker system prune -a
```

### node_modules の問題

```bash
# コンテナを再ビルド
docker compose -f docker-compose.dev.yml up --build --force-recreate
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
