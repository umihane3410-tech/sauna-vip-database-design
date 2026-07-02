# テーブル設計書

## 1. 概要

このファイルでは、個室サウナ向けVIP送客システムで使用するデータベースのテーブル構成をまとめる。

本システムでは、提携先企業から連携された顧客データをもとにRFM分析を行い、VIP顧客を抽出する。抽出されたVIP顧客に対してシークレット招待を送り、予約・決済・提携先への紹介手数料を管理する。

---

## 2. テーブル一覧

| テーブル名                 | 役割                   |
| --------------------- | -------------------- |
| partners              | 提携先企業を管理する           |
| customers             | 顧客情報を管理する            |
| partner_customer_data | 提携先から連携された顧客データを管理する |
| rfm_scores            | RFM分析によるスコアを管理する     |
| secret_invitations    | VIP顧客へのシークレット招待を管理する |
| sauna_rooms           | サウナの部屋情報を管理する        |
| reservation_slots     | 予約可能な時間枠を管理する        |
| reservations          | 実際の予約情報を管理する         |
| payments              | 決済情報を管理する            |
| incentives            | 提携先への紹介手数料を管理する      |

---

## 3. 各テーブルの詳細

### 3-1. partners

提携先企業を管理するテーブル。

| カラム名         | 内容     |
| ------------ | ------ |
| partner_id   | 提携先ID  |
| partner_name | 提携先企業名 |
| industry     | 業種     |
| created_at   | 登録日時   |

---

### 3-2. customers

顧客情報を管理するテーブル。
個人情報保護のため、実名や電話番号ではなく、匿名の顧客コードで管理する。

| カラム名          | 内容       |
| ------------- | -------- |
| customer_id   | 顧客ID     |
| customer_code | 匿名の顧客コード |
| age_group     | 年代       |
| gender        | 性別       |
| created_at    | 登録日時     |

---

### 3-3. partner_customer_data

提携先から連携された顧客データを管理するテーブル。
RFM分析に必要な最新利用日、利用頻度、利用金額を保持する。

| カラム名              | 内容      |
| ----------------- | ------- |
| data_id           | 連携データID |
| partner_id        | 提携先ID   |
| customer_id       | 顧客ID    |
| latest_use_date   | 最新利用日   |
| monthly_frequency | 月間利用回数  |
| total_amount      | 累計利用金額  |
| created_at        | 登録日時    |

---

### 3-4. rfm_scores

RFM分析の結果を管理するテーブル。

| カラム名            | 内容        |
| --------------- | --------- |
| score_id        | スコアID     |
| customer_id     | 顧客ID      |
| recency_score   | 最新利用日のスコア |
| frequency_score | 利用頻度のスコア  |
| monetary_score  | 利用金額のスコア  |
| total_score     | 合計スコア     |
| is_vip          | VIP判定     |
| scored_at       | スコア算出日時   |

---

### 3-5. secret_invitations

VIP顧客に送るシークレット招待を管理するテーブル。

| カラム名            | 内容     |
| --------------- | ------ |
| invitation_id   | 招待ID   |
| customer_id     | 顧客ID   |
| invitation_code | 招待コード  |
| sent_at         | 招待送信日時 |
| status          | 招待状態   |

---

### 3-6. sauna_rooms

サウナの部屋情報を管理するテーブル。

| カラム名      | 内容   |
| --------- | ---- |
| room_id   | 部屋ID |
| room_name | 部屋名  |
| capacity  | 定員   |
| status    | 利用状態 |

---

### 3-7. reservation_slots

予約可能な時間枠を管理するテーブル。

| カラム名           | 内容          |
| -------------- | ----------- |
| slot_id        | 予約枠ID       |
| room_id        | 部屋ID        |
| slot_date      | 予約日         |
| start_time     | 開始時間        |
| end_time       | 終了時間        |
| is_secret_slot | シークレット枠かどうか |
| status         | 予約枠の状態      |

---

### 3-8. reservations

実際の予約情報を管理するテーブル。

| カラム名           | 内容    |
| -------------- | ----- |
| reservation_id | 予約ID  |
| customer_id    | 顧客ID  |
| slot_id        | 予約枠ID |
| invitation_id  | 招待ID  |
| reserved_at    | 予約日時  |
| status         | 予約状態  |

---

### 3-9. payments

決済情報を管理するテーブル。

| カラム名           | 内容   |
| -------------- | ---- |
| payment_id     | 決済ID |
| reservation_id | 予約ID |
| amount         | 決済金額 |
| paid_at        | 決済日時 |
| payment_status | 決済状態 |

---

### 3-10. incentives

提携先への紹介手数料を管理するテーブル。

| カラム名           | 内容      |
| -------------- | ------- |
| incentive_id   | 紹介手数料ID |
| partner_id     | 提携先ID   |
| reservation_id | 予約ID    |
| amount         | 紹介手数料金額 |
| status         | 支払い状態   |
| created_at     | 作成日時    |

---

## 4. 設計上の注意点

* 実在する個人情報は登録しない
* 顧客は匿名コードで管理する
* RFM分析の結果をもとにVIP判定を行う
* シークレット招待を受けた顧客のみが専用予約を行える
* 予約・決済が完了した場合、提携先への紹介手数料を管理する
