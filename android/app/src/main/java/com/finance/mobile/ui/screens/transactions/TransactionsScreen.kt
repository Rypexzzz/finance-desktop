package com.finance.mobile.ui.screens.transactions

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finance.mobile.data.db.dao.TransactionWithCategory
import com.finance.mobile.ui.components.EmptyState
import com.finance.mobile.ui.components.StatCard
import com.finance.mobile.ui.theme.*
import com.finance.mobile.util.*

@Composable
fun TransactionsScreen(
    viewModel: TransactionsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize()) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Операции", style = MaterialTheme.typography.headlineMedium)
                Text(
                    state.currentMonth.formatMonth(),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            FilledIconButton(onClick = { viewModel.showCreateForm() }) {
                Icon(Icons.Default.Add, "Добавить")
            }
        }

        // Month navigation
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { viewModel.setMonth(state.currentMonth.minusMonths(1)) }) {
                Icon(Icons.Default.ChevronLeft, "Пред. месяц")
            }
            TextButton(onClick = { viewModel.setMonth(currentYearMonth()) }) {
                Text("Сегодня")
            }
            IconButton(onClick = { viewModel.setMonth(state.currentMonth.plusMonths(1)) }) {
                Icon(Icons.Default.ChevronRight, "След. месяц")
            }
        }

        // Stats
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            StatCard(
                label = "Доходы",
                value = state.incomeSum.formatRub(),
                valueColor = IncomeGreen,
                modifier = Modifier.weight(1f)
            )
            StatCard(
                label = "Расходы",
                value = state.expenseSum.formatRub(),
                valueColor = ExpenseRed,
                modifier = Modifier.weight(1f)
            )
        }

        // Filter chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterChip(
                selected = state.filterType == null,
                onClick = { viewModel.setFilterType(null) },
                label = { Text("Все") }
            )
            FilterChip(
                selected = state.filterType == "expense",
                onClick = { viewModel.setFilterType(if (state.filterType == "expense") null else "expense") },
                label = { Text("Расходы") }
            )
            FilterChip(
                selected = state.filterType == "income",
                onClick = { viewModel.setFilterType(if (state.filterType == "income") null else "income") },
                label = { Text("Доходы") }
            )
        }

        // Search
        OutlinedTextField(
            value = state.searchQuery,
            onValueChange = { viewModel.setSearch(it) },
            placeholder = { Text("Поиск по комментарию...") },
            leadingIcon = { Icon(Icons.Default.Search, null) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp),
            singleLine = true
        )

        // Transaction list
        if (state.isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (state.transactions.isEmpty()) {
            EmptyState(
                icon = Icons.Default.Receipt,
                title = "Нет операций",
                description = "Добавьте первую операцию, нажав кнопку +"
            )
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                items(state.transactions, key = { it.id }) { transaction ->
                    TransactionItem(
                        transaction = transaction,
                        onClick = { viewModel.showEditForm(transaction) },
                        onDelete = { viewModel.deleteTransaction(transaction.id) }
                    )
                }

                // Pagination
                if (state.totalCount > state.pageSize) {
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            TextButton(
                                onClick = { viewModel.prevPage() },
                                enabled = state.page > 0
                            ) { Text("Назад") }

                            Text(
                                "${state.page + 1} / ${(state.totalCount + state.pageSize - 1) / state.pageSize}",
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )

                            TextButton(
                                onClick = { viewModel.nextPage() },
                                enabled = (state.page + 1) * state.pageSize < state.totalCount
                            ) { Text("Вперёд") }
                        }
                    }
                }
            }
        }
    }

    // Form dialog
    if (state.showForm) {
        TransactionFormDialog(
            categories = state.categories,
            editing = state.editingTransaction,
            onDismiss = { viewModel.hideForm() },
            onSave = { type, categoryId, amount, date, comment ->
                val editing = state.editingTransaction
                if (editing != null) {
                    viewModel.updateTransaction(editing.id, type, categoryId, amount, date, comment)
                } else {
                    viewModel.createTransaction(type, categoryId, amount, date, comment)
                }
            }
        )
    }
}

@Composable
private fun TransactionItem(
    transaction: TransactionWithCategory,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    var showDeleteConfirm by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = getCategoryEmoji(transaction.categoryIconName),
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(end = 12.dp)
            )

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = transaction.categoryNameRu,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
                if (transaction.comment.isNotBlank()) {
                    Text(
                        text = transaction.comment,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = transaction.date.formatDate(),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                val color = when (transaction.type) {
                    "income" -> IncomeGreen
                    "expense" -> ExpenseRed
                    else -> ServiceBlue
                }
                val prefix = when (transaction.type) {
                    "income" -> "+"
                    "expense" -> "−"
                    else -> ""
                }
                Text(
                    text = "$prefix${transaction.amountRub.formatRub()}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = color
                )
            }

            IconButton(onClick = { showDeleteConfirm = true }) {
                Icon(
                    Icons.Default.Delete,
                    contentDescription = "Удалить",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Удалить операцию?") },
            text = { Text("Это действие нельзя отменить.") },
            confirmButton = {
                TextButton(onClick = {
                    showDeleteConfirm = false
                    onDelete()
                }) { Text("Удалить", color = ExpenseRed) }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) { Text("Отмена") }
            }
        )
    }
}
