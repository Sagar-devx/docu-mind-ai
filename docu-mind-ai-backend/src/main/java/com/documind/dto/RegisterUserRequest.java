package com.documind.dto;

import com.documind.entity.Role;

public record RegisterUserRequest(
        String username,
        String email,
        String password
) {
}
