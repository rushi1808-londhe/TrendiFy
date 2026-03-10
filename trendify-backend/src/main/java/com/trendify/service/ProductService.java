package com.trendify.service;

import com.trendify.dto.ProductRequest;
import com.trendify.exception.ResourceNotFoundException;
import com.trendify.model.Category;
import com.trendify.model.Product;
import com.trendify.repository.CategoryRepository;
import com.trendify.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // ── Public browsing ────────────────────────────────────────────────────

    public Page<Product> getActiveProducts(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository.findByActiveTrue(pageable);
    }

    public Page<Product> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
    }

    public Page<Product> searchProducts(String keyword, Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (categoryId != null) {
            return productRepository.searchByKeywordAndCategory(keyword, categoryId, pageable);
        }
        return productRepository.searchProducts(keyword, pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    // ── Admin CRUD ─────────────────────────────────────────────────────────

    public Page<Product> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findAll(pageable);
    }

    @Transactional
    public Product createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .category(category)
                .imageUrls(request.getImageUrls())
                .sku(request.getSku())
                .brand(request.getBrand())
                .size(request.getSize())
                .color(request.getColor())
                .active(request.getActive())
                .build();

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getImageUrls() != null) product.setImageUrls(request.getImageUrls());
        if (request.getSku() != null) product.setSku(request.getSku());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getSize() != null) product.setSize(request.getSize());
        if (request.getColor() != null) product.setColor(request.getColor());
        if (request.getActive() != null) product.setActive(request.getActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found: " + request.getCategoryId()));
            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    @Transactional
    public Product updateStock(Long id, int quantity) {
        Product product = getProductById(id);
        int newStock = product.getStockQuantity() + quantity;
        if (newStock < 0) throw new IllegalArgumentException("Insufficient stock");
        product.setStockQuantity(newStock);
        return productRepository.save(product);
    }

    public List<Product> getLowStockProducts(int threshold) {
        return productRepository.findByStockQuantityLessThan(threshold);
    }

    public List<Product> getTopSellingProducts(int limit) {
        return productRepository.findTopSellingProducts(PageRequest.of(0, limit));
    }
}
