import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class App {
    public static void main(String[] args) {
        String dbUrl = "jdbc:sqlite:db/sauna.db";

        try (Connection conn = DriverManager.getConnection(dbUrl);
             Statement stmt = conn.createStatement()) {

            System.out.println("SQLiteに接続成功");

            System.out.println("\n=== VIP顧客一覧 ===");

            String vipSql = """
                SELECT
                    c.customer_code,
                    c.age_group,
                    c.gender,
                    r.recency_score,
                    r.frequency_score,
                    r.monetary_score,
                    r.total_score
                FROM customers c
                JOIN rfm_scores r
                    ON c.customer_id = r.customer_id
                WHERE r.is_vip = 1;
            """;

            ResultSet vipResult = stmt.executeQuery(vipSql);

            while (vipResult.next()) {
                System.out.println(
                    vipResult.getString("customer_code")
                    + " / 年代: " + vipResult.getString("age_group")
                    + " / 性別: " + vipResult.getString("gender")
                    + " / 合計スコア: " + vipResult.getInt("total_score")
                );
            }

            System.out.println("\n=== 予約・決済情報 ===");

            String reservationSql = """
                SELECT
                    c.customer_code,
                    rs.slot_date,
                    rs.start_time,
                    rs.end_time,
                    p.amount,
                    p.payment_status
                FROM reservations rv
                JOIN customers c
                    ON rv.customer_id = c.customer_id
                JOIN reservation_slots rs
                    ON rv.slot_id = rs.slot_id
                JOIN payments p
                    ON rv.reservation_id = p.reservation_id;
            """;

            ResultSet reservationResult = stmt.executeQuery(reservationSql);

            while (reservationResult.next()) {
                System.out.println(
                    reservationResult.getString("customer_code")
                    + " / 日付: " + reservationResult.getString("slot_date")
                    + " / 時間: " + reservationResult.getString("start_time")
                    + "〜" + reservationResult.getString("end_time")
                    + " / 金額: " + reservationResult.getInt("amount")
                    + "円 / 状態: " + reservationResult.getString("payment_status")
                );
            }

            System.out.println("\n=== 紹介手数料 ===");

            String incentiveSql = """
                SELECT
                    pa.partner_name,
                    c.customer_code,
                    i.amount AS incentive_amount,
                    i.status
                FROM incentives i
                JOIN partners pa
                    ON i.partner_id = pa.partner_id
                JOIN reservations rv
                    ON i.reservation_id = rv.reservation_id
                JOIN customers c
                    ON rv.customer_id = c.customer_id;
            """;

            ResultSet incentiveResult = stmt.executeQuery(incentiveSql);

            while (incentiveResult.next()) {
                System.out.println(
                    incentiveResult.getString("partner_name")
                    + " / 顧客: " + incentiveResult.getString("customer_code")
                    + " / 紹介手数料: " + incentiveResult.getInt("incentive_amount")
                    + "円 / 状態: " + incentiveResult.getString("status")
                );
            }

        } catch (Exception e) {
            System.out.println("エラーが発生しました");
            e.printStackTrace();
        }
    }
}
