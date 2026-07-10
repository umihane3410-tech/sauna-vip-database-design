import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ServerApp {
    private static final int DEFAULT_PORT = 8080;
    private static final Path DB_PATH = Path.of("db", "sauna.db");
    private static final String DB_URL = "jdbc:sqlite:db/sauna.db";
    private static final Path SITE_ROOT = Path.of("site").toAbsolutePath().normalize();

    private static final String DEFAULT_PARTNER = "\u672a\u8a2d\u5b9a";
    private static final String DEFAULT_STORE = "\u6d25\u7530\u6cbc\u5e97";
    private static final String DEFAULT_PLAN = "90\u5206 Secret Sauna";
    private static final String LABEL_RESERVED = "\u4e88\u7d04\u4e2d";
    private static final String LABEL_VISITED = "\u6765\u5e97\u6e08\u307f";
    private static final String LABEL_CANCELED = "\u30ad\u30e3\u30f3\u30bb\u30eb";

    public static void main(String[] args) throws Exception {
        int port = resolvePort(args);
        initializeDatabase();

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/health", ServerApp::handleHealth);
        server.createContext("/api/bootstrap", ServerApp::handleBootstrap);
        server.createContext("/api/customers", ServerApp::handleCreateCustomer);
        server.createContext("/customers", ServerApp::handleCreateCustomer);
        server.createContext("/api/reservations", ServerApp::handleCreateReservation);
        server.createContext("/reservations", ServerApp::handleCreateReservation);
        server.createContext("/api/slots", ServerApp::handleCreateSlot);
        server.createContext("/api/invitations", ServerApp::handleCreateInvitation);
        server.createContext("/api/notices", ServerApp::handleCreateNotice);
        server.createContext("/", ServerApp::handleStatic);
        server.setExecutor(Executors.newFixedThreadPool(8));
        server.start();

        System.out.println("Java server started: http://localhost:" + port);
        System.out.println("SQLite database: db/sauna.db");
    }

    private static int resolvePort(String[] args) {
        String value = args.length > 0 ? args[0] : System.getenv("PORT");
        if (isBlank(value)) return DEFAULT_PORT;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return DEFAULT_PORT;
        }
    }

    private static void initializeDatabase() throws Exception {
        Files.createDirectories(DB_PATH.getParent());
        if (needsDatabaseRebuild()) {
            Files.deleteIfExists(DB_PATH);
        }

        try (Connection conn = connect()) {
            executeSqlFile(conn, Path.of("sql", "001_create_tables.sql"));
            executeSqlFile(conn, Path.of("sql", "002_sample_data.sql"));
        }
    }

    private static boolean needsDatabaseRebuild() {
        if (!Files.exists(DB_PATH)) return false;

        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            String[] legacyTables = {
                "partners", "app_users", "partner_customer_data", "rfm_scores",
                "secret_invitations", "sauna_rooms", "payments", "incentives"
            };
            for (String table : legacyTables) {
                if (tableExists(conn, table)) return true;
            }

            if (tableExists(conn, "customers") && !tableHasColumn(conn, "customers", "partner_name")) return true;
            if (tableExists(conn, "reservation_slots") && !tableHasColumn(conn, "reservation_slots", "store_name")) return true;
            return tableExists(conn, "reservations") && !tableHasColumn(conn, "reservations", "payment_status");
        } catch (SQLException e) {
            return true;
        }
    }

    private static boolean tableExists(Connection conn, String tableName) throws SQLException {
        try (PreparedStatement pstmt = conn.prepareStatement(
                "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?")) {
            pstmt.setString(1, tableName);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        }
    }

    private static boolean tableHasColumn(Connection conn, String tableName, String columnName) throws SQLException {
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("PRAGMA table_info(" + tableName + ")")) {
            while (rs.next()) {
                if (columnName.equalsIgnoreCase(rs.getString("name"))) return true;
            }
            return false;
        }
    }

    private static Connection connect() throws SQLException {
        Connection conn = DriverManager.getConnection(DB_URL);
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("PRAGMA foreign_keys = ON");
        }
        return conn;
    }

    private static void executeSqlFile(Connection conn, Path path) throws Exception {
        if (!Files.exists(path)) return;

        StringBuilder cleaned = new StringBuilder();
        for (String line : Files.readAllLines(path, StandardCharsets.UTF_8)) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("--") || trimmed.startsWith(".")) continue;
            cleaned.append(line).append('\n');
        }

        for (String statement : cleaned.toString().split(";")) {
            String sql = statement.trim();
            if (!sql.isEmpty()) {
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute(sql);
                }
            }
        }
    }

    private static void handleHealth(HttpExchange exchange) throws IOException {
        if (handleOptions(exchange)) return;
        if (!requireMethod(exchange, "GET")) return;
        sendJson(exchange, 200, "{\"ok\":true}");
    }

    private static void handleBootstrap(HttpExchange exchange) throws IOException {
        if (handleOptions(exchange)) return;
        if (!requireMethod(exchange, "GET")) return;

        try (Connection conn = connect()) {
            String json = "{"
                + "\"partners\":" + queryArray(conn, """
                    SELECT COALESCE(MAX(partner_code), 'p' || MIN(customer_id)) AS id,
                           partner_name AS name,
                           COALESCE(MAX(referral_code), '') AS code,
                           COALESCE(MAX(partner_target), '') AS target,
                           COALESCE(MAX(partner_criterion), '') AS criterion
                    FROM customers
                    WHERE partner_name IS NOT NULL
                    GROUP BY partner_name
                    ORDER BY id
                    """, ServerApp::partnerJson)
                + ",\"customers\":" + queryArray(conn, """
                    SELECT COALESCE(external_customer_id, 'c' || customer_id) AS id,
                           COALESCE(customer_code, external_customer_id, 'c' || customer_id) AS member_no,
                           display_name AS name,
                           email,
                           partner_name AS partner,
                           segment,
                           recent_days,
                           frequency AS monthly_frequency,
                           total_amount,
                           amount_label,
                           weekday_idle_rate,
                           continuous_months,
                           invitation_status,
                           created_at
                    FROM customers
                    ORDER BY customer_id
                    """, ServerApp::partnerCustomerJson)
                + ",\"partnerCustomers\":" + queryArray(conn, """
                    SELECT COALESCE(external_customer_id, 'c' || customer_id) AS id,
                           COALESCE(customer_code, external_customer_id, 'c' || customer_id) AS member_no,
                           display_name AS name,
                           email,
                           partner_name AS partner,
                           segment,
                           recent_days,
                           frequency AS monthly_frequency,
                           total_amount,
                           amount_label,
                           weekday_idle_rate,
                           continuous_months,
                           invitation_status,
                           created_at
                    FROM customers
                    WHERE external_customer_id IS NOT NULL
                    ORDER BY customer_id
                    """, ServerApp::partnerCustomerJson)
                + ",\"slots\":" + queryArray(conn, """
                    SELECT COALESCE(external_slot_id, 'slot_' || slot_id) AS id,
                           store_name AS store,
                           room_name AS room,
                           slot_date AS date,
                           COALESCE(slot_time_display, start_time) AS time,
                           price,
                           plan,
                           published
                    FROM reservation_slots
                    ORDER BY slot_date, start_time
                    """, ServerApp::slotJson)
                + ",\"reservations\":" + queryArray(conn, """
                    SELECT COALESCE(external_reservation_id, 'r' || reservation_id) AS id,
                           user_name,
                           user_email,
                           partner_name,
                           store_name,
                           room_name,
                           slot_date,
                           slot_time,
                           plan,
                           price,
                           CASE status
                               WHEN 'visited' THEN ?
                               WHEN 'canceled' THEN ?
                               ELSE ?
                           END AS status_label,
                           reserved_at
                    FROM reservation_summary
                    ORDER BY reservation_id DESC
                    """, ServerApp::reservationJson, LABEL_VISITED, LABEL_CANCELED, LABEL_RESERVED)
                + ",\"notices\":" + queryArray(conn, """
                    SELECT COALESCE(external_notice_id, 'n' || notice_id) AS id,
                           title,
                           body,
                           notice_date AS date
                    FROM notices
                    ORDER BY notice_date DESC, notice_id DESC
                    """, ServerApp::noticeJson)
                + "}";

            sendJson(exchange, 200, json);
        } catch (Exception e) {
            sendError(exchange, e);
        }
    }

    private static void partnerJson(ResultSet rs, StringBuilder sb) throws SQLException {
        boolean first = true;
        first = pair(sb, "id", rs.getString("id"), first);
        first = pair(sb, "name", rs.getString("name"), first);
        first = pair(sb, "code", rs.getString("code"), first);
        first = pair(sb, "target", rs.getString("target"), first);
        pair(sb, "criterion", rs.getString("criterion"), first);
    }

    private static void partnerCustomerJson(ResultSet rs, StringBuilder sb) throws SQLException {
        boolean first = true;
        first = pair(sb, "id", rs.getString("id"), first);
        first = pair(sb, "memberNo", rs.getString("member_no"), first);
        first = pair(sb, "name", rs.getString("name"), first);
        first = pair(sb, "email", rs.getString("email"), first);
        first = pair(sb, "partner", rs.getString("partner"), first);
        first = pair(sb, "segment", rs.getString("segment"), first);
        first = numberPair(sb, "recentDays", rs.getInt("recent_days"), first);
        first = numberPair(sb, "frequency", rs.getInt("monthly_frequency"), first);
        first = numberPair(sb, "amount", rs.getInt("total_amount"), first);
        first = pair(sb, "amountLabel", rs.getString("amount_label"), first);
        first = numberPair(sb, "weekdayIdleRate", rs.getInt("weekday_idle_rate"), first);
        first = numberPair(sb, "continuousMonths", rs.getInt("continuous_months"), first);
        first = pair(sb, "invitationStatus", rs.getString("invitation_status"), first);
        pair(sb, "createdAt", safeDate(rs.getString("created_at")), first);
    }

    private static void customerJson(ResultSet rs, StringBuilder sb) throws SQLException {
        boolean first = true;
        first = pair(sb, "id", rs.getString("id"), first);
        first = pair(sb, "code", rs.getString("customer_code"), first);
        first = pair(sb, "name", rs.getString("display_name"), first);
        first = pair(sb, "email", rs.getString("email"), first);
        first = pair(sb, "partner", rs.getString("partner_name"), first);
        first = pair(sb, "vipRank", rs.getString("vip_rank"), first);
        first = boolPair(sb, "vip", rs.getInt("is_vip") == 1, first);
        first = pair(sb, "invitationStatus", rs.getString("invitation_status"), first);
        first = numberPair(sb, "visits", rs.getInt("frequency"), first);
        pair(sb, "createdAt", safeDate(rs.getString("created_at")), first);
    }

    private static void slotJson(ResultSet rs, StringBuilder sb) throws SQLException {
        boolean first = true;
        first = pair(sb, "id", rs.getString("id"), first);
        first = pair(sb, "store", rs.getString("store"), first);
        first = pair(sb, "room", rs.getString("room"), first);
        first = pair(sb, "date", rs.getString("date"), first);
        first = pair(sb, "time", rs.getString("time"), first);
        first = numberPair(sb, "price", rs.getInt("price"), first);
        first = pair(sb, "plan", rs.getString("plan"), first);
        boolPair(sb, "published", rs.getInt("published") == 1, first);
    }

    private static void reservationJson(ResultSet rs, StringBuilder sb) throws SQLException {
        boolean first = true;
        first = pair(sb, "id", rs.getString("id"), first);
        first = pair(sb, "userName", rs.getString("user_name"), first);
        first = pair(sb, "email", rs.getString("user_email"), first);
        first = pair(sb, "partner", rs.getString("partner_name"), first);
        first = pair(sb, "store", rs.getString("store_name"), first);
        first = pair(sb, "room", rs.getString("room_name"), first);
        first = pair(sb, "date", rs.getString("slot_date"), first);
        first = pair(sb, "time", rs.getString("slot_time"), first);
        first = pair(sb, "plan", rs.getString("plan"), first);
        first = numberPair(sb, "price", rs.getInt("price"), first);
        first = pair(sb, "status", rs.getString("status_label"), first);
        pair(sb, "createdAt", safeDate(rs.getString("reserved_at")), first);
    }

    private static void noticeJson(ResultSet rs, StringBuilder sb) throws SQLException {
        boolean first = true;
        first = pair(sb, "id", rs.getString("id"), first);
        first = pair(sb, "title", rs.getString("title"), first);
        first = pair(sb, "body", rs.getString("body"), first);
        pair(sb, "date", rs.getString("date"), first);
    }

    private static void handleCreateCustomer(HttpExchange exchange) throws IOException {
        if (handleOptions(exchange)) return;
        if (!requireMethod(exchange, "POST")) return;

        try (Connection conn = connect()) {
            Map<String, String> params = readParams(exchange);
            if (isBlank(params.get("customer_code")) && isBlank(params.get("email"))) {
                sendText(exchange, 400, "customer_code or email is required");
                return;
            }

            int customerId = ensureCustomer(conn, params);
            sendText(exchange, 200, "customer saved: " + customerId);
        } catch (Exception e) {
            sendError(exchange, e);
        }
    }

    private static void handleCreateReservation(HttpExchange exchange) throws IOException {
        if (handleOptions(exchange)) return;
        if (!requireMethod(exchange, "POST")) return;

        try (Connection conn = connect()) {
            try {
                Map<String, String> params = readParams(exchange);
                conn.setAutoCommit(false);

                int customerId = ensureCustomer(conn, params);
                int slotId = ensureSlot(conn, params);
                int price = numberOrDefault(
                    firstPresent(params, "price", "amount"),
                    queryIntOrZero(conn, "SELECT price FROM reservation_slots WHERE slot_id = ?", slotId)
                );

                String customerName = fallback(
                    valueOrNull(firstPresent(params, "user_name", "display_name", "name", "customer_name")),
                    queryString(conn, "SELECT display_name FROM customers WHERE customer_id = ?", customerId)
                );
                String customerEmail = fallback(
                    valueOrNull(firstPresent(params, "email", "user_email")),
                    queryString(conn, "SELECT email FROM customers WHERE customer_id = ?", customerId)
                );
                String partnerName = fallback(
                    valueOrNull(firstPresent(params, "partner_name", "partner")),
                    queryString(conn, "SELECT partner_name FROM customers WHERE customer_id = ?", customerId)
                );
                String storeName = fallback(
                    valueOrNull(params.get("store")),
                    queryString(conn, "SELECT store_name FROM reservation_slots WHERE slot_id = ?", slotId)
                );
                String roomName = fallback(
                    valueOrNull(params.get("room")),
                    queryString(conn, "SELECT room_name FROM reservation_slots WHERE slot_id = ?", slotId)
                );
                String slotDate = fallback(
                    valueOrNull(firstPresent(params, "slot_date", "date")),
                    queryString(conn, "SELECT slot_date FROM reservation_slots WHERE slot_id = ?", slotId)
                );
                String slotTime = fallback(
                    valueOrNull(firstPresent(params, "slot_time", "time")),
                    queryString(conn, "SELECT COALESCE(slot_time_display, start_time) FROM reservation_slots WHERE slot_id = ?", slotId)
                );
                String plan = fallback(
                    valueOrNull(params.get("plan")),
                    queryString(conn, "SELECT plan FROM reservation_slots WHERE slot_id = ?", slotId)
                );
                int referralFee = !isBlank(partnerName) && !DEFAULT_PARTNER.equals(partnerName) && price > 0
                    ? Math.round(price * 0.1f)
                    : 0;

                int reservationId = insertAndReturnId(conn, """
                    INSERT INTO reservations
                        (external_reservation_id, customer_id, slot_id, customer_name, customer_email,
                         partner_name, store_name, room_name, slot_date, slot_time, plan, price,
                         payment_status, referral_fee, referral_status, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?)
                    """,
                    valueOrNull(firstPresent(params, "external_reservation_id", "reservation_id")),
                    customerId,
                    slotId,
                    customerName,
                    customerEmail,
                    partnerName,
                    storeName,
                    roomName,
                    slotDate,
                    slotTime,
                    plan,
                    price,
                    referralFee,
                    referralFee > 0 ? "unpaid" : "none",
                    normalizeReservationStatus(params.getOrDefault("status", "reserved"))
                );

                execute(conn, "UPDATE reservation_slots SET status = 'reserved', updated_at = CURRENT_TIMESTAMP WHERE slot_id = ?", slotId);
                conn.commit();
                sendText(exchange, 200, "reservation saved: " + reservationId);
            } catch (Exception e) {
                conn.rollback();
                throw e;
            }
        } catch (Exception e) {
            sendError(exchange, e);
        }
    }

    private static void handleCreateSlot(HttpExchange exchange) throws IOException {
        if (handleOptions(exchange)) return;
        if (!requireMethod(exchange, "POST")) return;

        try (Connection conn = connect()) {
            Map<String, String> params = readParams(exchange);
            int slotId = ensureSlot(conn, params);
            sendText(exchange, 200, "slot saved: " + slotId);
        } catch (Exception e) {
            sendError(exchange, e);
        }
    }

    private static void handleCreateInvitation(HttpExchange exchange) throws IOException {
        if (handleOptions(exchange)) return;
        if (!requireMethod(exchange, "POST")) return;

        try (Connection conn = connect()) {
            Map<String, String> params = readParams(exchange);
            int customerId = ensureCustomer(conn, params);
            String code = "VIP-" + System.currentTimeMillis();
            execute(conn, """
                UPDATE customers
                SET invitation_code = COALESCE(invitation_code, ?),
                    invitation_status = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE customer_id = ?
                """,
                code,
                params.getOrDefault("status", "sent"),
                customerId
            );
            sendText(exchange, 200, "invitation saved");
        } catch (Exception e) {
            sendError(exchange, e);
        }
    }

    private static void handleCreateNotice(HttpExchange exchange) throws IOException {
        if (handleOptions(exchange)) return;
        if (!requireMethod(exchange, "POST")) return;

        try (Connection conn = connect()) {
            Map<String, String> params = readParams(exchange);
            if (isBlank(params.get("title")) || isBlank(params.get("body"))) {
                sendText(exchange, 400, "title and body are required");
                return;
            }

            execute(conn, """
                INSERT INTO notices (external_notice_id, title, body, notice_date)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(external_notice_id) DO UPDATE SET
                    title = excluded.title,
                    body = excluded.body,
                    notice_date = excluded.notice_date
                """,
                valueOrNull(firstPresent(params, "external_notice_id", "id")),
                params.get("title"),
                params.get("body"),
                params.getOrDefault("notice_date", LocalDate.now().toString())
            );
            sendText(exchange, 200, "notice saved");
        } catch (Exception e) {
            sendError(exchange, e);
        }
    }

    private static int ensureCustomer(Connection conn, Map<String, String> params) throws SQLException {
        String externalCustomerId = valueOrNull(firstPresent(params, "external_customer_id"));
        String email = valueOrNull(firstPresent(params, "email", "user_email"));
        String code = valueOrNull(firstPresent(params, "customer_code"));
        if (isBlank(code)) {
            code = email == null ? "customer_" + System.currentTimeMillis() : "mail_" + email.replaceAll("[^A-Za-z0-9]", "_");
        }

        Integer existing = null;
        if (externalCustomerId != null) {
            existing = queryInt(conn, "SELECT customer_id FROM customers WHERE external_customer_id = ?", externalCustomerId);
        }
        if (existing == null && email != null) {
            existing = queryInt(conn, "SELECT customer_id FROM customers WHERE email = ?", email);
        }
        if (existing == null) {
            existing = queryInt(conn, "SELECT customer_id FROM customers WHERE customer_code = ?", code);
        }

        String displayName = valueOrNull(firstPresent(params, "display_name", "user_name", "name", "customer_name"));
        String partnerName = valueOrNull(firstPresent(params, "partner_name", "partner"));

        if (existing != null) {
            execute(conn, """
                UPDATE customers
                SET external_customer_id = COALESCE(?, external_customer_id),
                    display_name = COALESCE(?, display_name),
                    email = COALESCE(?, email),
                    age_group = COALESCE(?, age_group),
                    gender = COALESCE(?, gender),
                    partner_name = COALESCE(?, partner_name),
                    partner_code = COALESCE(?, partner_code),
                    referral_code = COALESCE(?, referral_code),
                    segment = COALESCE(?, segment),
                    updated_at = CURRENT_TIMESTAMP
                WHERE customer_id = ?
                """,
                externalCustomerId,
                displayName,
                email,
                valueOrNull(params.get("age_group")),
                valueOrNull(params.get("gender")),
                partnerName,
                valueOrNull(params.get("partner_code")),
                valueOrNull(params.get("referral_code")),
                valueOrNull(params.get("segment")),
                existing
            );
            return existing;
        }

        return insertAndReturnId(conn, """
            INSERT INTO customers
                (external_customer_id, customer_code, display_name, email, phone, age_group,
                 gender, partner_name, partner_code, referral_code, segment)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            externalCustomerId,
            code,
            fallback(displayName, code),
            email,
            valueOrNull(params.get("phone")),
            valueOrNull(params.get("age_group")),
            valueOrNull(params.get("gender")),
            fallback(partnerName, DEFAULT_PARTNER),
            valueOrNull(params.get("partner_code")),
            valueOrNull(params.get("referral_code")),
            valueOrNull(params.get("segment"))
        );
    }

    private static int ensureSlot(Connection conn, Map<String, String> params) throws SQLException {
        String slotIdValue = valueOrNull(params.get("slot_id"));
        if (slotIdValue != null && slotIdValue.matches("\\d+")) {
            Integer existingById = queryInt(conn, "SELECT slot_id FROM reservation_slots WHERE slot_id = ?", Integer.parseInt(slotIdValue));
            if (existingById != null) return existingById;
        }

        String externalSlotId = valueOrNull(firstPresent(params, "external_slot_id", "id"));
        if (externalSlotId != null) {
            Integer existingByExternal = queryInt(conn, "SELECT slot_id FROM reservation_slots WHERE external_slot_id = ?", externalSlotId);
            if (existingByExternal != null) {
                updateSlot(conn, existingByExternal, params);
                return existingByExternal;
            }
        }

        String slotTime = firstPresent(params, "slot_time", "time", "start_time");
        String startTime = normalizeTime(firstClock(slotTime));
        String endTime = valueOrNull(params.get("end_time"));
        if (endTime == null) {
            endTime = addMinutes(startTime, minutesFromPlan(params.get("plan")));
        }

        return insertAndReturnId(conn, """
            INSERT INTO reservation_slots
                (external_slot_id, store_name, room_name, slot_date, start_time, end_time,
                 slot_time_display, plan, price, published, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
            """,
            externalSlotId,
            params.getOrDefault("store", DEFAULT_STORE),
            params.getOrDefault("room", "Room A"),
            params.getOrDefault("slot_date", params.getOrDefault("date", LocalDate.now().toString())),
            startTime,
            endTime,
            valueOrNull(slotTime),
            params.getOrDefault("plan", DEFAULT_PLAN),
            numberOrDefault(params.get("price"), 0),
            truthy(params.getOrDefault("published", "1")) ? 1 : 0
        );
    }

    private static void updateSlot(Connection conn, int slotId, Map<String, String> params) throws SQLException {
        if (isBlank(params.get("store")) && isBlank(params.get("room")) && isBlank(params.get("slot_date"))
                && isBlank(params.get("date")) && isBlank(params.get("slot_time")) && isBlank(params.get("time"))
                && isBlank(params.get("plan")) && isBlank(params.get("price")) && isBlank(params.get("published"))) {
            return;
        }

        String slotTime = firstPresent(params, "slot_time", "time", "start_time");
        String startTime = null;
        String endTime = null;
        if (!isBlank(slotTime) || !isBlank(params.get("end_time"))) {
            startTime = normalizeTime(firstClock(slotTime));
            endTime = valueOrNull(params.get("end_time"));
            if (endTime == null) {
                endTime = addMinutes(startTime, minutesFromPlan(params.get("plan")));
            }
        }

        Integer published = isBlank(params.get("published")) ? null : (truthy(params.get("published")) ? 1 : 0);
        execute(conn, """
            UPDATE reservation_slots
            SET store_name = COALESCE(?, store_name),
                room_name = COALESCE(?, room_name),
                slot_date = COALESCE(?, slot_date),
                start_time = COALESCE(?, start_time),
                end_time = COALESCE(?, end_time),
                slot_time_display = COALESCE(?, slot_time_display),
                plan = COALESCE(?, plan),
                price = COALESCE(?, price),
                published = COALESCE(?, published),
                updated_at = CURRENT_TIMESTAMP
            WHERE slot_id = ?
            """,
            valueOrNull(params.get("store")),
            valueOrNull(params.get("room")),
            valueOrNull(firstPresent(params, "slot_date", "date")),
            startTime,
            endTime,
            valueOrNull(slotTime),
            valueOrNull(params.get("plan")),
            numberOrNull(params.get("price")),
            published,
            slotId
        );
    }

    private static void handleStatic(HttpExchange exchange) throws IOException {
        if (handleOptions(exchange)) return;
        String method = exchange.getRequestMethod();
        if (!"GET".equals(method) && !"HEAD".equals(method)) {
            sendText(exchange, 405, "GET method required");
            return;
        }

        String requestPath = exchange.getRequestURI().getPath();
        if (requestPath.equals("/")) requestPath = "/index.html";

        Path file = SITE_ROOT.resolve(requestPath.substring(1)).normalize();
        if (!file.startsWith(SITE_ROOT) || !Files.isRegularFile(file)) {
            sendText(exchange, 404, "Not found");
            return;
        }

        byte[] bytes = Files.readAllBytes(file);
        exchange.getResponseHeaders().set("Content-Type", mimeType(file));
        exchange.sendResponseHeaders(200, "HEAD".equals(method) ? -1 : bytes.length);
        if (!"HEAD".equals(method)) {
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private static Map<String, String> readParams(HttpExchange exchange) throws IOException {
        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
        if (contentType != null && contentType.toLowerCase().contains("json")) {
            return parseJsonObject(body);
        }
        return parseFormData(body);
    }

    private static Map<String, String> parseFormData(String body) {
        Map<String, String> params = new HashMap<>();
        if (body == null || body.isBlank()) return params;

        for (String pair : body.split("&")) {
            String[] keyValue = pair.split("=", 2);
            if (keyValue.length == 2) {
                params.put(
                    URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8),
                    URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8)
                );
            }
        }
        return params;
    }

    private static Map<String, String> parseJsonObject(String body) {
        Map<String, String> params = new HashMap<>();
        if (body == null) return params;

        Matcher matcher = Pattern.compile("\"([^\"]+)\"\\s*:\\s*(\"([^\"]*)\"|true|false|null|-?\\d+)").matcher(body);
        while (matcher.find()) {
            String raw = matcher.group(2);
            params.put(matcher.group(1), raw.startsWith("\"") ? matcher.group(3) : raw);
        }
        return params;
    }

    private static String queryArray(Connection conn, String sql, RowJsonWriter writer, Object... values) throws SQLException {
        StringBuilder sb = new StringBuilder("[");
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            bind(pstmt, values);
            try (ResultSet rs = pstmt.executeQuery()) {
                boolean firstRow = true;
                while (rs.next()) {
                    if (!firstRow) sb.append(',');
                    sb.append('{');
                    writer.write(rs, sb);
                    sb.append('}');
                    firstRow = false;
                }
            }
        }
        sb.append(']');
        return sb.toString();
    }

    private static Integer queryInt(Connection conn, String sql, Object... values) throws SQLException {
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            bind(pstmt, values);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next() ? rs.getInt(1) : null;
            }
        }
    }

    private static int queryIntOrZero(Connection conn, String sql, Object... values) throws SQLException {
        Integer value = queryInt(conn, sql, values);
        return value == null ? 0 : value;
    }

    private static String queryString(Connection conn, String sql, Object... values) throws SQLException {
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            bind(pstmt, values);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next() ? rs.getString(1) : null;
            }
        }
    }

    private static int insertAndReturnId(Connection conn, String sql, Object... values) throws SQLException {
        try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            bind(pstmt, values);
            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }

        throw new SQLException("Insert did not return an id");
    }

    private static void execute(Connection conn, String sql, Object... values) throws SQLException {
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            bind(pstmt, values);
            pstmt.executeUpdate();
        }
    }

    private static void bind(PreparedStatement pstmt, Object... values) throws SQLException {
        for (int i = 0; i < values.length; i++) {
            pstmt.setObject(i + 1, values[i]);
        }
    }

    private static boolean requireMethod(HttpExchange exchange, String method) throws IOException {
        if (!method.equals(exchange.getRequestMethod())) {
            sendText(exchange, 405, method + " method required");
            return false;
        }
        return true;
    }

    private static boolean handleOptions(HttpExchange exchange) throws IOException {
        addCorsHeaders(exchange);
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void sendJson(HttpExchange exchange, int statusCode, String json) throws IOException {
        addCorsHeaders(exchange);
        byte[] response = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, response.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response);
        }
    }

    private static void sendText(HttpExchange exchange, int statusCode, String message) throws IOException {
        addCorsHeaders(exchange);
        byte[] response = message.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, response.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response);
        }
    }

    private static void sendError(HttpExchange exchange, Exception e) throws IOException {
        e.printStackTrace();
        sendText(exchange, 500, "server error: " + e.getMessage());
    }

    private static boolean pair(StringBuilder sb, String key, String value, boolean first) {
        if (!first) sb.append(',');
        sb.append(jsonString(key)).append(':').append(jsonString(value));
        return false;
    }

    private static boolean numberPair(StringBuilder sb, String key, int value, boolean first) {
        if (!first) sb.append(',');
        sb.append(jsonString(key)).append(':').append(value);
        return false;
    }

    private static boolean boolPair(StringBuilder sb, String key, boolean value, boolean first) {
        if (!first) sb.append(',');
        sb.append(jsonString(key)).append(':').append(value);
        return false;
    }

    private static String jsonString(String value) {
        if (value == null) return "null";
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\b' -> sb.append("\\b");
                case '\f' -> sb.append("\\f");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
                }
            }
        }
        return sb.append('"').toString();
    }

    private static String mimeType(Path file) {
        String name = file.getFileName().toString().toLowerCase();
        if (name.endsWith(".html")) return "text/html; charset=UTF-8";
        if (name.endsWith(".css")) return "text/css; charset=UTF-8";
        if (name.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (name.endsWith(".json")) return "application/json; charset=UTF-8";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        return "application/octet-stream";
    }

    private static String safeDate(String timestamp) {
        if (timestamp == null || timestamp.length() < 10) return timestamp;
        return timestamp.substring(0, 10);
    }

    private static String firstPresent(Map<String, String> params, String... keys) {
        for (String key : keys) {
            String value = params.get(key);
            if (!isBlank(value)) return value;
        }
        return null;
    }

    private static String valueOrNull(String value) {
        return isBlank(value) ? null : value;
    }

    private static String fallback(String value, String fallback) {
        return isBlank(value) ? fallback : value;
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static int numberOrDefault(String value, int fallback) {
        Integer parsed = numberOrNull(value);
        return parsed == null ? fallback : parsed;
    }

    private static Integer numberOrNull(String value) {
        if (isBlank(value)) return null;
        try {
            return Integer.parseInt(value.replaceAll("[^0-9-]", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static boolean truthy(String value) {
        return "1".equals(value) || "true".equalsIgnoreCase(value) || "yes".equalsIgnoreCase(value);
    }

    private static String normalizeReservationStatus(String status) {
        if (status == null) return "reserved";
        if (status.contains("\u6765\u5e97") || status.equalsIgnoreCase("visited")) return "visited";
        if (status.contains("\u30ad\u30e3\u30f3\u30bb\u30eb") || status.equalsIgnoreCase("canceled")) return "canceled";
        return "reserved";
    }

    private static String firstClock(String text) {
        if (isBlank(text)) return "00:00";
        Matcher matcher = Pattern.compile("(\\d{1,2}:\\d{2})").matcher(text);
        return matcher.find() ? matcher.group(1) : text;
    }

    private static String normalizeTime(String value) {
        if (isBlank(value)) return "00:00";
        String[] parts = value.split(":");
        if (parts.length != 2) return "00:00";
        try {
            return String.format("%02d:%02d", Integer.parseInt(parts[0]), Integer.parseInt(parts[1]));
        } catch (NumberFormatException e) {
            return "00:00";
        }
    }

    private static int minutesFromPlan(String plan) {
        if (isBlank(plan)) return 90;
        Matcher matcher = Pattern.compile("(\\d{2,3})").matcher(plan);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : 90;
    }

    private static String addMinutes(String startTime, int minutes) {
        try {
            return LocalTime.parse(startTime).plusMinutes(minutes).toString();
        } catch (Exception e) {
            return startTime;
        }
    }

    @FunctionalInterface
    private interface RowJsonWriter {
        void write(ResultSet rs, StringBuilder sb) throws SQLException;
    }
}
