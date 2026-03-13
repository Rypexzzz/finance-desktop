package com.finance.mobile.ui.screens.goals

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finance.mobile.data.db.entity.GoalEntity
import com.finance.mobile.domain.model.GoalStatus
import com.finance.mobile.ui.components.*
import com.finance.mobile.ui.theme.*
import com.finance.mobile.util.*
import java.time.LocalDate

@Composable
fun GoalsScreen(
    viewModel: GoalsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Цели", style = MaterialTheme.typography.headlineMedium)
            FilledIconButton(onClick = { viewModel.showCreateForm() }) {
                Icon(Icons.Default.Add, "Добавить")
            }
        }

        if (state.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (state.goals.isEmpty()) {
            EmptyState(
                icon = Icons.Default.TrackChanges,
                title = "Нет целей",
                description = "Создайте цель накопления"
            )
        } else {
            // Summary stats
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    label = "Всего целей",
                    value = state.goals.size.toString(),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    label = "Завершено",
                    value = state.goals.count { it.goal.status == "completed" }.toString(),
                    valueColor = IncomeGreen,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            LazyColumn(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(state.goals, key = { it.goal.id }) { goalWithProgress ->
                    GoalCard(
                        item = goalWithProgress,
                        isSelected = state.selectedGoalId == goalWithProgress.goal.id,
                        onClick = {
                            viewModel.selectGoal(
                                if (state.selectedGoalId == goalWithProgress.goal.id) null
                                else goalWithProgress.goal.id
                            )
                        },
                        onEdit = { viewModel.showEditForm(goalWithProgress.goal) },
                        onAddContribution = {
                            viewModel.selectGoal(goalWithProgress.goal.id)
                            viewModel.showContributionForm()
                        },
                        onChangeStatus = { status -> viewModel.changeStatus(goalWithProgress.goal.id, status) },
                        contributions = if (state.selectedGoalId == goalWithProgress.goal.id) state.contributions else emptyList()
                    )
                }
            }
        }
    }

    // Create/Edit dialog
    if (state.showForm) {
        GoalFormDialog(
            editing = state.editingGoal,
            onDismiss = { viewModel.hideForm() },
            onSave = { name, target, start, monthly, deadline ->
                val e = state.editingGoal
                if (e != null) {
                    viewModel.updateGoal(e.id, name, target, start, monthly, deadline)
                } else {
                    viewModel.createGoal(name, target, start, monthly, deadline)
                }
            }
        )
    }

    // Contribution dialog
    if (state.showContributionForm && state.selectedGoalId != null) {
        ContributionFormDialog(
            onDismiss = { viewModel.hideContributionForm() },
            onSave = { amount, date, comment ->
                viewModel.addContribution(state.selectedGoalId!!, amount, date, comment)
            }
        )
    }
}

@Composable
private fun GoalCard(
    item: GoalWithProgress,
    isSelected: Boolean,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onAddContribution: () -> Unit,
    onChangeStatus: (GoalStatus) -> Unit,
    contributions: List<com.finance.mobile.data.db.entity.GoalContributionEntity>
) {
    val goal = item.goal
    val status = GoalStatus.fromValue(goal.status)
    val currentAmount = goal.startAmountRub + item.totalContributions

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(goal.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                }
                GoalStatusBadge(status)
            }

            Spacer(modifier = Modifier.height(12.dp))

            AnimatedProgressBar(progress = item.progress, color = Primary)

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    currentAmount.formatRub(),
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    "из ${goal.targetAmountRub.formatRub()}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    "${(item.progress * 100).toInt()}%",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold,
                    color = Primary
                )
            }

            if (goal.monthlyPlanRub != null) {
                Text(
                    "План: ${goal.monthlyPlanRub.formatRub()}/мес • В этом месяце: ${item.monthlyContributions.formatRub()}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            if (isSelected && status == GoalStatus.ACTIVE) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = onAddContribution) { Text("Пополнить") }
                    OutlinedButton(onClick = onEdit) { Text("Изменить") }
                    OutlinedButton(onClick = { onChangeStatus(GoalStatus.COMPLETED) }) { Text("Завершить") }
                }
            }

            if (isSelected && contributions.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text("История пополнений", style = MaterialTheme.typography.labelLarge)
                Spacer(modifier = Modifier.height(4.dp))
                contributions.take(10).forEach { c ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 2.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(c.date.formatDate(), style = MaterialTheme.typography.bodySmall)
                        Text(
                            "+${c.amountRub.formatRub()}",
                            style = MaterialTheme.typography.bodySmall,
                            color = IncomeGreen
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun GoalFormDialog(
    editing: GoalEntity?,
    onDismiss: () -> Unit,
    onSave: (name: String, target: Long, start: Long, monthly: Long?, deadline: String?) -> Unit
) {
    var name by remember { mutableStateOf(editing?.name ?: "") }
    var target by remember { mutableStateOf(editing?.targetAmountRub?.toString() ?: "") }
    var start by remember { mutableStateOf(editing?.startAmountRub?.toString() ?: "0") }
    var monthly by remember { mutableStateOf(editing?.monthlyPlanRub?.toString() ?: "") }
    var deadline by remember { mutableStateOf(editing?.deadlineDate ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (editing != null) "Редактировать цель" else "Новая цель") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Название") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = target, onValueChange = { target = it.filter { c -> c.isDigit() } }, label = { Text("Целевая сумма (₽)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = start, onValueChange = { start = it.filter { c -> c.isDigit() } }, label = { Text("Начальная сумма (₽)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = monthly, onValueChange = { monthly = it.filter { c -> c.isDigit() } }, label = { Text("План в месяц (₽)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = deadline, onValueChange = { deadline = it }, label = { Text("Дедлайн (ГГГГ-ММ-ДД)") }, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val t = target.toLongOrNull() ?: return@TextButton
                val s = start.toLongOrNull() ?: 0L
                onSave(name, t, s, monthly.toLongOrNull(), deadline.ifBlank { null })
            }) { Text("Сохранить") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Отмена") } }
    )
}

@Composable
private fun ContributionFormDialog(
    onDismiss: () -> Unit,
    onSave: (amount: Long, date: String, comment: String) -> Unit
) {
    var amount by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(LocalDate.now().toString()) }
    var comment by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Пополнить цель") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() } }, label = { Text("Сумма (₽)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = date, onValueChange = { date = it }, label = { Text("Дата") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = comment, onValueChange = { comment = it }, label = { Text("Комментарий") }, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val a = amount.toLongOrNull() ?: return@TextButton
                if (a > 0) onSave(a, date, comment)
            }) { Text("Пополнить") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Отмена") } }
    )
}
