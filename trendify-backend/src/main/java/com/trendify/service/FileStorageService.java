package com.trendify.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES =
            Arrays.asList("image/jpeg", "image/png", "image/gif", "image/webp");

    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10MB

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
            log.info("Upload directory ready: {}", uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String storeFile(MultipartFile file, String subFolder) throws IOException {
        validateFile(file);

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "file");
        String extension = getExtension(originalName);
        String fileName = UUID.randomUUID() + "." + extension;

        Path targetDir = Paths.get(uploadDir, subFolder);
        Files.createDirectories(targetDir);

        Path targetPath = targetDir.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        log.info("Stored file: {}", targetPath);
        return "/uploads/" + subFolder + "/" + fileName;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            String relativePath = fileUrl.replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete file: {}", fileUrl);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "File type not allowed. Allowed: JPEG, PNG, GIF, WEBP");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }
    }

    private String getExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(idx + 1).toLowerCase() : "jpg";
    }
}
