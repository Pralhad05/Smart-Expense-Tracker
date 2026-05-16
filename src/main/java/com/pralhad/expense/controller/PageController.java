package com.pralhad.expense.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

	@GetMapping("/")
	public String index() {
		return "index";
	}

	@GetMapping("/login")
	public String login() {
		return "login";
	}

	@GetMapping("/forgot")
	public String forgot() {
		return "forgot";
	}

	@GetMapping("/register")
	public String register() {
		return "register";
	}

	@GetMapping("/dashboard")
	public String dashboard() {
		return "dashboard";
	}

}