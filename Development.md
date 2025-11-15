# TODOアプリ開発ドキュメント

## プロジェクト概要

### 技術スタック
- **フロントエンド**: Vue.js 3 (CDN)
- **バックエンド**: PHP (api.php)
- **Webサーバー**: nginx + PHP-FPM
- **データ保存**: JSON ファイル
- **バージョン管理**: Git + GitHub

### 実装機能
1. TODO追加・削除・編集
2. 完了/未完了の切り替え
3. 優先度設定（高/中/低）
4. 期限日設定（月/日形式）
5. 並び替え（優先順/期限順）
6. ダークテーマデザイン
7. レスポンシブ対応（スマホ対応）

### ファイル構成
```
/home/tsunepod/projects/todo-spa/
├── public/
│   ├── index.html    # フロントエンド
│   ├── app.js        # Vue.jsロジック
│   ├── api.php       # バックエンドAPI
│   └── todos.json    # データ保存
├── .gitignore
├── Development.md
└── README.md
```

### デプロイ先
- **GitHub**: https://github.com/tsunepod/todo-spa
- **本番URL**: https://todo-spa.bad-bbs.com
- **VPS**: /var/www/todo-spa/todo-spa/

---

## 開発環境セットアップ

### ローカル開発
```bash
cd ~/projects/todo-spa
```

ローカルでテストする場合は、PHPビルトインサーバーを使用：
```bash
cd public
php -S localhost:8000
```

ブラウザで `http://localhost:8000` にアクセス

---

## メンテナンス手順

### 1. ローカルで変更を加える

```bash
cd ~/projects/todo-spa

# ファイルを編集
code public/index.html
code public/app.js
code public/api.php
```

### 2. 変更をGitにコミット

```bash
# 変更を確認
git status

# 変更をステージング
git add .

# コミット
git commit -m "変更内容の説明"

# GitHubにプッシュ
git push origin main
```

### 3. VPSに反映

```bash
# VPSにSSH接続
ssh ユーザー名@210.131.212.51

# プロジェクトディレクトリに移動
cd /var/www/todo-spa/todo-spa

# 最新版を取得
git pull origin main

# パーミッション確認
sudo chown -R www-data:www-data public
sudo chmod -R 755 public

# ブラウザで確認
# https://todo-spa.bad-bbs.com
```

### 4. データバックアップ

```bash
# VPS上で実行
cd /var/www/todo-spa/todo-spa/public

# バックアップ作成
cp todos.json todos.json.backup.$(date +%Y%m%d)

# 定期バックアップ設定（cron）
crontab -e
# 以下を追加（毎日午前3時にバックアップ）
0 3 * * * cp /var/www/todo-spa/todo-spa/public/todos.json /var/www/todo-spa/todo-spa/public/todos.json.backup.$(date +\%Y\%m\%d)
```

---

## トラブルシューティング

### ログ確認

```bash
# nginxエラーログ確認
sudo tail -f /var/log/nginx/error.log

# PHP-FPMエラーログ確認
sudo tail -f /var/log/php8.3-fpm.log

# nginxアクセスログ確認
sudo tail -f /var/log/nginx/access.log
```

### サービス再起動

```bash
# nginx再起動
sudo systemctl restart nginx

# PHP-FPM再起動
sudo systemctl restart php8.3-fpm

# nginx設定テスト
sudo nginx -t

# nginx設定リロード
sudo systemctl reload nginx
```

### よくある問題

#### 1. 404 Not Found
- nginx設定のrootパスを確認
- ファイルのパーミッションを確認

```bash
ls -la /var/www/todo-spa/todo-spa/public/
sudo chown -R www-data:www-data /var/www/todo-spa/todo-spa/public
```

#### 2. 502 Bad Gateway
- PHP-FPMが起動しているか確認

```bash
sudo systemctl status php8.3-fpm
sudo systemctl start php8.3-fpm
```

#### 3. データが保存されない
- todos.jsonのパーミッション確認

```bash
sudo chmod 666 /var/www/todo-spa/todo-spa/public/todos.json
```

---

## SSL証明書管理

### 証明書の自動更新
Let's Encryptの証明書は自動更新されます。

### 手動更新

```bash
# 証明書更新
sudo certbot renew

# 更新テスト（実際には更新しない）
sudo certbot renew --dry-run

# 特定のドメインのみ更新
sudo certbot renew --cert-name todo-spa.bad-bbs.com
```

### 証明書の確認

```bash
# 証明書の有効期限確認
sudo certbot certificates
```

---

## nginx設定

### 設定ファイルの場所
```
/etc/nginx/sites-available/todo-spa.bad-bbs.com
```

### 設定内容
```nginx
server {
    listen 80;
    server_name todo-spa.bad-bbs.com;
    root /var/www/todo-spa/todo-spa/public;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 設定変更後

```bash
# 設定テスト
sudo nginx -t

# 設定リロード
sudo systemctl reload nginx
```

---

## 機能追加の流れ

1. **ローカルで開発**
   - コードを編集
   - ローカルサーバーでテスト

2. **Gitにコミット**
   ```bash
   git add .
   git commit -m "新機能: 説明"
   git push origin main
   ```

3. **VPSに反映**
   ```bash
   ssh ユーザー名@210.131.212.51
   cd /var/www/todo-spa/todo-spa
   git pull origin main
   ```

4. **動作確認**
   - ブラウザで https://todo-spa.bad-bbs.com にアクセス
   - 機能が正常に動作するか確認

---

## よく使うコマンド集

### ローカル開発
```bash
cd ~/projects/todo-spa
git status
git add .
git commit -m "メッセージ"
git push
```

### VPS更新
```bash
ssh ユーザー名@210.131.212.51
cd /var/www/todo-spa/todo-spa
git pull
sudo systemctl reload nginx
```

### ログ確認
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/php8.3-fpm.log
```

### サービス管理
```bash
sudo systemctl status nginx
sudo systemctl restart nginx
sudo systemctl status php8.3-fpm
sudo systemctl restart php8.3-fpm
```

---

## データ構造

### todos.json
```json
{
  "1": {
    "id": 1,
    "title": "TODOタイトル",
    "completed": false,
    "priority": "high",
    "due_date": "12/25",
    "created_at": "2024-11-15 15:00:00"
  }
}
```

### API エンドポイント

#### GET /api.php
全てのTODOを取得

#### POST /api.php
新しいTODOを作成
```json
{
  "title": "TODOタイトル",
  "priority": "medium",
  "due_date": "12/25"
}
```

#### PUT /api.php?id=1
TODOを更新
```json
{
  "title": "更新後のタイトル",
  "completed": true,
  "priority": "low",
  "due_date": "12/31"
}
```

#### DELETE /api.php?id=1
TODOを削除

---

## セキュリティ

### 推奨事項
1. todos.jsonのバックアップを定期的に取る
2. .gitignoreでtodos.jsonを除外（機密情報がある場合）
3. SSL証明書の有効期限を監視
4. nginxとPHPを最新版に保つ

### アップデート
```bash
# システムアップデート
sudo apt update
sudo apt upgrade

# nginx, PHP-FPMも含まれる
```

---

## 今後の拡張案

- [ ] ユーザー認証機能
- [ ] カテゴリ/タグ機能
- [ ] 検索機能
- [ ] データベース移行（MySQL/PostgreSQL）
- [ ] API認証（JWT）
- [ ] PWA対応
- [ ] 通知機能
- [ ] 共有機能

---

## 連絡先・リソース

- **GitHub**: https://github.com/tsunepod/todo-spa
- **本番URL**: https://todo-spa.bad-bbs.com
- **Vue.js ドキュメント**: https://vuejs.org/
- **nginx ドキュメント**: https://nginx.org/en/docs/
