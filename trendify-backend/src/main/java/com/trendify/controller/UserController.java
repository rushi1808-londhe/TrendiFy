package com.trendify.controller;

import com.trendify.dto.ApiResponse;
import com.trendify.dto.UserUpdateRequest;
import com.trendify.model.User;
import com.trendify.repository.UserRepository;
import com.trendify.service.FileStorageService;
import com.trendify.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    // ── PROFILE (Any authenticated user) ──────────────────────────────────

    /** GET /api/users/me */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getMe(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /** PUT /api/users/me */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateMe(
            @RequestBody UserUpdateRequest request,
            Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(
                ApiResponse.success(userService.updateProfile(user.getId(), request), "Profile updated"));
    }

    /** POST /api/users/me/avatar — Upload profile photo */
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {
        User user = userService.getUserByEmail(auth.getName());
        String url = fileStorageService.storeFile(file, "avatars");
        UserUpdateRequest req = new UserUpdateRequest();
        req.setProfileImage(url);
        userService.updateProfile(user.getId(), req);
        return ResponseEntity.ok(ApiResponse.success(url, "Avatar uploaded"));
    }

    /** PATCH /api/users/me/password */
    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        userService.changePassword(user.getId(), body.get("oldPassword"), body.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed"));
    }

    // ── SUPER ADMIN: User management ──────────────────────────────────────

    /** GET /api/users/admin/all */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    /** GET /api/users/admin/customers */
    @GetMapping("/admin/customers")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllCustomers()));
    }

    /** GET /api/users/admin/admins */
    @GetMapping("/admin/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllAdmins() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllAdmins()));
    }

    /** POST /api/users/admin/create-admin */
    @PostMapping("/admin/create-admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<User>> createAdmin(@RequestBody Map<String, String> body) {
        User admin = userService.createAdmin(
                body.get("fullName"), body.get("email"), body.get("password"));
        return ResponseEntity.status(201).body(ApiResponse.success(admin, "Admin created"));
    }

    /** PATCH /api/users/admin/{id}/toggle-status */
    @PatchMapping("/admin/{id}/toggle-status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<User>> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(userService.toggleUserStatus(id), "Status updated"));
    }

    /** DELETE /api/users/admin/{id} */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted"));
    }

    /** GET /api/users/admin/{id} */
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }
}
