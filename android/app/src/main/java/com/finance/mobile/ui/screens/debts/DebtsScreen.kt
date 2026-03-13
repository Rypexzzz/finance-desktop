package com.finance.mobile.ui.screens.debts

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
import com.finance.mobile.data.db.entity.DebtEntity
import com.finance.mobile.domain.model.DebtStatus
import com.finance.mobile.domain.model.DebtType
import com.finance.mobile.ui.components.*
import com.finance.mobile.ui.theme.*
import com.finance.mobile.util.*
import java.time.LocalDate

@Composable
fun DebtsScreen(
    viewModel: DebtsViewModel = hiltViewModel()
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
            Text("Долги", style = MaterialTheme.typography.headlineMedium)
            FilledIconButton(onClick = { viewModel.showCreateForm() }) {
                Icon(Icons.Default.Add, "Добавить")
            }
        }

        if (state.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (state.debts.isEmpty()) {
            EmptyState(
                icon = Icons.Default.AccountBalance,
                title = "Нет долгов",
                description = "Добавьте кредит или кредитную карту"
            )
        } else {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    label = "Всего долгов",
                    value = state.debts.size.toString(),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    label = "Активных",
                    value = state.debts.count { it.debt.status == "active" }.toString(),
                    valueColor = ExpenseRed,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            LazyColumn(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(state.debts, key = { it.debt.id }) { debtWithProgress ->
                    DebtCard(
                        item = debtWithProgress,
                        isSelected = state.selectedDebtId == debtWithProgress.debt.id,
                        onClick = {
                            viewModel.selectDebt(
                                if (state.selectedDebtId == debtWithProgress.debt.id) null
                                else debtWithProgress.debt.id
                            )
                        },
                        onEdit = { viewModel.showEditForm(debtWithProgress.debt) },
                        onAddPayment = {
                            viewModel.selectDebt(debtWithProgress.debt.id)
                            viewModel.showPaymentForm()
                        },
                        onDelete = { viewModel.deleteDebt(debtWithProgress.debt.id) },
                        onChangeStatus = { status -> viewModel.changeStatus(debtWithProgress.debt.id, status) },
                        payments = if (state.selectedDebtId == debtWithProgress.debt.id) state.payments else emptyList()
                    )
                }
            }
        }
    }

    if (state.showForm) {
        DebtFormDialog(
            editing = state.editingDebt,
            onDismiss = { viewModel.hideForm() },
            onSave = { debtType, name, initial, current, monthly, minimum, closeDate ->
                val e = state.editingDebt
                if (e != null) {
                    viewModel.updateDebt(e.id, name, debtType, initial, current, monthly, minimum, closeDate)
                } else {
                    viewModel.createDebt(debtType, name, initial, current, monthly, minimum, closeDate)
                }
            }
        )
    }

    if (state.showPaymentForm && state.selectedDebtId != null) {
        PaymentFormDialog(
            onDismiss = { viewModel.hidePaymentForm() },
            onSave = { amount, date, comment ->
                viewModel.addPayment(state.selectedDebtId!!, amount, date, comment)
            }
        )
    }
}

@Composable
private fun DebtCard(
    item: DebtWithProgress,
    isSelected: Boolean,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onAddPayment: () -> Unit,
    onDelete: () -> Unit,
    onChangeStatus: (DebtStatus) -> Unit,
    payments: List<com.finance.mobile.data.db.entity.DebtPaymentEntity>
) {
    val debt = item.debt
    val status = DebtStatus.fromValue(debt.status)
    val debtType = DebtType.fromValue(debt.debtType)
    var showDeleteConfirm by remember { mutableStateOf(false) }

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
                    Text(debt.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                    Text(debtType.label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                DebtStatusBadge(status)
            }

            Spacer(modifier = Modifier.height(12.dp))
            AnimatedProgressBar(progress = item.progress, color = ExpenseRed)
            Spacer(modifier = Modifier.height(8.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Остаток: ${debt.currentBalanceRub.formatRub()}", style = MaterialTheme.typography.bodySmall)
                Text("из ${debt.initialAmountRub.formatRub()}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text("${(item.progress * 100).toInt()}%", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold, color = Primary)
            }

            if (debt.monthlyPlanRub != null) {
                Text(
                    "План: ${debt.monthlyPlanRub.formatRub()}/мес • В этом месяце: ${item.monthlyPayments.formatRub()}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            if (isSelected && status == DebtStatus.ACTIVE) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = onAddPayment) { Text("Платёж") }
                    OutlinedButton(onClick = onEdit) { Text("Изменить") }
                    OutlinedButton(
                        onClick = { showDeleteConfirm = true },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = ExpenseRed)
                    ) { Text("Удалить") }
                }
            }

            if (isSelected && payments.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text("История платежей", style = MaterialTheme.typography.labelLarge)
                Spacer(modifier = Modifier.height(4.dp))
                payments.take(10).forEach { p ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(p.date.formatDate(), style = MaterialTheme.typography.bodySmall)
                        Text("−${p.amountRub.formatRub()}", style = MaterialTheme.typography.bodySmall, color = IncomeGreen)
                    }
                }
            }
        }
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Удалить долг?") },
            text = { Text("Все платежи по этому долгу тоже будут удалены.") },
            confirmButton = {
                TextButton(onClick = { showDeleteConfirm = false; onDelete() }) {
                    Text("Удалить", color = ExpenseRed)
                }
            },
            dismissButton = { TextButton(onClick = { showDeleteConfirm = false }) { Text("Отмена") } }
        )
    }
}

@Composable
private fun DebtFormDialog(
    editing: DebtEntity?,
    onDismiss: () -> Unit,
    onSave: (debtType: String, name: String, initial: Long, current: Long, monthly: Long?, minimum: Long?, closeDate: String?) -> Unit
) {
    var debtType by remember { mutableStateOf(editing?.debtType ?: "loan") }
    var name by remember { mutableStateOf(editing?.name ?: "") }
    var initial by remember { mutableStateOf(editing?.initialAmountRub?.toString() ?: "") }
    var current by remember { mutableStateOf(editing?.currentBalanceRub?.toString() ?: "") }
    var monthly by remember { mutableStateOf(editing?.monthlyPlanRub?.toString() ?: "") }
    var minimum by remember { mutableStateOf(editing?.minimumPaymentRub?.toString() ?: "") }
    var closeDate by remember { mutableStateOf(editing?.targetCloseDate ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (editing != null) "Редактировать долг" else "Новый долг") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = debtType == "loan", onClick = { debtType = "loan" }, label = { Text("Кредит") }, modifier = Modifier.weight(1f))
                    FilterChip(selected = debtType == "credit_card", onClick = { debtType = "credit_card" }, label = { Text("Карта") }, modifier = Modifier.weight(1f))
                }
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Название") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = initial, onValueChange = { initial = it.filter { c -> c.isDigit() } }, label = { Text("Начальная сумма (₽)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = current, onValueChange = { current = it.filter { c -> c.isDigit() } }, label = { Text("Текущий остаток (₽)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = monthly, onValueChange = { monthly = it.filter { c -> c.isDigit() } }, label = { Text("План в месяц (₽)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = minimum, onValueChange = { minimum = it.filter { c -> c.isDigit() } }, label = { Text("Мин. платёж (₽)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = closeDate, onValueChange = { closeDate = it }, label = { Text("Дата закрытия (ГГГГ-ММ-ДД)") }, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val i = initial.toLongOrNull() ?: return@TextButton
                val c = current.toLongOrNull() ?: i
                onSave(debtType, name, i, c, monthly.toLongOrNull(), minimum.toLongOrNull(), closeDate.ifBlank { null })
            }) { Text("Сохранить") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Отмена") } }
    )
}

@Composable
private fun PaymentFormDialog(
    onDismiss: () -> Unit,
    onSave: (amount: Long, date: String, comment: String) -> Unit
) {
    var amount by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(LocalDate.now().toString()) }
    var comment by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Внести платёж") },
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
            }) { Text("Оплатить") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Отмена") } }
    )
}
