package com.finance.mobile.ui.screens.analytics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finance.mobile.data.db.dao.CategoryBreakdownItem
import com.finance.mobile.data.db.dao.TransactionWithCategory
import com.finance.mobile.data.repository.TransactionRepository
import com.finance.mobile.util.currentYearMonth
import com.finance.mobile.util.dateRange
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

data class MonthlyTrendItem(
    val month: YearMonth,
    val income: Long,
    val expense: Long
)

data class AnalyticsState(
    val currentMonth: YearMonth = currentYearMonth(),
    val incomeSum: Long = 0,
    val expenseSum: Long = 0,
    val prevIncomeSum: Long = 0,
    val prevExpenseSum: Long = 0,
    val categoryBreakdown: List<CategoryBreakdownItem> = emptyList(),
    val recentTransactions: List<TransactionWithCategory> = emptyList(),
    val monthlyTrend: List<MonthlyTrendItem> = emptyList(),
    val isLoading: Boolean = true
)

@HiltViewModel
class AnalyticsViewModel @Inject constructor(
    private val repo: TransactionRepository
) : ViewModel() {

    private val _state = MutableStateFlow(AnalyticsState())
    val state: StateFlow<AnalyticsState> = _state.asStateFlow()

    init { loadData() }

    fun loadData() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            val month = _state.value.currentMonth
            val (dateFrom, dateTo) = month.dateRange()
            val prevMonth = month.minusMonths(1)
            val (prevFrom, prevTo) = prevMonth.dateRange()

            val income = repo.sumByType("income", dateFrom, dateTo)
            val expense = repo.sumByType("expense", dateFrom, dateTo)
            val prevIncome = repo.sumByType("income", prevFrom, prevTo)
            val prevExpense = repo.sumByType("expense", prevFrom, prevTo)

            val breakdown = repo.getCategoryBreakdown("expense", dateFrom, dateTo)
            val recent = repo.getRecent(dateFrom, dateTo, 5)

            // Build 6-month trend
            val trend = (5 downTo 0).map { offset ->
                val m = month.minusMonths(offset.toLong())
                val (f, t) = m.dateRange()
                MonthlyTrendItem(
                    month = m,
                    income = repo.sumByType("income", f, t),
                    expense = repo.sumByType("expense", f, t)
                )
            }

            _state.value = _state.value.copy(
                incomeSum = income,
                expenseSum = expense,
                prevIncomeSum = prevIncome,
                prevExpenseSum = prevExpense,
                categoryBreakdown = breakdown,
                recentTransactions = recent,
                monthlyTrend = trend,
                isLoading = false
            )
        }
    }

    fun setMonth(month: YearMonth) {
        _state.value = _state.value.copy(currentMonth = month)
        loadData()
    }
}
