PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_customer_id TEXT UNIQUE,
    customer_code TEXT UNIQUE,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    age_group TEXT,
    gender TEXT,
    partner_code TEXT,
    partner_name TEXT NOT NULL DEFAULT '未設定',
    referral_code TEXT,
    partner_target TEXT,
    partner_criterion TEXT,
    segment TEXT,
    recent_days INTEGER NOT NULL DEFAULT 999,
    frequency INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL DEFAULT 0,
    amount_label TEXT NOT NULL DEFAULT '決済額',
    weekday_idle_rate INTEGER NOT NULL DEFAULT 0,
    continuous_months INTEGER NOT NULL DEFAULT 0,
    vip_rank TEXT NOT NULL DEFAULT 'C',
    is_vip INTEGER NOT NULL DEFAULT 0 CHECK (is_vip IN (0, 1)),
    invitation_code TEXT UNIQUE,
    invitation_status TEXT NOT NULL DEFAULT 'none'
        CHECK (invitation_status IN ('none', 'sent', 'used', 'expired', 'canceled')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservation_slots (
    slot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_slot_id TEXT UNIQUE,
    store_name TEXT NOT NULL,
    room_name TEXT NOT NULL,
    slot_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    slot_time_display TEXT,
    plan TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reserved', 'closed')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
    reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_reservation_id TEXT UNIQUE,
    customer_id INTEGER,
    slot_id INTEGER,
    customer_name TEXT,
    customer_email TEXT,
    partner_name TEXT,
    store_name TEXT,
    room_name TEXT,
    slot_date TEXT,
    slot_time TEXT,
    plan TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'paid'
        CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    referral_fee INTEGER NOT NULL DEFAULT 0,
    referral_status TEXT NOT NULL DEFAULT 'unpaid'
        CHECK (referral_status IN ('none', 'unpaid', 'approved', 'paid')),
    reserved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'visited', 'canceled')),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (slot_id) REFERENCES reservation_slots(slot_id)
);

CREATE TABLE IF NOT EXISTS notices (
    notice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_notice_id TEXT UNIQUE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notice_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_partner_name ON customers(partner_name);
CREATE INDEX IF NOT EXISTS idx_slots_date ON reservation_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_slot_id ON reservations(slot_id);
CREATE INDEX IF NOT EXISTS idx_notices_date ON notices(notice_date);

DROP VIEW IF EXISTS vip_candidates;
DROP VIEW IF EXISTS reservation_summary;

CREATE VIEW IF NOT EXISTS vip_candidates AS
SELECT
    partner_name,
    referral_code,
    external_customer_id,
    display_name AS customer_name,
    segment,
    recent_days,
    frequency AS monthly_frequency,
    total_amount,
    vip_rank AS rank,
    is_vip
FROM customers
WHERE external_customer_id IS NOT NULL;

CREATE VIEW IF NOT EXISTS reservation_summary AS
SELECT
    rv.reservation_id,
    rv.external_reservation_id,
    COALESCE(c.customer_code, 'customer_' || rv.customer_id) AS customer_code,
    COALESCE(rv.customer_name, c.display_name) AS user_name,
    COALESCE(rv.customer_email, c.email) AS user_email,
    COALESCE(rv.partner_name, c.partner_name) AS partner_name,
    COALESCE(rv.store_name, rs.store_name) AS store_name,
    COALESCE(rv.room_name, rs.room_name) AS room_name,
    COALESCE(rv.slot_date, rs.slot_date) AS slot_date,
    COALESCE(rv.slot_time, rs.slot_time_display, rs.start_time || '-' || rs.end_time) AS slot_time,
    COALESCE(rv.plan, rs.plan) AS plan,
    COALESCE(NULLIF(rv.price, 0), rs.price) AS price,
    rv.status,
    rv.payment_status,
    rv.referral_fee,
    rv.reserved_at
FROM reservations rv
LEFT JOIN customers c ON c.customer_id = rv.customer_id
LEFT JOIN reservation_slots rs ON rs.slot_id = rv.slot_id;
