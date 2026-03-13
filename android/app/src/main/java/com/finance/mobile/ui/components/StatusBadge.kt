package com.finance.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.finance.mobile.domain.model.DebtStatus
import com.finance.mobile.domain.model.GoalStatus
import com.finance.mobile.ui.theme.*

@Composable
fun GoalStatusBadge(status: GoalStatus, modifier: Modifier = Modifier) {
    val (color, bgColor) = when (status) {
        GoalStatus.ACTIVE -> StatusActive to StatusActive.copy(alpha = 0.15f)
        GoalStatus.PAUSED -> StatusPaused to StatusPaused.copy(alpha = 0.15f)
        GoalStatus.COMPLETED -> StatusCompleted to StatusCompleted.copy(alpha = 0.15f)
        GoalStatus.CANCELLED -> StatusCancelled to StatusCancelled.copy(alpha = 0.15f)
    }
    Text(
        text = status.label,
        style = MaterialTheme.typography.labelSmall,
        color = color,
        modifier = modifier
            .clip(RoundedCornerShape(4.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 2.dp)
    )
}

@Composable
fun DebtStatusBadge(status: DebtStatus, modifier: Modifier = Modifier) {
    val (color, bgColor) = when (status) {
        DebtStatus.ACTIVE -> StatusActive to StatusActive.copy(alpha = 0.15f)
        DebtStatus.PAUSED -> StatusPaused to StatusPaused.copy(alpha = 0.15f)
        DebtStatus.CLOSED -> StatusCompleted to StatusCompleted.copy(alpha = 0.15f)
        DebtStatus.CANCELLED -> StatusCancelled to StatusCancelled.copy(alpha = 0.15f)
    }
    Text(
        text = status.label,
        style = MaterialTheme.typography.labelSmall,
        color = color,
        modifier = modifier
            .clip(RoundedCornerShape(4.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 2.dp)
    )
}
