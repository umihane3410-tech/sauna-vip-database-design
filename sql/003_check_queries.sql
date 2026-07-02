-- 個室サウナ向けVIP送客システム
-- 確認用SQL

.headers on
.mode box

-- 1. VIP顧客一覧を確認
SELECT
    c.customer_code,
    c.age_group,
    c.gender,
    r.recency_score,
    r.frequency_score,
    r.monetary_score,
    r.total_score,
    r.is_vip
FROM customers c
JOIN rfm_scores r
    ON c.customer_id = r.customer_id
WHERE r.is_vip = 1;

-- 2. シークレット招待された顧客を確認
SELECT
    c.customer_code,
    si.invitation_code,
    si.sent_at,
    si.status
FROM secret_invitations si
JOIN customers c
    ON si.customer_id = c.customer_id;

-- 3. 予約と決済を確認
SELECT
    c.customer_code,
    rs.slot_date,
    rs.start_time,
    rs.end_time,
    rv.status AS reservation_status,
    p.amount,
    p.payment_status
FROM reservations rv
JOIN customers c
    ON rv.customer_id = c.customer_id
JOIN reservation_slots rs
    ON rv.slot_id = rs.slot_id
JOIN payments p
    ON rv.reservation_id = p.reservation_id;

-- 4. 提携先への紹介手数料を確認
SELECT
    pa.partner_name,
    c.customer_code,
    i.amount AS incentive_amount,
    i.status AS incentive_status
FROM incentives i
JOIN partners pa
    ON i.partner_id = pa.partner_id
JOIN reservations rv
    ON i.reservation_id = rv.reservation_id
JOIN customers c
    ON rv.customer_id = c.customer_id;
