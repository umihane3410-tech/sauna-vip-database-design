# PRIVATE SAUNA KONOSU VIP 予約デモ

提携先企業の顧客データから VIP 候補を抽出し、会員限定のシークレットサウナ枠を予約できるデモシステムです。VIP 判定は、提携先ごとに RFM（直近利用・利用頻度・決済額）を順位化し、合計順位スコア上位 5% を招待対象とする方式です。フロントエンド、Java API サーバー、SQLite データベースを同じリポジトリ内で動かします。

## 主な機能

- 会員、管理者、提携先のデモログイン
- 提携先顧客データの表示と、提携先内 RFM 順位上位 5% による VIP 判定
- VIP 招待、シークレット予約枠、予約、決済、紹介料の保存
- 管理者向けの予約枠・お知らせ登録
- SQLite への永続化

## ディレクトリ

| パス | 内容 |
|---|---|
| `site/` | HTML/CSS/JS のフロントエンド |
| `src/ServerApp.java` | 静的配信と API を持つ Java サーバー |
| `src/App.java` | DB 確認用の簡易 CLI |
| `sql/001_create_tables.sql` | 最小構成の SQLite スキーマ |
| `sql/002_sample_data.sql` | デモデータ |
| `sql/003_check_queries.sql` | DB 確認用クエリ |
| `docs/` | 要件、テーブル設計、ER 図 |
| `lib/sqlite-jdbc-3.53.2.0.jar` | SQLite JDBC ドライバ |

## 起動方法

```powershell
javac -encoding UTF-8 -cp "lib\sqlite-jdbc-3.53.2.0.jar" -d out src\ServerApp.java src\App.java
java -cp "out;lib\sqlite-jdbc-3.53.2.0.jar" ServerApp 8081
```

起動後にブラウザで開きます。

```text
http://localhost:8081/
```

ポート番号を省略した場合は `8080` で起動します。

## VS Code で開く方法

このフォルダを VS Code で開くと、`.vscode` のタスクが使えます。

1. `Terminal > Run Task... > Build Java` でコンパイル
2. `Terminal > Run Task... > Run Server 8081` でサーバー起動
3. `Terminal > Run Task... > Open Browser` で `http://localhost:8081/` を開く
4. `Terminal > Run Task... > Check DB` で最小4テーブルの中身を確認

Java Extension Pack を入れている場合は、`Run and Debug` から `Run ServerApp 8081` も使えます。

## デモアカウント

| 種別 | ログイン ID | パスワード | 用途 |
|---|---|---|---|
| 一般会員 | `demo1` | `demo1234` | VIP 未招待の会員 |
| VIP 会員 | `demo2` | `demo1234` | シークレット予約可能な会員 |
| 管理者 | `admin1` | `123456789` | 予約枠、VIP 抽出、お知らせ管理 |
| 提携先 | `demo3` | `demo1234` | 提携先顧客と紹介料確認 |

## API

| メソッド | パス | 内容 |
|---|---|---|
| `GET` | `/api/health` | サーバー稼働確認 |
| `GET` | `/api/bootstrap` | 画面初期表示用データを取得 |
| `POST` | `/api/customers` | 顧客登録 |
| `POST` | `/api/reservations` | 予約、決済状態、紹介料を登録 |
| `POST` | `/api/slots` | シークレット予約枠を登録 |
| `POST` | `/api/invitations` | VIP 招待状態を登録 |
| `POST` | `/api/notices` | お知らせを登録 |

## DB テーブル

実テーブルは次の 4 つに最小化しています。

| テーブル | 役割 |
|---|---|
| `customers` | 会員、提携先情報、VIP 判定、招待状態 |
| `reservation_slots` | 店舗、部屋、日時、プラン、料金、公開状態 |
| `reservations` | 予約、決済状態、紹介料 |
| `notices` | お知らせ |

旧スキーマの DB が残っている場合、サーバー初回起動時に旧テーブルを検知して `db/sauna.db` を最小テーブル構成で作り直します。最小構成になった後は、再起動のたびに DB を削除することはありません。
