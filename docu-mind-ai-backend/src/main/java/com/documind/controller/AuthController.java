package com.documind.controller;

import com.documind.dto.LoginRequest;
import com.documind.dto.LoginRespone;
import com.documind.dto.RegisterUserRequest;
import com.documind.dto.UserDto;
import com.documind.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(
        name = "Authentication",
        description = "Endpoints for user registration and login."
)
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    @Operation(
            summary = "User login",
            description = "Authenticates user credentials and returns a JWT access token along with user details."
    )
    public ResponseEntity<LoginRespone> login(
            @Valid @RequestBody LoginRequest request) {
        LoginRespone response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(
            summary = "User registration",
            description = "Registers a new user account with default USER role."
    )
    public ResponseEntity<UserDto> register(
            @Valid @RequestBody RegisterUserRequest request) {
        UserDto userDto = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
    }
}
