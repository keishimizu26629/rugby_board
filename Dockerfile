# ベースイメージとしてNode.jsの最新LTSバージョンを使用
FROM node:16

# アプリケーションのワーキングディレクトリを設定
WORKDIR /app

# NPMのデフォルトレジストリを設定
RUN npm config set registry https://registry.npmjs.org

# Vue CLIとFirebase CLIをグローバルにインストール
RUN npm install -g @vue/cli firebase-tools

# アプリケーションがリッスンするポートを指定
EXPOSE 5527

# コンテナを起動時にシェルを開始
CMD ["sh"]
