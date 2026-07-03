import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class App {
    public static void main(String[] args) {
        String dbUrl = "jdbc:sqlite:db/sauna.db";

        try (Connection conn = DriverManager.getConnection(dbUrl);
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected to SQLite.");

            System.out.println("\n=== Minimal DB tables ===");
            ResultSet tableResult = stmt.executeQuery("""
                SELECT name
                FROM sqlite_master
                WHERE type = 'table'
                  AND name NOT LIKE 'sqlite_%'
                ORDER BY name
                """);
            while (tableResult.next()) {
                System.out.println("- " + tableResult.getString("name"));
            }

            System.out.println("\n=== VIP candidates ===");
            ResultSet vipResult = stmt.executeQuery("""
                SELECT external_customer_id, customer_name, partner_name, rank, is_vip
                FROM vip_candidates
                ORDER BY is_vip DESC, rank, external_customer_id
                """);
            while (vipResult.next()) {
                System.out.println(
                    vipResult.getString("external_customer_id")
                    + " / " + vipResult.getString("customer_name")
                    + " / " + vipResult.getString("partner_name")
                    + " / rank " + vipResult.getString("rank")
                    + " / vip " + vipResult.getInt("is_vip")
                );
            }

            System.out.println("\n=== Reservations ===");
            ResultSet reservationResult = stmt.executeQuery("""
                SELECT customer_code, user_name, slot_date, slot_time, price, payment_status, referral_fee
                FROM reservation_summary
                ORDER BY reservation_id DESC
                """);
            while (reservationResult.next()) {
                System.out.println(
                    reservationResult.getString("customer_code")
                    + " / " + reservationResult.getString("user_name")
                    + " / " + reservationResult.getString("slot_date")
                    + " " + reservationResult.getString("slot_time")
                    + " / " + reservationResult.getInt("price")
                    + " yen / payment " + reservationResult.getString("payment_status")
                    + " / referral " + reservationResult.getInt("referral_fee")
                );
            }
        } catch (Exception e) {
            System.out.println("Error while checking the database.");
            e.printStackTrace();
        }
    }
}
