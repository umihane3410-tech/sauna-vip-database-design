-- 個室サウナ向けVIP送客システム DB設計
-- テーブル作成SQL

PRAGMA foreign_keys = ON;

-- 提携先企業
CREATE TABLE partners (
    partner_id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 顧客
-- 実名ではなく、匿名の顧客コードで管理する
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_code TEXT NOT NULL UNIQUE,
    age_group TEXT,
    gender TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 提携先から連携された顧客データ
CREATE TABLE partner_customer_data (
    data_id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    latest_use_date TEXT,
    monthly_frequency INTEGER DEFAULT 0,
    total_amount INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(partner_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- RFMスコア
CREATE TABLE rfm_scores (
    score_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    recency_score INTEGER NOT NULL,
    frequency_score INTEGER NOT NULL,
    monetary_score INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    is_vip INTEGER NOT NULL DEFAULT 0,
    scored_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- シークレット招待
CREATE TABLE secret_invitations (
    invitation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    invitation_code TEXT NOT NULL UNIQUE,
    sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- サウナ部屋
CREATE TABLE sauna_rooms (
    room_id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    status TEXT DEFAULT 'available'
);

-- 予約枠
CREATE TABLE reservation_slots (
    slot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    slot_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_secret_slot INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'open',
    FOREIGN KEY (room_id) REFERENCES sauna_rooms(room_id)
);

-- 予約
CREATE TABLE reservations (
    reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    slot_id INTEGER NOT NULL,
    invitation_id INTEGER,
    reserved_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'reserved',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (slot_id) REFERENCES reservation_slots(slot_id),
    FOREIGN KEY (invitation_id) REFERENCES secret_invitations(invitation_id)
);

-- 決済
CREATE TABLE payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    paid_at TEXT DEFAULT CURRENT_TIMESTAMP,
    payment_status TEXT DEFAULT 'paid',
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id)
);

-- 提携先への紹介手数料
CREATE TABLE incentives (
    incentive_id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER NOT NULL,
    reservation_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'unpaid',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(partner_id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id)
);
