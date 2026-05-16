package com.pralhad.expense.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pralhad.expense.model.User;
import com.pralhad.expense.repository.UserRepository;
import com.pralhad.expense.util.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

  
    public String register(User user) {

        if (user.getUsername() == null || user.getPassword() == null) {
            throw new RuntimeException("Username and password required");
        }

        if (repo.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);

        return "Registered successfully";
    }

    
    public String login(String username, String password) {

        User user = repo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(username);
    }
    
    public String resetPassword(String username, String newPassword) {

        User user = repo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(encoder.encode(newPassword));
        repo.save(user);

        return "Password updated successfully";
    }
}