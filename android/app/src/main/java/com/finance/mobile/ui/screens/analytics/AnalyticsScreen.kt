package com.finance.mobile.ui.screens.analytics

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finance.mobile.ui.components.StatCard
import com.finance.mobile.ui.theme.*
import com.finance.mobile.util.*

@Composable
fun AnalyticsScreen(
    viewModel: AnalyticsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Аналитика", style = MaterialTheme.typography.headlineMedium)
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
                Icon(Icons.Default.ChevronLeft, "Пред.")
            }
            Text(
                state.currentMonth.formatMonth(),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium
            )
            IconButton(onClick = { viewModel.setMonth(state.currentMonth.plusMonths(1)) }) {
                Icon(Icons.Default.ChevronRight, "След.")
            }
        }

        if (state.isLoading) {
            Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            Spacer(modifier = Modifier.height(8.dp))

            // Summary cards
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard("Доходы", state.incomeSum.formatRub(), IncomeGreen, Modifier.weight(1f))
                StatCard("Расходы", state.expenseSum.formatRub(), ExpenseRed, Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Net flow
            val net = state.incomeSum - state.expenseSum
            StatCard(
                "Чистый поток",
                net.formatRubSigned(),
                if (net >= 0) IncomeGreen else ExpenseRed,
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Month comparison
            MonthComparisonSection(state)

            Spacer(modifier = Modifier.height(16.dp))

            // Monthly trend (simple bar chart)
            if (state.monthlyTrend.isNotEmpty()) {
                MonthlyTrendSection(state.monthlyTrend)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Category breakdown
            if (state.categoryBreakdown.isNotEmpty()) {
                CategoryBreakdownSection(state)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Recent transactions
            if (state.recentTransactions.isNotEmpty()) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Последние операции", style = MaterialTheme.typography.titleMedium)
                        Spacer(modifier = Modifier.height(8.dp))
                        state.recentTransactions.forEach { tx ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row {
                                    Text(getCategoryEmoji(tx.categoryIconName), modifier = Modifier.padding(end = 8.dp))
                                    Column {
                                        Text(tx.categoryNameRu, style = MaterialTheme.typography.bodyMedium)
                                        Text(tx.date.formatDate(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                                val color = if (tx.type == "income") IncomeGreen else ExpenseRed
                                Text(tx.amountRub.formatRub(), style = MaterialTheme.typography.bodyMedium, color = color, fontWeight = FontWeight.Medium)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun MonthComparisonSection(state: AnalyticsState) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Сравнение с прошлым месяцем", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(12.dp))

            ComparisonRow("Доходы", state.prevIncomeSum, state.incomeSum)
            ComparisonRow("Расходы", state.prevExpenseSum, state.expenseSum)
        }
    }
}

@Composable
private fun ComparisonRow(label: String, prev: Long, current: Long) {
    val diff = current - prev
    val pct = if (prev > 0) ((diff.toFloat() / prev) * 100).toInt() else 0
    val diffColor = when {
        label == "Расходы" && diff > 0 -> ExpenseRed
        label == "Расходы" && diff < 0 -> IncomeGreen
        diff > 0 -> IncomeGreen
        diff < 0 -> ExpenseRed
        else -> MaterialTheme.colorScheme.onSurface
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium)
        Row {
            Text(
                current.formatRub(),
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
            if (diff != 0L) {
                Text(
                    " (${if (diff > 0) "+" else ""}$pct%)",
                    style = MaterialTheme.typography.bodySmall,
                    color = diffColor,
                    modifier = Modifier.padding(start = 4.dp)
                )
            }
        }
    }
}

@Composable
private fun MonthlyTrendSection(trend: List<MonthlyTrendItem>) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Тренд за 6 месяцев", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(12.dp))

            val maxVal = trend.maxOf { maxOf(it.income, it.expense) }.coerceAtLeast(1)

            trend.forEach { item ->
                val monthLabel = item.month.month.value.toString().padStart(2, '0') +
                        "." + item.month.year.toString().takeLast(2)

                Column(modifier = Modifier.padding(vertical = 4.dp)) {
                    Text(monthLabel, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(modifier = Modifier.height(2.dp))

                    // Income bar
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .height(12.dp)
                                .fillMaxWidth((item.income.toFloat() / maxVal) * 0.7f)
                                .clip(RoundedCornerShape(4.dp))
                                .background(IncomeGreen)
                        )
                        Text(
                            item.income.formatRub(),
                            style = MaterialTheme.typography.labelSmall,
                            modifier = Modifier.padding(start = 4.dp),
                            color = IncomeGreen
                        )
                    }

                    // Expense bar
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .height(12.dp)
                                .fillMaxWidth((item.expense.toFloat() / maxVal) * 0.7f)
                                .clip(RoundedCornerShape(4.dp))
                                .background(ExpenseRed)
                        )
                        Text(
                            item.expense.formatRub(),
                            style = MaterialTheme.typography.labelSmall,
                            modifier = Modifier.padding(start = 4.dp),
                            color = ExpenseRed
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CategoryBreakdownSection(state: AnalyticsState) {
    val total = state.categoryBreakdown.sumOf { it.total }.coerceAtLeast(1)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Расходы по категориям", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(12.dp))

            state.categoryBreakdown.forEach { item ->
                val pct = (item.total.toFloat() / total * 100).toInt()
                val color = try {
                    Color(android.graphics.Color.parseColor(item.categoryColor))
                } catch (_: Exception) {
                    MaterialTheme.colorScheme.primary
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Color dot
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(color)
                    )

                    Text(
                        getCategoryEmoji(item.categoryIconName),
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )

                    Column(modifier = Modifier.weight(1f)) {
                        Text(item.categoryNameRu, style = MaterialTheme.typography.bodyMedium)
                        // Mini progress bar
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .fillMaxWidth(pct / 100f)
                                    .clip(RoundedCornerShape(2.dp))
                                    .background(color)
                            )
                        }
                    }

                    Column(horizontalAlignment = Alignment.End, modifier = Modifier.padding(start = 8.dp)) {
                        Text(item.total.formatRub(), style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Medium)
                        Text("$pct%", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}
