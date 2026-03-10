package com.trendify.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    @NotNull(message = "Order items are required")
    private List<OrderItemRequest> items;

    @NotBlank(message = "Shipping full name is required")
    private String shippingFullName;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotBlank(message = "Shipping city is required")
    private String shippingCity;

    private String shippingZip;

    @NotBlank(message = "Shipping phone is required")
    private String shippingPhone;

    private String paymentMethod = "CASH_ON_DELIVERY";
    private String notes;

    @Data
    public static class OrderItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
