package com.finance.mobile.util

import java.text.NumberFormat
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.Locale

private val ruLocale = Locale("ru", "RU")
private val currencyFormatter = NumberFormat.getCurrencyInstance(ruLocale).apply {
    maximumFractionDigits = 0
}
private val dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy", ruLocale)
private val monthFormatter = DateTimeFormatter.ofPattern("LLLL yyyy", ruLocale)

fun Long.formatRub(): String = currencyFormatter.format(this)

fun Long.formatRubSigned(): String {
    val sign = if (this > 0) "+" else ""
    return "$sign${currencyFormatter.format(this)}"
}

fun String.formatDate(): String = try {
    LocalDate.parse(this).format(dateFormatter)
} catch (_: Exception) {
    this
}

fun YearMonth.formatMonth(): String =
    format(monthFormatter).replaceFirstChar { it.uppercase() }

fun YearMonth.dateRange(): Pair<String, String> {
    val from = atDay(1).toString()
    val to = atEndOfMonth().toString()
    return from to to
}

fun currentYearMonth(): YearMonth = YearMonth.now()
