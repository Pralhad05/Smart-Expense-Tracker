package com.pralhad.expense.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.pralhad.expense.model.TransactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TransactionRequest(
        @NotBlank String description,
        @NotBlank String category,
        @NotNull TransactionType type,
        @NotNull @Positive BigDecimal amount,
        @NotNull LocalDate transactionDate
) {
}