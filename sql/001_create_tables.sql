-- DBテーブル作成用SQL
-- 個室サウナ向けVIP送客システム

PRAGMA foreign_keys = ON;

-- 提携先企業
CREATE TABLE partners (
    partner_id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 顧客
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_code TEXT NOT NULL UNIQUE,
    age_group TEXT,
    gender TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
