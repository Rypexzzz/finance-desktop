package com.finance.mobile.ui.screens.transactions

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.finance.mobile.data.db.dao.TransactionWithCategory
import com.finance.mobile.data.db.entity.CategoryEntity
import com.finance.mobile.util.getCategoryEmoji
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransactionFormDialog(
    categories: List<CategoryEntity>,
    editing: TransactionWithCategory?,
    onDismiss: () -> Unit,
    onSave: (type: String, categoryId: Long, amount: Long, date: String, comment: String) -> Unit
) {
    var type by remember { mutableStateOf(editing?.type ?: "expense") }
    var categoryId by remember { mutableLongStateOf(editing?.categoryId ?: 0L) }
    var amount by remember { mutableStateOf(editing?.amountRub?.toString() ?: "") }
    var date by remember { mutableStateOf(editing?.date ?: LocalDate.now().toString()) }
    var comment by remember { mutableStateOf(editing?.comment ?: "") }
    var amountError by remember { mutableStateOf(false) }
    var categoryError by remember { mutableStateOf(false) }

    val filteredCategories = categories.filter { it.type == type }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (editing != null) "Редактировать" else "Новая операция") },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Type selector
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("expense" to "Расход", "income" to "Доход").forEach { (value, label) ->
                        FilterChip(
                            selected = type == value,
                            onClick = {
                                type = value
                                categoryId = 0L
                            },
                            label = { Text(label) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Category dropdown
                var categoryExpanded by remember { mutableStateOf(false) }
                val selectedCategory = filteredCategories.find { it.id == categoryId }

                ExposedDropdownMenuBox(
                    expanded = categoryExpanded,
                    onExpandedChange = { categoryExpanded = it }
                ) {
                    OutlinedTextField(
                        value = selectedCategory?.let {
                            "${getCategoryEmoji(it.iconName)} ${it.nameRu}"
                        } ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Категория") },
                        isError = categoryError,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryExpanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = categoryExpanded,
                        onDismissRequest = { categoryExpanded = false }
                    ) {
                        filteredCategories.forEach { cat ->
                            DropdownMenuItem(
                                text = { Text("${getCategoryEmoji(cat.iconName)} ${cat.nameRu}") },
                                onClick = {
                                    categoryId = cat.id
                                    categoryExpanded = false
                                    categoryError = false
                                }
                            )
                        }
                    }
                }

                // Amount
                OutlinedTextField(
                    value = amount,
                    onValueChange = {
                        amount = it.filter { c -> c.isDigit() }
                        amountError = false
                    },
                    label = { Text("Сумма (₽)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    isError = amountError,
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                // Date
                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it },
                    label = { Text("Дата (ГГГГ-ММ-ДД)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                // Comment
                OutlinedTextField(
                    value = comment,
                    onValueChange = { comment = it },
                    label = { Text("Комментарий") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val amountLong = amount.toLongOrNull()
                if (amountLong == null || amountLong <= 0) {
                    amountError = true
                    return@TextButton
                }
                if (categoryId == 0L) {
                    categoryError = true
                    return@TextButton
                }
                onSave(type, categoryId, amountLong, date, comment)
            }) {
                Text("Сохранить")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Отмена") }
        }
    )
}
