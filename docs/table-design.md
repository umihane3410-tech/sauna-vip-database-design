# テーブル設計

## 方針

デモで必要な保存対象だけに絞り、実テーブルを 4 つに最小化する。提携先、RFM、招待、部屋、決済、紹介料は個別テーブルに分けず、画面で必要な形に近いカラムとして統合する。VIP 判定は `customers` に保存された RFM 元データを使い、提携先ごとに R、F、M の順位を算出して合計順位スコア上位 5% を抽出する。

## 実テーブル

| テーブル | 保存する内容 |
|---|---|
| `customers` | 会員情報、提携先名、紹介コード、RFM元データ、VIP 判定、招待コード、提携先顧客データ |
| `reservation_slots` | 店舗名、部屋名、予約日、開始・終了時刻、表示時刻、プラン、価格、公開状態 |
| `reservations` | 予約者、予約枠、予約内容、決済状態、紹介料、予約ステータス |
| `notices` | お知らせタイトル、本文、表示日 |

## 統合した旧テーブル

| 旧テーブル | 統合先 |
|---|---|
| `partners` | `customers.partner_*` |
| `app_users` | フロントエンドのデモログイン定義 |
| `partner_customer_data` | `customers` |
| `rfm_scores` | `customers.vip_rank`, `customers.is_vip` |
| `secret_invitations` | `customers.invitation_*` |
| `sauna_rooms` | `reservation_slots.store_name`, `reservation_slots.room_name` |
| `payments` | `reservations.payment_status`, `reservations.price` |
| `incentives` | `reservations.referral_fee`, `reservations.referral_status` |

## 主な制約

- `customers.external_customer_id`、`customers.customer_code`、`customers.email` は一意
- `reservation_slots.external_slot_id` は一意
- `reservations.external_reservation_id` は一意
- `notices.external_notice_id` は一意
- 予約は `customers` と `reservation_slots` を参照する

## ビュー

| ビュー | 内容 |
|---|---|
| `vip_candidates` | VIP 候補一覧を画面・確認用に整形 |
| `reservation_summary` | 予約、顧客、予約枠を結合した表示用一覧 |
