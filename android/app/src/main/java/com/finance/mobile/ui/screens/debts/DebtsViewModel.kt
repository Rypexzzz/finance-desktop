package com.finance.mobile.ui.screens.debts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finance.mobile.data.db.entity.DebtEntity
import com.finance.mobile.data.db.entity.DebtPaymentEntity
import com.finance.mobile.data.repository.CategoryRepository
import com.finance.mobile.data.repository.DebtRepository
import com.finance.mobile.domain.model.DebtStatus
import com.finance.mobile.domain.model.DebtType
import com.finance.mobile.util.currentYearMonth
import com.finance.mobile.util.dateRange
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DebtWithProgress(
    val debt: DebtEntity,
    val totalPayments: Long,
    val monthlyPayments: Long,
    val progress: Float
)

data class DebtsState(
    val debts: List<DebtWithProgress> = emptyList(),
    val isLoading: Boolean = true,
    val showForm: Boolean = false,
    val editingDebt: DebtEntity? = null,
    val selectedDebtId: Long? = null,
    val payments: List<DebtPaymentEntity> = emptyList(),
    val showPaymentForm: Boolean = false,
    val serviceCategoryIds: Map<String, Long> = emptyMap()
)

@HiltViewModel
class DebtsViewModel @Inject constructor(
    private val debtRepo: DebtRepository,
    private val categoryRepo: CategoryRepository
) : ViewModel() {

    private val _state = MutableStateFlow(DebtsState())
    val state: StateFlow<DebtsState> = _state.asStateFlow()

    init {
        loadServiceCategories()
        loadData()
    }

    private fun loadServiceCategories() {
        viewModelScope.launch {
            val cats = categoryRepo.getByType("service")
            val map = mutableMapOf<String, Long>()
            cats.find { it.code == "service_loan_payment" }?.let { map["loan"] = it.id }
            cats.find { it.code == "service_credit_card_payment" }?.let { map["credit_card"] = it.id }
            _state.value = _state.value.copy(serviceCategoryIds = map)
        }
    }

    fun loadData() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            val debts = debtRepo.getAll()
            val (dateFrom, dateTo) = currentYearMonth().dateRange()

            val debtsWithProgress = debts.map { debt ->
                val total = debtRepo.getTotalPayments(debt.id)
                val monthly = debtRepo.getMonthlyPayments(debt.id, dateFrom, dateTo)
                val paid = debt.initialAmountRub - debt.currentBalanceRub
                val progress = if (debt.initialAmountRub > 0) {
                    paid.toFloat() / debt.initialAmountRub
                } else 0f

                DebtWithProgress(debt, total, monthly, progress)
            }

            _state.value = _state.value.copy(debts = debtsWithProgress, isLoading = false)
        }
    }

    fun showCreateForm() { _state.value = _state.value.copy(showForm = true, editingDebt = null) }
    fun showEditForm(debt: DebtEntity) { _state.value = _state.value.copy(showForm = true, editingDebt = debt) }
    fun hideForm() { _state.value = _state.value.copy(showForm = false, editingDebt = null) }

    fun createDebt(
        debtType: String, name: String, initialAmountRub: Long,
        currentBalanceRub: Long, monthlyPlanRub: Long?,
        minimumPaymentRub: Long?, targetCloseDate: String?
    ) {
        viewModelScope.launch {
            debtRepo.create(debtType, name, initialAmountRub, currentBalanceRub, monthlyPlanRub, minimumPaymentRub, targetCloseDate)
            hideForm()
            loadData()
        }
    }

    fun updateDebt(
        id: Long, name: String, debtType: String,
        initialAmountRub: Long, currentBalanceRub: Long,
        monthlyPlanRub: Long?, minimumPaymentRub: Long?, targetCloseDate: String?
    ) {
        viewModelScope.launch {
            debtRepo.update(id, name, debtType, initialAmountRub, currentBalanceRub, monthlyPlanRub, minimumPaymentRub, targetCloseDate)
            hideForm()
            loadData()
        }
    }

    fun changeStatus(id: Long, status: DebtStatus) {
        viewModelScope.launch {
            debtRepo.changeStatus(id, status.value)
            loadData()
        }
    }

    fun deleteDebt(id: Long) {
        viewModelScope.launch {
            debtRepo.delete(id)
            _state.value = _state.value.copy(selectedDebtId = null)
            loadData()
        }
    }

    fun selectDebt(debtId: Long?) {
        _state.value = _state.value.copy(selectedDebtId = debtId)
        if (debtId != null) loadPayments(debtId)
    }

    private fun loadPayments(debtId: Long) {
        viewModelScope.launch {
            val payments = debtRepo.getPayments(debtId)
            _state.value = _state.value.copy(payments = payments)
        }
    }

    fun showPaymentForm() { _state.value = _state.value.copy(showPaymentForm = true) }
    fun hidePaymentForm() { _state.value = _state.value.copy(showPaymentForm = false) }

    fun addPayment(debtId: Long, amountRub: Long, date: String, comment: String) {
        viewModelScope.launch {
            val debt = debtRepo.getById(debtId) ?: return@launch
            val catId = _state.value.serviceCategoryIds[debt.debtType] ?: return@launch
            debtRepo.addPayment(debtId, amountRub, date, comment, catId)
            hidePaymentForm()
            loadData()
            loadPayments(debtId)
        }
    }
}
