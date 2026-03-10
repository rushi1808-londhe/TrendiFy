package com.trendify.service;

import com.trendify.dto.UserUpdateRequest;
import com.trendify.exception.ResourceNotFoundException;
import com.trendify.model.User;
import com.trendify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Profile ────────────────────────────────────────────────────────────

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Transactional
    public User updateProfile(Long id, UserUpdateRequest request) {
        User user = getUserById(id);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long id, String oldPassword, String newPassword) {
        User user = getUserById(id);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ── Super Admin: Manage users ──────────────────────────────────────────

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getAllCustomers() {
        return userRepository.findByRole(User.Role.CUSTOMER);
    }

    public List<User> getAllAdmins() {
        return userRepository.findByRole(User.Role.ADMIN);
    }

    @Transactional
    public User createAdmin(String fullName, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use: " + email);
        }
        User admin = User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(User.Role.ADMIN)
                .status(User.UserStatus.ACTIVE)
                .build();
        return userRepository.save(admin);
    }

    @Transactional
    public User toggleUserStatus(Long id) {
        User user = getUserById(id);
        user.setStatus(user.getStatus() == User.UserStatus.ACTIVE
                ? User.UserStatus.INACTIVE
                : User.UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
}
