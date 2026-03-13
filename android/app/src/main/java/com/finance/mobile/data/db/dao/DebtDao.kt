package com.finance.mobile.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.finance.mobile.data.db.entity.DebtEntity
import com.finance.mobile.data.db.entity.DebtPaymentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DebtDao {

    @Query("SELECT * FROM debts ORDER BY created_at DESC")
    fun observeAll(): Flow<List<DebtEntity>>

    @Query("SELECT * FROM debts ORDER BY created_at DESC")
    suspend fun getAll(): List<DebtEntity>

    @Query("SELECT * FROM debts WHERE id = :id")
    suspend fun getById(id: Long): DebtEntity?

    @Insert
    suspend fun insert(debt: DebtEntity): Long

    @Query("""
        UPDATE debts
        SET name = :name, debt_type = :debtType,
            initial_amount_rub = :initialAmountRub, current_balance_rub = :currentBalanceRub,
            monthly_plan_rub = :monthlyPlanRub, minimum_payment_rub = :minimumPaymentRub,
            target_close_date = :targetCloseDate, updated_at = :updatedAt
        WHERE id = :id
    """)
    suspend fun update(
        id: Long, name: String, debtType: String,
        initialAmountRub: Long, currentBalanceRub: Long,
        monthlyPlanRub: Long?, minimumPaymentRub: Long?,
        targetCloseDate: String?, updatedAt: String
    )

    @Query("UPDATE debts SET status = :status, updated_at = :updatedAt WHERE id = :id")
    suspend fun changeStatus(id: Long, status: String, updatedAt: String)

    @Query("UPDATE debts SET current_balance_rub = :balance, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateBalance(id: Long, balance: Long, updatedAt: String)

    @Query("DELETE FROM debts WHERE id = :id")
    suspend fun delete(id: Long)

    @Query("SELECT COALESCE(SUM(amount_rub), 0) FROM debt_payments WHERE debt_id = :debtId")
    suspend fun getTotalPayments(debtId: Long): Long

    @Query("""
        SELECT COALESCE(SUM(amount_rub), 0) FROM debt_payments
        WHERE debt_id = :debtId AND date >= :dateFrom AND date <= :dateTo
    """)
    suspend fun getMonthlyPayments(debtId: Long, dateFrom: String, dateTo: String): Long

    @Query("""
        SELECT * FROM debt_payments
        WHERE debt_id = :debtId
        ORDER BY date DESC
        LIMIT :limit OFFSET :offset
    """)
    suspend fun getPayments(debtId: Long, limit: Int = 50, offset: Int = 0): List<DebtPaymentEntity>

    @Query("SELECT COUNT(*) FROM debt_payments WHERE debt_id = :debtId")
    suspend fun getPaymentsCount(debtId: Long): Int

    @Insert
    suspend fun insertPayment(payment: DebtPaymentEntity): Long
}
