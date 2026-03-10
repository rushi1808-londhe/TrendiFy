package com.trendify.controller;

import com.trendify.dto.ApiResponse;
import com.trendify.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    /**
     * POST /api/files/upload?folder=products
     * Upload a single image and get back its URL
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "misc") String folder) throws IOException {
        String url = fileStorageService.storeFile(file, folder);
        return ResponseEntity.ok(ApiResponse.success(url, "File uploaded"));
    }

    /**
     * POST /api/files/upload-multiple?folder=products
     * Upload multiple images
     */
    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> uploadMultiple(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(defaultValue = "misc") String folder) throws IOException {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            urls.add(fileStorageService.storeFile(file, folder));
        }
        return ResponseEntity.ok(ApiResponse.success(urls, files.size() + " file(s) uploaded"));
    }

    /**
     * DELETE /api/files?url=/uploads/products/abc.jpg
     */
    @DeleteMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@RequestParam String url) {
        fileStorageService.deleteFile(url);
        return ResponseEntity.ok(ApiResponse.success(null, "File deleted"));
    }
}
