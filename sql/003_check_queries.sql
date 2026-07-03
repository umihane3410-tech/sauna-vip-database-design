.headers on
.mode box

SELECT
    external_customer_id,
    display_name,
    partner_name,
    vip_rank,
    is_vip,
    invitation_status
FROM customers
ORDER BY is_vip DESC, vip_rank, customer_id;

SELECT * FROM reservation_summary ORDER BY reservation_id DESC;

SELECT
    partner_name,
    COUNT(reservation_id) AS reservation_count,
    SUM(referral_fee) AS referral_fee_total,
    referral_status
FROM reservations
WHERE status <> 'canceled'
GROUP BY partner_name, referral_status;

SELECT
    slot_date,
    COUNT(reservation_id) AS reservation_count,
    SUM(CASE WHEN status <> 'canceled' THEN price ELSE 0 END) AS sales_total
FROM reservations
GROUP BY slot_date
ORDER BY slot_date;
