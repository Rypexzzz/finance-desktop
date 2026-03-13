package com.finance.mobile.data.repository

import com.finance.mobile.data.db.dao.DebtDao
import com.finance.mobile.data.db.dao.TransactionDao
import com.finance.mobile.data.db.entity.DebtEntity
import com.finance.mobile.data.db.entity.DebtPaymentEntity
import com.finance.mobile.data.db.entity.TransactionEntity
import kotlinx.coroutines.flow.Flow
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DebtRepository @Inject constructor(
    private val debtDao: DebtDao,
    private val transactionDao: TransactionDao
) {
    private val now get() = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)

    fun observeAll(): Flow<List<DebtEntity>> = debtDao.observeAll()

    suspend fun getAll() = debtDao.getAll()

    suspend fun getById(id: Long) = debtDao.getById(id)

    suspend fun create(
        debtType: String, name: String, initialAmountRub: Long,
        currentBalanceRub: Long, monthlyPlanRub: Long?,
        minimumPaymentRub: Long?, targetCloseDate: String?
    ): Long {
        val ts = now
        return debtDao.insert(
            DebtEntity(
                debtType = debtType, name = name,
                initialAmountRub = initialAmountRub,
                currentBalanceRub = currentBalanceRub,
                monthlyPlanRub = monthlyPlanRub,
                minimumPaymentRub = minimumPaymentRub,
                targetCloseDate = targetCloseDate,
                createdAt = ts, updatedAt = ts
            )
        )
    }

    suspend fun update(
        id: Long, name: String, debtType: String,
        initialAmountRub: Long, currentBalanceRub: Long,
        monthlyPlanRub: Long?, minimumPaymentRub: Long?,
        targetCloseDate: String?
    ) = debtDao.update(
        id, name, debtType, initialAmountRub, currentBalanceRub,
        monthlyPlanRub, minimumPaymentRub, targetCloseDate, now
    )

    suspend fun changeStatus(id: Long, status: String) =
        debtDao.changeStatus(id, status, now)

    suspend fun delete(id: Long) = debtDao.delete(id)

    suspend fun getTotalPayments(debtId: Long) = debtDao.getTotalPayments(debtId)

    suspend fun getMonthlyPayments(debtId: Long, dateFrom: String, dateTo: String) =
        debtDao.getMonthlyPayments(debtId, dateFrom, dateTo)

    suspend fun getPayments(debtId: Long, limit: Int = 50, offset: Int = 0) =
        debtDao.getPayments(debtId, limit, offset)

    suspend fun getPaymentsCount(debtId: Long) = debtDao.getPaymentsCount(debtId)

    suspend fun addPayment(
        debtId: Long, amountRub: Long, date: String, comment: String,
        serviceCategoryId: Long
    ) {
        val ts = now
        val debt = debtDao.getById(debtId) ?: return
        val balanceBefore = debt.currentBalanceRub
        val balanceAfter = (balanceBefore - amountRub).coerceAtLeast(0)

        val txId = transactionDao.insert(
            TransactionEntity(
                type = "service", categoryId = serviceCategoryId,
                amountRub = amountRub, date = date,
                comment = comment.ifEmpty { "Платёж по долгу" },
                createdAt = ts, updatedAt = ts
            )
        )

        debtDao.insertPayment(
            DebtPaymentEntity(
                debtId = debtId, transactionId = txId,
                amountRub = amountRub, date = date,
                balanceBeforeRub = balanceBefore,
                balanceAfterRub = balanceAfter,
                comment = comment, createdAt = ts
            )
        )

        debtDao.updateBalance(debtId, balanceAfter, ts)

        if (balanceAfter == 0L) {
            debtDao.changeStatus(debtId, "closed", ts)
        }
    }
}
