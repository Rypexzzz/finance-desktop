package com.finance.mobile.ui.screens.transactions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finance.mobile.data.db.dao.TransactionWithCategory
import com.finance.mobile.data.db.entity.CategoryEntity
import com.finance.mobile.data.repository.CategoryRepository
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

data class TransactionsState(
    val transactions: List<TransactionWithCategory> = emptyList(),
    val totalCount: Int = 0,
    val incomeSum: Long = 0,
    val expenseSum: Long = 0,
    val serviceSum: Long = 0,
    val categories: List<CategoryEntity> = emptyList(),
    val isLoading: Boolean = true,
    val currentMonth: YearMonth = currentYearMonth(),
    val filterType: String? = null,
    val filterCategoryId: Long? = null,
    val searchQuery: String = "",
    val page: Int = 0,
    val pageSize: Int = 50,
    val showForm: Boolean = false,
    val editingTransaction: TransactionWithCategory? = null
)

@HiltViewModel
class TransactionsViewModel @Inject constructor(
    private val transactionRepo: TransactionRepository,
    private val categoryRepo: CategoryRepository
) : ViewModel() {

    private val _state = MutableStateFlow(TransactionsState())
    val state: StateFlow<TransactionsState> = _state.asStateFlow()

    init {
        loadCategories()
        loadData()
    }

    private fun loadCategories() {
        viewModelScope.launch {
            _state.value = _state.value.copy(categories = categoryRepo.getAll())
        }
    }

    fun loadData() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            val s = _state.value
            val (dateFrom, dateTo) = s.currentMonth.dateRange()

            val transactions = transactionRepo.getFiltered(
                type = s.filterType,
                categoryId = s.filterCategoryId,
                dateFrom = dateFrom,
                dateTo = dateTo,
                search = s.searchQuery.ifBlank { null },
                limit = s.pageSize,
                offset = s.page * s.pageSize
            )

            val count = transactionRepo.getFilteredCount(
                type = s.filterType,
                categoryId = s.filterCategoryId,
                dateFrom = dateFrom,
                dateTo = dateTo,
                search = s.searchQuery.ifBlank { null }
            )

            val income = transactionRepo.sumByType("income", dateFrom, dateTo)
            val expense = transactionRepo.sumByType("expense", dateFrom, dateTo)
            val service = transactionRepo.sumByType("service", dateFrom, dateTo)

            _state.value = s.copy(
                transactions = transactions,
                totalCount = count,
                incomeSum = income,
                expenseSum = expense,
                serviceSum = service,
                isLoading = false
            )
        }
    }

    fun setMonth(month: YearMonth) {
        _state.value = _state.value.copy(currentMonth = month, page = 0)
        loadData()
    }

    fun setFilterType(type: String?) {
        _state.value = _state.value.copy(filterType = type, page = 0)
        loadData()
    }

    fun setFilterCategory(categoryId: Long?) {
        _state.value = _state.value.copy(filterCategoryId = categoryId, page = 0)
        loadData()
    }

    fun setSearch(query: String) {
        _state.value = _state.value.copy(searchQuery = query, page = 0)
        loadData()
    }

    fun nextPage() {
        val s = _state.value
        if ((s.page + 1) * s.pageSize < s.totalCount) {
            _state.value = s.copy(page = s.page + 1)
            loadData()
        }
    }

    fun prevPage() {
        val s = _state.value
        if (s.page > 0) {
            _state.value = s.copy(page = s.page - 1)
            loadData()
        }
    }

    fun showCreateForm() {
        _state.value = _state.value.copy(showForm = true, editingTransaction = null)
    }

    fun showEditForm(transaction: TransactionWithCategory) {
        _state.value = _state.value.copy(showForm = true, editingTransaction = transaction)
    }

    fun hideForm() {
        _state.value = _state.value.copy(showForm = false, editingTransaction = null)
    }

    fun createTransaction(
        type: String, categoryId: Long, amountRub: Long, date: String, comment: String
    ) {
        viewModelScope.launch {
            transactionRepo.create(type, categoryId, amountRub, date, comment)
            hideForm()
            loadData()
        }
    }

    fun updateTransaction(
        id: Long, type: String, categoryId: Long, amountRub: Long, date: String, comment: String
    ) {
        viewModelScope.launch {
            transactionRepo.update(id, type, categoryId, amountRub, date, comment)
            hideForm()
            loadData()
        }
    }

    fun deleteTransaction(id: Long) {
        viewModelScope.launch {
            transactionRepo.delete(id)
            loadData()
        }
    }
}
