package com.finance.mobile.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

enum class Screen(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    TRANSACTIONS("transactions", "Операции", Icons.Default.Receipt),
    ANALYTICS("analytics", "Аналитика", Icons.Default.BarChart),
    GOALS("goals", "Цели", Icons.Default.TrackChanges),
    DEBTS("debts", "Долги", Icons.Default.AccountBalance),
    SETTINGS("settings", "Настройки", Icons.Default.Settings)
}
