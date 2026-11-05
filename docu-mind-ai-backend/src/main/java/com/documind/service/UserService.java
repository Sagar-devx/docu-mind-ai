package com.documind.service;

import com.documind.dto.LoginRequest;
import com.documind.dto.LoginRespone;
import com.documind.dto.RegisterUserRequest;
import com.documind.dto.UserDto;

public interface UserService {

    UserDto registerUser(RegisterUserRequest request);

    LoginRespone login(LoginRequest request);
}
