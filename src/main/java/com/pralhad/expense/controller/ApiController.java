package com.pralhad.expense.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController {

	@GetMapping("/summary")
	public Map<String, Double> summary() {

		double income = 50000;
		double expense = 20000;

		Map<String, Double> map = new HashMap<>();
		map.put("income", income);
		map.put("expense", expense);
		map.put("savings", income - expense);

		return map;
	}

}