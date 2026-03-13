package com.finance.mobile.data.repository

import com.finance.mobile.data.db.dao.GoalDao
import com.finance.mobile.data.db.dao.TransactionDao
import com.finance.mobile.data.db.entity.GoalContributionEntity
import com.finance.mobile.data.db.entity.GoalEntity
import com.finance.mobile.data.db.entity.TransactionEntity
import kotlinx.coroutines.flow.Flow
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GoalRepository @Inject constructor(
    private val goalDao: GoalDao,
    private val transactionDao: TransactionDao
) {
    private val now get() = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)

    fun observeAll(): Flow<List<GoalEntity>> = goalDao.observeAll()

    suspend fun getAll() = goalDao.getAll()

    suspend fun getById(id: Long) = goalDao.getById(id)

    suspend fun create(
        name: String, targetAmountRub: Long, startAmountRub: Long,
        monthlyPlanRub: Long?, deadlineDate: String?
    ): Long {
        val ts = now
        return goalDao.insert(
            GoalEntity(
                name = name, targetAmountRub = targetAmountRub,
                startAmountRub = startAmountRub, monthlyPlanRub = monthlyPlanRub,
                deadlineDate = deadlineDate, createdAt = ts, updatedAt = ts
            )
        )
    }

    suspend fun update(
        id: Long, name: String, targetAmountRub: Long, startAmountRub: Long,
        monthlyPlanRub: Long?, deadlineDate: String?
    ) = goalDao.update(id, name, targetAmountRub, startAmountRub, monthlyPlanRub, deadlineDate, now)

    suspend fun changeStatus(id: Long, status: String) =
        goalDao.changeStatus(id, status, now)

    suspend fun delete(id: Long) = goalDao.delete(id)

    suspend fun getTotalContributions(goalId: Long) = goalDao.getTotalContributions(goalId)

    suspend fun getMonthlyContributions(goalId: Long, dateFrom: String, dateTo: String) =
        goalDao.getMonthlyContributions(goalId, dateFrom, dateTo)

    suspend fun getContributions(goalId: Long, limit: Int = 50, offset: Int = 0) =
        goalDao.getContributions(goalId, limit, offset)

    suspend fun getContributionsCount(goalId: Long) = goalDao.getContributionsCount(goalId)

    suspend fun addContribution(
        goalId: Long, amountRub: Long, date: String, comment: String,
        serviceCategoryId: Long
    ) {
        val ts = now
        val txId = transactionDao.insert(
            TransactionEntity(
                type = "service", categoryId = serviceCategoryId,
                amountRub = amountRub, date = date,
                comment = comment.ifEmpty { "Пополнение цели" },
                createdAt = ts, updatedAt = ts
            )
        )
        goalDao.insertContribution(
            GoalContributionEntity(
                goalId = goalId, transactionId = txId,
                amountRub = amountRub, date = date,
                comment = comment, createdAt = ts
            )
        )
    }
}
