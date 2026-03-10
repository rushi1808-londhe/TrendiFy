package com.trendify.controller;

import com.trendify.dto.ApiResponse;
import com.trendify.dto.ProductRequest;
import com.trendify.model.Product;
import com.trendify.service.FileStorageService;
import com.trendify.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;

    // ── PUBLIC ─────────────────────────────────────────────────────────────

    /**
     * GET /api/products?page=0&size=12&sortBy=createdAt&direction=desc
     * Browse active products (paginated)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(
                ApiResponse.success(productService.getActiveProducts(page, size, sortBy, direction)));
    }

    /**
     * GET /api/products/{id}
     * Get product detail
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    /**
     * GET /api/products/search?keyword=coat&categoryId=1&page=0&size=12
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Product>>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(
                ApiResponse.success(productService.searchProducts(keyword, categoryId, page, size)));
    }

    /**
     * GET /api/products/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<Product>>> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(
                ApiResponse.success(productService.getProductsByCategory(categoryId, page, size)));
    }

    // ── ADMIN ──────────────────────────────────────────────────────────────

    /**
     * GET /api/products/admin/all — All products (including inactive)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<Product>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(page, size)));
    }

    /**
     * POST /api/products — Create product (JSON)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @Valid @RequestBody ProductRequest request) {
        Product product = productService.createProduct(request);
        return ResponseEntity.status(201).body(ApiResponse.success(product, "Product created"));
    }

    /**
     * POST /api/products/with-images — Create product with image uploads (multipart)
     */
    @PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Product>> createProductWithImages(
            @Valid @ModelAttribute ProductRequest request,
            @RequestParam(value = "images", required = false) List<MultipartFile> images)
            throws IOException {

        List<String> imageUrls = new ArrayList<>();
        if (images != null) {
            for (MultipartFile image : images) {
                imageUrls.add(fileStorageService.storeFile(image, "products"));
            }
        }
        request.setImageUrls(imageUrls);
        Product product = productService.createProduct(request);
        return ResponseEntity.status(201).body(ApiResponse.success(product, "Product created"));
    }

    /**
     * PUT /api/products/{id} — Update product
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(productService.updateProduct(id, request), "Product updated"));
    }

    /**
     * DELETE /api/products/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted"));
    }

    /**
     * PATCH /api/products/{id}/stock?quantity=5
     */
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Product>> updateStock(
            @PathVariable Long id,
            @RequestParam int quantity) {
        return ResponseEntity.ok(
                ApiResponse.success(productService.updateStock(id, quantity), "Stock updated"));
    }

    /**
     * GET /api/products/admin/low-stock?threshold=5
     */
    @GetMapping("/admin/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Product>>> getLowStock(
            @RequestParam(defaultValue = "5") int threshold) {
        return ResponseEntity.ok(ApiResponse.success(productService.getLowStockProducts(threshold)));
    }

    /**
     * GET /api/products/top-selling?limit=10
     */
    @GetMapping("/top-selling")
    public ResponseEntity<ApiResponse<List<Product>>> getTopSelling(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getTopSellingProducts(limit)));
    }
}
