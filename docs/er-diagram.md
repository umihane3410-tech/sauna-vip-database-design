# ER図

## 概要

このER図は、個室サウナ向けVIP送客システムのデータベース構造を示す。

提携先企業から連携された顧客データをもとにRFM分析を行い、VIP顧客を抽出する。
その後、VIP顧客にシークレット招待を送り、予約・決済・紹介手数料の管理を行う。

```mermaid
erDiagram
    PARTNERS ||--o{ PARTNER_CUSTOMER_DATA : provides
    CUSTOMERS ||--o{ PARTNER_CUSTOMER_DATA : has
    CUSTOMERS ||--o{ RFM_SCORES : scored
    CUSTOMERS ||--o{ SECRET_INVITATIONS : receives
    SAUNA_ROOMS ||--o{ RESERVATION_SLOTS : has
    RESERVATION_SLOTS ||--o{ RESERVATIONS : used_for
    CUSTOMERS ||--o{ RESERVATIONS : makes
    SECRET_INVITATIONS ||--o{ RESERVATIONS : leads_to
    RESERVATIONS ||--o{ PAYMENTS : has
    PARTNERS ||--o{ INCENTIVES : receives
    RESERVATIONS ||--o{ INCENTIVES : generates

    PARTNERS {
        INTEGER partner_id PK
        TEXT partner_name
        TEXT industry
        TEXT created_at
    }

    CUSTOMERS {
        TEXT customer_id PK
        TEXT customer_code
        TEXT age_group
        TEXT gender
        TEXT created_at
    }

    PARTNER_CUSTOMER_DATA {
        INTEGER data_id PK
        INTEGER partner_id FK
        INTEGER customer_id FK
        TEXT latest_use_date
        INTEGER monthly_frequency
        INTEGER total_amount
        TEXT created_at
    }

    RFM_SCORES {
        INTEGER score_id PK
        INTEGER customer_id FK
        INTEGER recency_score
        INTEGER frequency_score
        INTEGER monetary_score
        INTEGER total_score
        INTEGER is_vip
        TEXT scored_at
    }

    SECRET_INVITATIONS {
        INTEGER invitation_id PK
        INTEGER customer_id FK
        TEXT invitation_code
        TEXT sent_at
        TEXT status
    }

    SAUNA_ROOMS {
        INTEGER room_id PK
        TEXT room_name
        INTEGER capacity
        TEXT status
    }

    RESERVATION_SLOTS {
        INTEGER slot_id PK
        INTEGER room_id FK
        TEXT slot_date
        TEXT start_time
        TEXT end_time
        INTEGER is_secret_slot
        TEXT status
    }

    RESERVATIONS {
        INTEGER reservation_id PK
        INTEGER customer_id FK
        INTEGER slot_id FK
        INTEGER invitation_id FK
        TEXT reserved_at
        TEXT status
    }

    PAYMENTS {
        INTEGER payment_id PK
        INTEGER reservation_id FK
        INTEGER amount
        TEXT paid_at
        TEXT payment_status
    }

    INCENTIVES {
        INTEGER incentive_id PK
        INTEGER partner_id FK
        INTEGER reservation_id FK
        INTEGER amount
        TEXT status
        TEXT created_at
    }
```

## 関係の説明

* partners と partner_customer_data は、提携先企業が顧客データを提供する関係である。
* customers と rfm_scores は、顧客ごとにRFMスコアを持つ関係である。
* customers と secret_invitations は、VIP顧客に招待を送る関係である。
* sauna_rooms と reservation_slots は、各サウナ部屋に予約枠が存在する関係である。
* reservation_slots と reservations は、予約枠に対して実際の予約が入る関係である。
* reservations と payments は、予約に対して決済が発生する関係である。
* reservations と incentives は、予約・利用実績に応じて紹介手数料が発生する関係である。
