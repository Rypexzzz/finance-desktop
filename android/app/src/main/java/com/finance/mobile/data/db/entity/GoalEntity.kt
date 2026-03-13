package com.finance.mobile.data.db.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "goals")
data class GoalEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    @ColumnInfo(name = "target_amount_rub") val targetAmountRub: Long,
    @ColumnInfo(name = "start_amount_rub") val startAmountRub: Long = 0,
    @ColumnInfo(name = "monthly_plan_rub") val monthlyPlanRub: Long? = null,
    @ColumnInfo(name = "deadline_date") val deadlineDate: String? = null,
    val status: String = "active",
    @ColumnInfo(name = "created_at") val createdAt: String = "",
    @ColumnInfo(name = "updated_at") val updatedAt: String = ""
)
