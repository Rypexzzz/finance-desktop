package com.finance.mobile.ui.screens.goals

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finance.mobile.data.db.entity.CategoryEntity
import com.finance.mobile.data.db.entity.GoalContributionEntity
import com.finance.mobile.data.db.entity.GoalEntity
import com.finance.mobile.data.repository.CategoryRepository
import com.finance.mobile.data.repository.GoalRepository
import com.finance.mobile.domain.model.GoalStatus
import com.finance.mobile.util.currentYearMonth
import com.finance.mobile.util.dateRange
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class GoalWithProgress(
    val goal: GoalEntity,
    val totalContributions: Long,
    val monthlyContributions: Long,
    val progress: Float
)

data class GoalsState(
    val goals: List<GoalWithProgress> = emptyList(),
    val isLoading: Boolean = true,
    val showForm: Boolean = false,
    val editingGoal: GoalEntity? = null,
    val selectedGoalId: Long? = null,
    val contributions: List<GoalContributionEntity> = emptyList(),
    val showContributionForm: Boolean = false,
    val serviceCategoryId: Long = 0
)

@HiltViewModel
class GoalsViewModel @Inject constructor(
    private val goalRepo: GoalRepository,
    private val categoryRepo: CategoryRepository
) : ViewModel() {

    private val _state = MutableStateFlow(GoalsState())
    val state: StateFlow<GoalsState> = _state.asStateFlow()

    init {
        loadServiceCategory()
        loadData()
    }

    private fun loadServiceCategory() {
        viewModelScope.launch {
            val cats = categoryRepo.getByType("service")
            val goalCat = cats.find { it.code == "service_goal_contribution" }
            if (goalCat != null) {
                _state.value = _state.value.copy(serviceCategoryId = goalCat.id)
            }
        }
    }

    fun loadData() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            val goals = goalRepo.getAll()
            val (dateFrom, dateTo) = currentYearMonth().dateRange()

            val goalsWithProgress = goals.map { goal ->
                val total = goalRepo.getTotalContributions(goal.id)
                val monthly = goalRepo.getMonthlyContributions(goal.id, dateFrom, dateTo)
                val current = goal.startAmountRub + total
                val progress = if (goal.targetAmountRub > 0) {
                    current.toFloat() / goal.targetAmountRub
                } else 0f

                GoalWithProgress(goal, total, monthly, progress)
            }

            _state.value = _state.value.copy(goals = goalsWithProgress, isLoading = false)
        }
    }

    fun showCreateForm() {
        _state.value = _state.value.copy(showForm = true, editingGoal = null)
    }

    fun showEditForm(goal: GoalEntity) {
        _state.value = _state.value.copy(showForm = true, editingGoal = goal)
    }

    fun hideForm() {
        _state.value = _state.value.copy(showForm = false, editingGoal = null)
    }

    fun createGoal(
        name: String, targetAmountRub: Long, startAmountRub: Long,
        monthlyPlanRub: Long?, deadlineDate: String?
    ) {
        viewModelScope.launch {
            goalRepo.create(name, targetAmountRub, startAmountRub, monthlyPlanRub, deadlineDate)
            hideForm()
            loadData()
        }
    }

    fun updateGoal(
        id: Long, name: String, targetAmountRub: Long, startAmountRub: Long,
        monthlyPlanRub: Long?, deadlineDate: String?
    ) {
        viewModelScope.launch {
            goalRepo.update(id, name, targetAmountRub, startAmountRub, monthlyPlanRub, deadlineDate)
            hideForm()
            loadData()
        }
    }

    fun changeStatus(id: Long, status: GoalStatus) {
        viewModelScope.launch {
            goalRepo.changeStatus(id, status.value)
            loadData()
        }
    }

    fun selectGoal(goalId: Long?) {
        _state.value = _state.value.copy(selectedGoalId = goalId)
        if (goalId != null) loadContributions(goalId)
    }

    private fun loadContributions(goalId: Long) {
        viewModelScope.launch {
            val contributions = goalRepo.getContributions(goalId)
            _state.value = _state.value.copy(contributions = contributions)
        }
    }

    fun showContributionForm() {
        _state.value = _state.value.copy(showContributionForm = true)
    }

    fun hideContributionForm() {
        _state.value = _state.value.copy(showContributionForm = false)
    }

    fun addContribution(goalId: Long, amountRub: Long, date: String, comment: String) {
        viewModelScope.launch {
            goalRepo.addContribution(
                goalId, amountRub, date, comment, _state.value.serviceCategoryId
            )
            hideContributionForm()
            loadData()
            loadContributions(goalId)
        }
    }
}
