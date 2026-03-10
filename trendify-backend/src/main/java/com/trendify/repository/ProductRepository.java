package com.trendify.repository;

import com.trendify.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "p.category.id = :categoryId")
    Page<Product> searchByKeywordAndCategory(@Param("keyword") String keyword,
                                              @Param("categoryId") Long categoryId,
                                              Pageable pageable);

    List<Product> findByStockQuantityLessThan(int threshold);

    @Query("SELECT p FROM Product p ORDER BY p.totalSales DESC")
    List<Product> findTopSellingProducts(Pageable pageable);

    List<Product> findByCategoryId(Long categoryId);
}
