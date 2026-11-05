package com.documind.dto;

import com.documind.entity.Role;

public record UserDto(
        Long id,
        String username,
        String email,
        Role role
) {
}
