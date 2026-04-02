package com.complaint.system.service;

import com.complaint.system.entity.User;
import com.complaint.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> register(User user) {
        Map<String, Object> response = new HashMap<>();

        if (userRepository.existsByEmail(user.getEmail())) {
            response.put("success", false);
            response.put("message", "Email already registered. Please login.");
            return response;
        }

        // In production, hash the password — keep plain for demo simplicity
        User saved = userRepository.save(user);
        response.put("success", true);
        response.put("message", "Registration successful!");
        response.put("userId", saved.getId());
        response.put("name", saved.getName());
        response.put("email", saved.getEmail());
        response.put("mobileNumber", saved.getMobileNumber());
        return response;
    }

    public Map<String, Object> login(String email, String password) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "No account found with this email.");
            return response;
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(password)) {
            response.put("success", false);
            response.put("message", "Incorrect password.");
            return response;
        }

        response.put("success", true);
        response.put("message", "Login successful!");
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("mobileNumber", user.getMobileNumber());
        return response;
    }
}
