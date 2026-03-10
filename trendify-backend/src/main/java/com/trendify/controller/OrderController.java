package com.trendify.controller;

import com.trendify.dto.ApiResponse;
import com.trendify.dto.OrderRequest;
import com.trendify.model.Order;
import com.trendify.model.User;
import com.trendify.repository.UserRepository;
import com.trendify.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    // ── CUSTOMER ───────────────────────────────────────────────────────────

    /**
     * POST /api/orders — Place a new order
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Order>> placeOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication auth) {
        Long userId = getUserId(auth);
        Order order = orderService.placeOrder(userId, request);
        return ResponseEntity.status(201).body(ApiResponse.success(order, "Order placed successfully"));
    }

    /**
     * GET /api/orders/my — Customer's own order history
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<Order>>> getMyOrders(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByUser(userId)));
    }

    /**
     * GET /api/orders/my/{orderNumber} — Track a specific order
     */
    @GetMapping("/my/{orderNumber}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Order>> getMyOrder(
            @PathVariable String orderNumber,
            Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrderByNumber(orderNumber, userId)));
    }

    /**
     * PATCH /api/orders/my/{id}/cancel — Cancel order
     */
    @PatchMapping("/my/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Order>> cancelOrder(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success(orderService.cancelOrder(id, userId), "Order cancelled"));
    }

    // ── ADMIN ──────────────────────────────────────────────────────────────

    /**
     * GET /api/orders/admin/all — All orders (paginated)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<Order>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(page, size)));
    }

    /**
     * GET /api/orders/admin/{id}
     */
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    /**
     * PATCH /api/orders/admin/{id}/status — Update order status
     * Body: { "status": "SHIPPED" }
     */
    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Order>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Status field is required"));
        }
        return ResponseEntity.ok(
                ApiResponse.success(orderService.updateOrderStatus(id, status), "Status updated"));
    }

    /**
     * GET /api/orders/admin/stats — Dashboard statistics
     */
    @GetMapping("/admin/stats")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getDashboardStats()));
    }

    // ── Helper ────────────────────────────────────────────────────────────

    private Long getUserId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return user.getId();
    }
}
