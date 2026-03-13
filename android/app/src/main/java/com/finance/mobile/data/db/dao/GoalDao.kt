package com.finance.mobile.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.finance.mobile.data.db.entity.GoalContributionEntity
import com.finance.mobile.data.db.entity.GoalEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface GoalDao {

    @Query("SELECT * FROM goals ORDER BY created_at DESC")
    fun observeAll(): Flow<List<GoalEntity>>

    @Query("SELECT * FROM goals ORDER BY created_at DESC")
    suspend fun getAll(): List<GoalEntity>

    @Query("SELECT * FROM goals WHERE id = :id")
    suspend fun getById(id: Long): GoalEntity?

    @Insert
    suspend fun insert(goal: GoalEntity): Long

    @Query("""
        UPDATE goals
        SET name = :name, target_amount_rub = :targetAmountRub,
            start_amount_rub = :startAmountRub, monthly_plan_rub = :monthlyPlanRub,
            deadline_date = :deadlineDate, updated_at = :updatedAt
        WHERE id = :id
    """)
    suspend fun update(
        id: Long, name: String, targetAmountRub: Long,
        startAmountRub: Long, monthlyPlanRub: Long?,
        deadlineDate: String?, updatedAt: String
    )

    @Query("UPDATE goals SET status = :status, updated_at = :updatedAt WHERE id = :id")
    suspend fun changeStatus(id: Long, status: String, updatedAt: String)

    @Query("DELETE FROM goals WHERE id = :id")
    suspend fun delete(id: Long)

    @Query("SELECT COALESCE(SUM(amount_rub), 0) FROM goal_contributions WHERE goal_id = :goalId")
    suspend fun getTotalContributions(goalId: Long): Long

    @Query("""
        SELECT COALESCE(SUM(amount_rub), 0) FROM goal_contributions
        WHERE goal_id = :goalId AND date >= :dateFrom AND date <= :dateTo
    """)
    suspend fun getMonthlyContributions(goalId: Long, dateFrom: String, dateTo: String): Long

    @Query("""
        SELECT * FROM goal_contributions
        WHERE goal_id = :goalId
        ORDER BY date DESC
        LIMIT :limit OFFSET :offset
    """)
    suspend fun getContributions(goalId: Long, limit: Int = 50, offset: Int = 0): List<GoalContributionEntity>

    @Query("SELECT COUNT(*) FROM goal_contributions WHERE goal_id = :goalId")
    suspend fun getContributionsCount(goalId: Long): Int

    @Insert
    suspend fun insertContribution(contribution: GoalContributionEntity): Long
}
