package com.trendify.controller;

import com.trendify.dto.ApiResponse;
import com.trendify.model.Category;
import com.trendify.service.CategoryService;
import com.trendify.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final FileStorageService fileStorageService;

    /** GET /api/categories — All active categories (public) */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getActiveCategories()));
    }

    /** GET /api/categories/all — All categories including inactive (admin) */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    /** GET /api/categories/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    /** POST /api/categories */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Category>> createCategory(
            @RequestBody Map<String, String> body) {
        Category category = categoryService.createCategory(
                body.get("name"), body.get("description"), body.get("imageUrl"));
        return ResponseEntity.status(201).body(ApiResponse.success(category, "Category created"));
    }

    /** POST /api/categories/with-image (multipart) */
    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Category>> createCategoryWithImage(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeFile(image, "categories");
        }
        Category category = categoryService.createCategory(name, description, imageUrl);
        return ResponseEntity.status(201).body(ApiResponse.success(category, "Category created"));
    }

    /** PUT /api/categories/{id} */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Category category = categoryService.updateCategory(
                id,
                (String) body.get("name"),
                (String) body.get("description"),
                (String) body.get("imageUrl"),
                body.get("active") != null ? (Boolean) body.get("active") : null);
        return ResponseEntity.ok(ApiResponse.success(category, "Category updated"));
    }

    /** DELETE /api/categories/{id} */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted"));
    }
}
