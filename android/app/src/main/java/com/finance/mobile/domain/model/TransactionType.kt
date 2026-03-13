package com.finance.mobile.domain.model

enum class TransactionType(val value: String, val label: String) {
    EXPENSE("expense", "Расход"),
    INCOME("income", "Доход"),
    SERVICE("service", "Сервисная");

    companion object {
        fun fromValue(value: String) = entries.first { it.value == value }
    }
}

enum class DebtType(val value: String, val label: String) {
    LOAN("loan", "Кредит"),
    CREDIT_CARD("credit_card", "Кредитная карта");

    companion object {
        fun fromValue(value: String) = entries.first { it.value == value }
    }
}

enum class GoalStatus(val value: String, val label: String) {
    ACTIVE("active", "Активная"),
    PAUSED("paused", "На паузе"),
    COMPLETED("completed", "Завершена"),
    CANCELLED("cancelled", "Отменена");

    companion object {
        fun fromValue(value: String) = entries.first { it.value == value }
    }
}

enum class DebtStatus(val value: String, val label: String) {
    ACTIVE("active", "Активный"),
    PAUSED("paused", "На паузе"),
    CLOSED("closed", "Закрыт"),
    CANCELLED("cancelled", "Отменён");

    companion object {
        fun fromValue(value: String) = entries.first { it.value == value }
    }
}
