package com.finance.mobile.data.db.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "debt_payments",
    foreignKeys = [
        ForeignKey(
            entity = DebtEntity::class,
            parentColumns = ["id"],
            childColumns = ["debt_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = TransactionEntity::class,
            parentColumns = ["id"],
            childColumns = ["transaction_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index("debt_id", "date"),
        Index(value = ["transaction_id"], unique = true)
    ]
)
data class DebtPaymentEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "debt_id") val debtId: Long,
    @ColumnInfo(name = "transaction_id") val transactionId: Long,
    @ColumnInfo(name = "amount_rub") val amountRub: Long,
    val date: String,
    @ColumnInfo(name = "balance_before_rub") val balanceBeforeRub: Long,
    @ColumnInfo(name = "balance_after_rub") val balanceAfterRub: Long,
    val comment: String = "",
    @ColumnInfo(name = "created_at") val createdAt: String = ""
)
