package com.trendify.config;

import com.trendify.model.Category;
import com.trendify.model.User;
import com.trendify.repository.CategoryRepository;
import com.trendify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSuperAdmin();
        seedAdmin();
        seedCategories();
    }

    private void seedSuperAdmin() {
        if (!userRepository.existsByEmail("superadmin@trendify.com")) {
            User superAdmin = User.builder()
                    .fullName("TrendiFy Super Admin")
                    .email("superadmin@trendify.com")
                    .password(passwordEncoder.encode("SuperAdmin@123"))
                    .role(User.Role.SUPER_ADMIN)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            userRepository.save(superAdmin);
            log.info("✅ Super Admin seeded: superadmin@trendify.com / SuperAdmin@123");
        }
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@trendify.com")) {
            User admin = User.builder()
                    .fullName("TrendiFy Admin")
                    .email("admin@trendify.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(User.Role.ADMIN)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("✅ Admin seeded: admin@trendify.com / Admin@123");
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> categories = List.of(
                Category.builder().name("Outerwear").description("Coats, jackets, and trench coats").active(true).build(),
                Category.builder().name("Tops").description("Blouses, shirts, and sweaters").active(true).build(),
                Category.builder().name("Bottoms").description("Trousers, skirts, and shorts").active(true).build(),
                Category.builder().name("Dresses").description("Midi, maxi, and mini dresses").active(true).build(),
                Category.builder().name("Shoes").description("Heels, loafers, boots, and sneakers").active(true).build(),
                Category.builder().name("Accessories").description("Bags, scarves, and jewelry").active(true).build()
            );
            categoryRepository.saveAll(categories);
            log.info("✅ {} categories seeded", categories.size());
        }
    }
}
