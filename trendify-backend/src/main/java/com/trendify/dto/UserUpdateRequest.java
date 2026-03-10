package com.trendify.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private String phone;
    private String address;
    private String profileImage;
}
