package com.finance.mobile.data.db.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "debts")
data class DebtEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "debt_type") val debtType: String,
    val name: String,
    @ColumnInfo(name = "initial_amount_rub") val initialAmountRub: Long,
    @ColumnInfo(name = "current_balance_rub") val currentBalanceRub: Long,
    @ColumnInfo(name = "monthly_plan_rub") val monthlyPlanRub: Long? = null,
    @ColumnInfo(name = "minimum_payment_rub") val minimumPaymentRub: Long? = null,
    @ColumnInfo(name = "target_close_date") val targetCloseDate: String? = null,
    val status: String = "active",
    @ColumnInfo(name = "created_at") val createdAt: String = "",
    @ColumnInfo(name = "updated_at") val updatedAt: String = ""
)
