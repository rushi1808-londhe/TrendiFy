package com.trendify.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be non-negative")
    private BigDecimal price;

    @Min(value = 0, message = "Stock quantity must be non-negative")
    private Integer stockQuantity = 0;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private List<String> imageUrls;
    private String sku;
    private String brand;
    private String size;
    private String color;
    private Boolean active = true;
}
