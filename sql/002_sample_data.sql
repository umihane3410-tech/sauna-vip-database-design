PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO customers
    (external_customer_id, customer_code, display_name, email, age_group, gender,
     partner_code, partner_name, referral_code, partner_target, partner_criterion,
     segment, recent_days, frequency, total_amount, amount_label, weekday_idle_rate,
     continuous_months, vip_rank, is_vip, invitation_code, invitation_status)
VALUES
    ('c1', 'customer_001', '山田 太郎', 'demo2@example.com', '40代', 'male',
     'p2', '国際自動車株式会社', 'KM-VIP-002',
     '大企業役員、オーナー経営者、投資家',
     '提携先内でRFMを順位化し、合計順位スコア上位5%をVIP抽出',
     'オーナー経営者', 3, 12, 150000, '月間決済額', 45, 0, 'S', 1,
     'VIP-INVITE-001', 'sent'),
    ('c2', 'customer_002', '佐藤 花子', 'hanako@example.com', '30代', 'female',
     'p3', '高級パーソナルジム', 'GYM-VIP-003',
     '経営者、医師、美容・健康感度の高い富裕層',
     '提携先内でRFMを順位化し、合計順位スコア上位5%をVIP抽出',
     '医師', 5, 10, 120000, '月額決済額', 62, 0, 'S', 1,
     'VIP-INVITE-002', 'sent'),
    ('c3', 'customer_003', '鈴木 一郎', 'ichiro@example.com', '30代', 'male',
     'p1', 'スマイルイノベーション矯正歯科', 'SMILE-VIP-001',
     '格闘家、ボディビルダー',
     '提携先内でRFMを順位化し、合計順位スコア上位5%をVIP抽出',
     'ボディビルダー', 40, 1, 1100000, '自由診療累計額', 30, 8, 'S', 1,
     'VIP-INVITE-003', 'sent'),
    ('c4', 'customer_004', '田中 美咲', NULL, '40代', 'female',
     'p2', '国際自動車株式会社', 'KM-VIP-002',
     '大企業役員、オーナー経営者、投資家',
     '提携先内でRFMを順位化し、合計順位スコア上位5%をVIP抽出',
     '投資家', 20, 3, 30000, '月間決済額', 20, 0, 'C', 0,
     NULL, 'none'),
    ('c5', 'customer_005', '高橋 蓮', NULL, '30代', 'other',
     'p3', '高級パーソナルジム', 'GYM-VIP-003',
     '経営者、医師、美容・健康感度の高い富裕層',
     '提携先内でRFMを順位化し、合計順位スコア上位5%をVIP抽出',
     '美容経営者', 4, 8, 95000, '月額決済額', 72, 0, 'C', 0,
     NULL, 'none');

UPDATE customers
SET partner_criterion = '提携先内でRFMを順位化し、合計順位スコア上位5%をVIP抽出'
WHERE partner_name IN ('スマイルイノベーション矯正歯科', '国際自動車株式会社', '高級パーソナルジム');

UPDATE customers
SET vip_rank = 'C', is_vip = 0
WHERE external_customer_id = 'c5';

INSERT OR IGNORE INTO reservation_slots
    (external_slot_id, store_name, room_name, slot_date, start_time, end_time,
     slot_time_display, plan, price, published, status)
VALUES
    ('s1', '津田沼店', 'Room A', '2026-06-15', '06:20', '07:50',
     '平日 6:20', '90分 Secret Sauna', 9800, 1, 'open'),
    ('s2', '津田沼店', 'Room B', '2026-06-16', '08:00', '09:40',
     '平日 8:00', '100分 Morning Luxe', 10800, 1, 'open'),
    ('s3', '新宿店', 'Room A', '2026-06-17', '10:00', '12:00',
     '平日 10:00', '120分 Executive', 12800, 1, 'open'),
    ('s4', '銀座店', 'Room C', '2026-06-18', '13:00', '15:00',
     '平日 13:00', '120分 Platinum', 15800, 0, 'open');

INSERT OR IGNORE INTO reservations
    (external_reservation_id, customer_id, slot_id, customer_name, customer_email,
     partner_name, store_name, room_name, slot_date, slot_time, plan, price,
     payment_status, referral_fee, referral_status, status)
SELECT
    'r1', c.customer_id, s.slot_id, c.display_name, c.email, c.partner_name,
    s.store_name, s.room_name, s.slot_date, s.slot_time_display, s.plan, s.price,
    'paid', 980, 'unpaid', 'visited'
FROM customers c
JOIN reservation_slots s ON s.external_slot_id = 's1'
WHERE c.external_customer_id = 'c1';

INSERT OR IGNORE INTO notices (external_notice_id, title, body, notice_date)
VALUES
    ('n1', 'シークレット枠のご案内',
     '平日6:20から15:10までのアイドルタイムを、提携先内RFM順位で上位5%に入った方だけに公開しました。',
     '2026-06-14');
