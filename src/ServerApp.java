import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.HashMap;
import java.util.Map;

public class ServerApp {
    private static final String DB_URL = "jdbc:sqlite:db/sauna.db";

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/customers", exchange -> {
            addCorsHeaders(exchange);

            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("POST".equals(exchange.getRequestMethod())) {
                handleCreateCustomer(exchange);
            } else {
                sendResponse(exchange, 405, "POSTメソッドだけ対応しています");
            }
        });

        server.start();
        System.out.println("Javaサーバー起動中: http://localhost:8080");
    }

    private static void handleCreateCustomer(HttpExchange exchange) throws IOException {
        try {
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Map<String, String> params = parseFormData(body);

            String customerCode = params.get("customer_code");
            String ageGroup = params.get("age_group");
            String gender = params.get("gender");

            if (isBlank(customerCode) || isBlank(ageGroup) || isBlank(gender)) {
                sendResponse(exchange, 400, "入力不足です");
                return;
            }

            insertCustomer(customerCode, ageGroup, gender);

            sendResponse(exchange, 200, "顧客データを登録しました: " + customerCode);

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "サーバーエラー: " + e.getMessage());
        }
    }

    private static void insertCustomer(String customerCode, String ageGroup, String gender) throws Exception {
        String sql = """
            INSERT INTO customers (customer_code, age_group, gender)
            VALUES (?, ?, ?);
        """;

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customerCode);
            pstmt.setString(2, ageGroup);
            pstmt.setString(3, gender);
            pstmt.executeUpdate();
        }
    }

    private static Map<String, String> parseFormData(String body) {
        Map<String, String> params = new HashMap<>();

        if (body == null || body.isEmpty()) {
            return params;
        }

        String[] pairs = body.split("&");

        for (String pair : pairs) {
            String[] keyValue = pair.split("=", 2);

            if (keyValue.length == 2) {
                String key = URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8);
                String value = URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
                params.put(key, value);
            }
        }

        return params;
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        Headers headers = exchange.getResponseHeaders();
        headers.add("Access-Control-Allow-Origin", "*");
        headers.add("Access-Control-Allow-Methods", "POST, OPTIONS");
        headers.add("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
        byte[] response = message.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, response.length);

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response);
        }
    }
}