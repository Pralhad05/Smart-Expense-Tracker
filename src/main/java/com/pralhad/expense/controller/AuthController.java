package com.pralhad.expense.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pralhad.expense.model.User;
import com.pralhad.expense.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

	@Autowired
	private AuthService service;

	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody User user) {
		try {
			String token = service.login(user.getUsername(), user.getPassword());
			return ResponseEntity.ok(token);
		} catch (Exception e) {
			return ResponseEntity.status(401).body(e.getMessage());
		}
	}

	@PostMapping("/register")
	public ResponseEntity<String> register(@RequestBody User user) {
		try {
			return ResponseEntity.ok(service.register(user));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PostMapping("/reset")
	public ResponseEntity<String> resetPassword(@RequestBody User user) {

		try {
			return ResponseEntity.ok(service.resetPassword(user.getUsername(), user.getPassword()));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}