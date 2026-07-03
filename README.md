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
## サイトフォームからデータベースへ登録する方法

このプロジェクトでは、HTMLフォームから入力された顧客データを、JavaのAPIサーバーを通じてSQLiteデータベースに登録できる。

### 1. Javaサーバーをコンパイルする

```powershell
javac -encoding UTF-8 -d out src\ServerApp.java
```

### 2. Javaサーバーを起動する

```powershell
java -cp "out;lib\sqlite-jdbc-3.53.2.0.jar" ServerApp
```

成功すると、以下のように表示される。

```text
Javaサーバー起動中: http://localhost:8080
```

このターミナルは閉じずに、そのまま開いておく。

### 3. 顧客登録フォームを開く

以下のファイルをブラウザで開く。

```text
site/customer-form.html
```

フォームに以下のようなデータを入力する。

```text
顧客コード：customer_004
年代：20代
性別：female
```

登録ボタンを押すと、Javaサーバーにデータが送信され、SQLiteのcustomersテーブルに保存される。

### 4. 登録されたか確認する

SQLiteを起動する。

```powershell
& "C:\Users\kawau\Downloads\sqlite\sqlite3.exe" db\sauna.db
```

以下のSQLを実行する。

```sql
.headers on
.mode box
SELECT * FROM customers;
```

登録した顧客コードが表示されれば成功である。

### 5. SQLiteを終了する

```sql
.quit
```

## サイト連携の仕組み

```text
customer-form.html
↓
fetchでJavaサーバーへ送信
↓
ServerApp.javaが受け取る
↓
SQLiteのcustomersテーブルへINSERT
```

## 注意点

* Javaサーバーを起動していないと、フォームからデータ登録はできない
* `db/sauna.db` はGitHubにアップロードしない
* `out/` や `.class` ファイルはGitHubにアップロードしない
* サンプルデータには実在する個人情報を使わない
