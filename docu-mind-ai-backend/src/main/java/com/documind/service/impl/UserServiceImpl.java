package com.documind.service.impl;

import com.documind.dto.LoginRequest;
import com.documind.dto.LoginRespone;
import com.documind.dto.RegisterUserRequest;
import com.documind.dto.UserDto;
import com.documind.entity.Role;
import com.documind.entity.User;
import com.documind.repository.UserRepository;
import com.documind.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    // Registers a new user with BCrypt hashed password and default USER role
    @Override
    public UserDto registerUser(RegisterUserRequest request) {

        String username = request.username() != null ? request.username().trim() : "";
        if (username.isBlank())
            throw new IllegalArgumentException("Username cannot be blank");

        if (userRepository.existsByUsernameIgnoreCase(username))
            throw new IllegalArgumentException("Username already exists. Please choose a different username.");

        User user = new User();
        user.setEmail(request.email());
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        User savedUser = userRepository.save(user);
        return new UserDto(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole());
    }

    // Authenticates credentials, generates JWT access token, and returns user session info
    @Override
    public LoginRespone login(LoginRequest request) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                request.username(), request.password()
        );
        authenticationManager.authenticate(authentication);

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(new CustomUserDetails(user));

        return new LoginRespone(
                token,
                new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole())
        );
    }
}
