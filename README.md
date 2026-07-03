## ファイル一覧

| ファイル | 内容 |
|---|---|
| docs/requirements.md | 要件メモ |
| docs/table-design.md | テーブル設計書 |
| docs/er-diagram.md | ER図 |
| sql/001_create_tables.sql | テーブル作成SQL |
| sql/002_sample_data.sql | サンプルデータSQL |
| sql/003_check_queries.sql | 確認用SQL |
## Javaでの実行方法

このプロジェクトでは、SQLiteで作成したデータベースに対して、JavaのJDBCを用いて接続し、VIP顧客、予約・決済情報、紹介手数料情報を取得する。

### 1. Javaファイルをコンパイルする

```powershell
javac -encoding UTF-8 -d out src\App.java