-- 個室サウナ向けVIP送客システム
-- サンプルデータ挿入SQL
-- 注意：すべて架空データ

PRAGMA foreign_keys = ON;

-- 提携先企業
INSERT INTO partners (partner_name, industry) VALUES
('サンプル矯正歯科', '歯科'),
('サンプル高級ハイヤー', '交通'),
('サンプル高級ジム', 'ジム');

-- 顧客
INSERT INTO customers (customer_code, age_group, gender) VALUES
('customer_001', '30代', 'male'),
('customer_002', '40代', 'female'),
('customer_003', '50代', 'male');

-- 提携先から連携された顧客データ
INSERT INTO partner_customer_data (
    partner_id,
    customer_id,
    latest_use_date,
    monthly_frequency,
    total_amount
) VALUES
(1, 1, '2026-06-01', 4, 1200000),
(2, 2, '2026-06-10', 15, 180000),
(3, 3, '2026-06-15', 8, 150000);

-- RFMスコア
INSERT INTO rfm_scores (
    customer_id,
    recency_score,
    frequency_score,
    monetary_score,
    total_score,
    is_vip
) VALUES
(1, 5, 4, 5, 14, 1),
(2, 5, 5, 4, 14, 1),
(3, 4, 4, 4, 12, 1);

-- シークレット招待
INSERT INTO secret_invitations (
    customer_id,
    invitation_code,
    status
) VALUES
(1, 'VIP-INVITE-001', 'sent'),
(2, 'VIP-INVITE-002', 'sent'),
(3, 'VIP-INVITE-003', 'sent');

-- サウナ部屋
INSERT INTO sauna_rooms (room_name, capacity, status) VALUES
('Room A', 1, 'available'),
('Room B', 1, 'available');

-- 予約枠
INSERT INTO reservation_slots (
    room_id,
    slot_date,
    start_time,
    end_time,
    is_secret_slot,
    status
) VALUES
(1, '2026-06-30', '10:00', '11:30', 1, 'open'),
(2, '2026-06-30', '12:00', '13:30', 1, 'open');

-- 予約
INSERT INTO reservations (
    customer_id,
    slot_id,
    invitation_id,
    status
) VALUES
(1, 1, 1, 'reserved');

-- 決済
INSERT INTO payments (
    reservation_id,
    amount,
    payment_status
) VALUES
(1, 8000, 'paid');

-- 提携先への紹介手数料
INSERT INTO incentives (
    partner_id,
    reservation_id,
    amount,
    status
) VALUES
(1, 1, 800, 'unpaid');
