package com.documind.dto;

public record LoginRespone(
        String accessToken,
        UserDto user
){}
