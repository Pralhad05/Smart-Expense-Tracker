package com.pralhad.expense.controller;

import java.math.BigDecimal;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pralhad.expense.DTO.TransactionRequest;
import com.pralhad.expense.model.ExpenseTransaction;
import com.pralhad.expense.model.TransactionType;
import com.pralhad.expense.model.User;
import com.pralhad.expense.repository.ExpenseTransactionRepository;
import com.pralhad.expense.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardApiController {

    private final ExpenseTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public DashboardApiController(
            ExpenseTransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

	@GetMapping
	public Map<String, Object> dashboard(Authentication authentication) {
		User user = currentUser(authentication);

		List<ExpenseTransaction> transactions = transactionRepository.findByUserOrderByTransactionDateDesc(user);

		BigDecimal income = totalByType(transactions, TransactionType.INCOME);
		BigDecimal expense = totalByType(transactions, TransactionType.EXPENSE);
		BigDecimal balance = income.subtract(expense);

		Map<String, BigDecimal> categoryTotals = transactions.stream()
				.filter(transaction -> transaction.getType() == TransactionType.EXPENSE)
				.collect(Collectors.groupingBy(ExpenseTransaction::getCategory, LinkedHashMap::new, Collectors.mapping(
						ExpenseTransaction::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

		List<Map<String, Object>> recent = transactions.stream().limit(5).map(this::toMap).toList();

		return Map.of("username", user.getUsername(), "totalBalance", balance, "totalIncome", income, "totalExpense",
				expense, "totalSavings", balance, "categoryTotals", categoryTotals, "monthly",
				monthlyData(transactions), "recentTransactions", recent, "topCategory", topCategory(categoryTotals));
	}

	@GetMapping("/transactions")
	public List<Map<String, Object>> transactions(Authentication authentication) {
		User user = currentUser(authentication);

		return transactionRepository.findByUserOrderByTransactionDateDesc(user).stream().map(this::toMap).toList();
	}

	@PostMapping("/transactions")
	public Map<String, Object> addTransaction(Authentication authentication,
			@Valid @RequestBody TransactionRequest request) {
		User user = currentUser(authentication);

		ExpenseTransaction transaction = new ExpenseTransaction();
		transaction.setDescription(request.description());
		transaction.setCategory(request.category());
		transaction.setType(request.type());
		transaction.setAmount(request.amount());
		transaction.setTransactionDate(request.transactionDate());
		transaction.setUser(user);

		ExpenseTransaction saved = transactionRepository.save(transaction);

		return toMap(saved);
	}

	@DeleteMapping("/transactions/{id}")
	public Map<String, String> deleteTransaction(@PathVariable Long id) {
		if (!transactionRepository.existsById(id)) {
			throw new RuntimeException("Transaction not found");
		}

		transactionRepository.deleteById(id);

		return Map.of("message", "Transaction deleted successfully");
	}

	private User currentUser(Authentication authentication) {
	    if (authentication == null ||
	            authentication.getName() == null ||
	            authentication.getName().equals("anonymousUser")) {
	        throw new RuntimeException("User is not authenticated");
	    }

	    String username = authentication.getName();

	    return userRepository.findByUsername(username)
	            .orElseThrow(() -> new RuntimeException("User not found: " + username));
	}

	private BigDecimal totalByType(List<ExpenseTransaction> transactions, TransactionType type) {
		return transactions.stream().filter(transaction -> transaction.getType() == type)
				.map(ExpenseTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private Map<String, Object> toMap(ExpenseTransaction transaction) {
		return Map.of("id", transaction.getId(), "description", transaction.getDescription(), "category",
				transaction.getCategory(), "type", transaction.getType(), "amount", transaction.getAmount(),
				"transactionDate", transaction.getTransactionDate());
	}

	private List<Map<String, Object>> monthlyData(List<ExpenseTransaction> transactions) {
		List<Map<String, Object>> data = new ArrayList<>();

		for (Month month : Month.values()) {
			BigDecimal income = BigDecimal.ZERO;
			BigDecimal expense = BigDecimal.ZERO;

			for (ExpenseTransaction transaction : transactions) {
				if (transaction.getTransactionDate().getMonth() == month) {
					if (transaction.getType() == TransactionType.INCOME) {
						income = income.add(transaction.getAmount());
					} else {
						expense = expense.add(transaction.getAmount());
					}
				}
			}

			data.add(Map.of("month", month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH), "income", income, "expense",
					expense));
		}

		return data;
	}

	private Map<String, Object> topCategory(Map<String, BigDecimal> categoryTotals) {
		return categoryTotals.entrySet().stream().max(Map.Entry.comparingByValue())
				.map(entry -> Map.<String, Object>of("name", entry.getKey(), "amount", entry.getValue()))
				.orElse(Map.of("name", "No expenses yet", "amount", BigDecimal.ZERO));
	}
}
