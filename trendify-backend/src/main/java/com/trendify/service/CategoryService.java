package com.trendify.service;

import com.trendify.exception.ResourceNotFoundException;
import com.trendify.model.Category;
import com.trendify.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Category> getActiveCategories() {
        return categoryRepository.findByActiveTrue();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @Transactional
    public Category createCategory(String name, String description, String imageUrl) {
        if (categoryRepository.existsByName(name)) {
            throw new IllegalArgumentException("Category already exists: " + name);
        }
        Category category = Category.builder()
                .name(name)
                .description(description)
                .imageUrl(imageUrl)
                .active(true)
                .build();
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, String name, String description,
                                   String imageUrl, Boolean active) {
        Category category = getCategoryById(id);
        if (name != null) category.setName(name);
        if (description != null) category.setDescription(description);
        if (imageUrl != null) category.setImageUrl(imageUrl);
        if (active != null) category.setActive(active);
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
