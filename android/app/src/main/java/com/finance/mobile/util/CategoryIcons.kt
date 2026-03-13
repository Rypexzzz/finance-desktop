package com.finance.mobile.util

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.ui.graphics.vector.ImageVector

fun getCategoryIcon(iconName: String): ImageVector = when (iconName) {
    "shopping-cart" -> Icons.Default.ShoppingCart
    "utensils" -> Icons.Default.Restaurant
    "car" -> Icons.Default.DirectionsCar
    "taxi" -> Icons.Default.LocalTaxi
    "home" -> Icons.Default.Home
    "bolt" -> Icons.Default.Bolt
    "smartphone" -> Icons.Default.Smartphone
    "wifi" -> Icons.Default.Wifi
    "package" -> Icons.Default.Inventory2
    "shirt" -> Icons.Default.Checkroom
    "pill" -> Icons.Default.Medication
    "hospital" -> Icons.Default.LocalHospital
    "spray-can" -> Icons.Default.CleaningServices
    "film" -> Icons.Default.Movie
    "play-circle" -> Icons.Default.PlayCircle
    "gift" -> Icons.Default.CardGiftcard
    "plane" -> Icons.Default.Flight
    "dumbbell" -> Icons.Default.FitnessCenter
    "wrench" -> Icons.Default.Build
    "circle-help" -> Icons.Default.HelpOutline
    "wallet" -> Icons.Default.AccountBalanceWallet
    "laptop" -> Icons.Default.Laptop
    "building-2" -> Icons.Default.Business
    "coins" -> Icons.Default.Savings
    "rotate-ccw" -> Icons.Default.Replay
    "target" -> Icons.Default.TrackChanges
    "landmark" -> Icons.Default.AccountBalance
    "credit-card" -> Icons.Default.CreditCard
    else -> Icons.Default.Category
}

fun getCategoryEmoji(iconName: String): String = when (iconName) {
    "shopping-cart" -> "🛒"
    "utensils" -> "🍴"
    "car" -> "🚗"
    "taxi" -> "🚕"
    "home" -> "🏠"
    "bolt" -> "⚡"
    "smartphone" -> "📱"
    "wifi" -> "📶"
    "package" -> "📦"
    "shirt" -> "👕"
    "pill" -> "💊"
    "hospital" -> "🏥"
    "spray-can" -> "🧹"
    "film" -> "🎬"
    "play-circle" -> "▶️"
    "gift" -> "🎁"
    "plane" -> "✈️"
    "dumbbell" -> "💪"
    "wrench" -> "🔧"
    "circle-help" -> "❓"
    "wallet" -> "👛"
    "laptop" -> "💻"
    "building-2" -> "🏢"
    "coins" -> "🪙"
    "rotate-ccw" -> "🔄"
    "target" -> "🎯"
    "landmark" -> "🏦"
    "credit-card" -> "💳"
    else -> "📌"
}
