package com.pralhad.expense.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pralhad.expense.model.ExpenseTransaction;
import com.pralhad.expense.model.TransactionType;
import com.pralhad.expense.model.User;

public interface ExpenseTransactionRepository extends JpaRepository<ExpenseTransaction, Long> {

	List<ExpenseTransaction> findByUserOrderByTransactionDateDesc(User user);

	List<ExpenseTransaction> findTop5ByUserOrderByTransactionDateDesc(User user);

	List<ExpenseTransaction> findByUserAndType(User user, TransactionType type);

	List<ExpenseTransaction> findByUserAndTransactionDateBetween(User user, LocalDate startDate, LocalDate endDate);
}