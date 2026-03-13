package com.finance.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.finance.mobile.ui.navigation.Screen
import com.finance.mobile.ui.screens.analytics.AnalyticsScreen
import com.finance.mobile.ui.screens.debts.DebtsScreen
import com.finance.mobile.ui.screens.goals.GoalsScreen
import com.finance.mobile.ui.screens.settings.SettingsScreen
import com.finance.mobile.ui.screens.settings.SettingsViewModel
import com.finance.mobile.ui.screens.transactions.TransactionsScreen
import com.finance.mobile.ui.theme.FinanceTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val settingsViewModel: SettingsViewModel = hiltViewModel()
            val themeSettings by settingsViewModel.theme.collectAsStateWithLifecycle()

            val isDark = when (themeSettings) {
                "dark" -> true
                "light" -> false
                else -> isSystemInDarkTheme()
            }

            FinanceTheme(darkTheme = isDark) {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomTabs = listOf(
        Screen.TRANSACTIONS,
        Screen.ANALYTICS,
        Screen.GOALS,
        Screen.DEBTS,
        Screen.SETTINGS
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                bottomTabs.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            if (currentRoute != screen.route) {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.startDestinationId) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.TRANSACTIONS.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.TRANSACTIONS.route) { TransactionsScreen() }
            composable(Screen.ANALYTICS.route) { AnalyticsScreen() }
            composable(Screen.GOALS.route) { GoalsScreen() }
            composable(Screen.DEBTS.route) { DebtsScreen() }
            composable(Screen.SETTINGS.route) { SettingsScreen() }
        }
    }
}
