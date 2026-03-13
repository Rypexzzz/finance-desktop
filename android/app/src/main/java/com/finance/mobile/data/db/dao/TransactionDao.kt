package com.finance.mobile.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.finance.mobile.data.db.entity.TransactionEntity
import kotlinx.coroutines.flow.Flow

data class TransactionWithCategory(
    val id: Long,
    val type: String,
    val categoryId: Long,
    val amountRub: Long,
    val date: String,
    val comment: String,
    val createdAt: String,
    val updatedAt: String,
    val categoryCode: String,
    val categoryNameRu: String,
    val categoryIconName: String,
    val categoryColor: String
)

@Dao
interface TransactionDao {

    @Query("""
        SELECT t.id, t.type, t.category_id AS categoryId, t.amount_rub AS amountRub,
               t.date, t.comment, t.created_at AS createdAt, t.updated_at AS updatedAt,
               c.code AS categoryCode, c.name_ru AS categoryNameRu,
               c.icon_name AS categoryIconName, c.color AS categoryColor
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE (:type IS NULL OR t.type = :type)
          AND (:categoryId IS NULL OR t.category_id = :categoryId)
          AND (:dateFrom IS NULL OR t.date >= :dateFrom)
          AND (:dateTo IS NULL OR t.date <= :dateTo)
          AND (:search IS NULL OR t.comment LIKE '%' || :search || '%')
        ORDER BY t.date DESC, t.id DESC
        LIMIT :limit OFFSET :offset
    """)
    suspend fun getFiltered(
        type: String? = null,
        categoryId: Long? = null,
        dateFrom: String? = null,
        dateTo: String? = null,
        search: String? = null,
        limit: Int = 50,
        offset: Int = 0
    ): List<TransactionWithCategory>

    @Query("""
        SELECT COUNT(*) FROM transactions t
        WHERE (:type IS NULL OR t.type = :type)
          AND (:categoryId IS NULL OR t.category_id = :categoryId)
          AND (:dateFrom IS NULL OR t.date >= :dateFrom)
          AND (:dateTo IS NULL OR t.date <= :dateTo)
          AND (:search IS NULL OR t.comment LIKE '%' || :search || '%')
    """)
    suspend fun getFilteredCount(
        type: String? = null,
        categoryId: Long? = null,
        dateFrom: String? = null,
        dateTo: String? = null,
        search: String? = null
    ): Int

    @Query("""
        SELECT COALESCE(SUM(amount_rub), 0) FROM transactions
        WHERE type = :type AND date >= :dateFrom AND date <= :dateTo
    """)
    suspend fun sumByType(type: String, dateFrom: String, dateTo: String): Long

    @Insert
    suspend fun insert(transaction: TransactionEntity): Long

    @Query("""
        UPDATE transactions
        SET type = :type, category_id = :categoryId, amount_rub = :amountRub,
            date = :date, comment = :comment, updated_at = :updatedAt
        WHERE id = :id
    """)
    suspend fun update(
        id: Long, type: String, categoryId: Long,
        amountRub: Long, date: String, comment: String, updatedAt: String
    )

    @Query("DELETE FROM transactions WHERE id = :id")
    suspend fun delete(id: Long)

    @Query("SELECT * FROM transactions WHERE id = :id")
    suspend fun getById(id: Long): TransactionEntity?

    @Query("""
        SELECT COALESCE(SUM(amount_rub), 0) FROM transactions
        WHERE type = :type AND date >= :dateFrom AND date <= :dateTo
          AND (:categoryId IS NULL OR category_id = :categoryId)
    """)
    suspend fun sumByTypeAndCategory(
        type: String, dateFrom: String, dateTo: String, categoryId: Long? = null
    ): Long

    @Query("""
        SELECT c.id AS categoryId, c.code AS categoryCode, c.name_ru AS categoryNameRu,
               c.icon_name AS categoryIconName, c.color AS categoryColor,
               COALESCE(SUM(t.amount_rub), 0) AS total
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.type = :type AND t.date >= :dateFrom AND t.date <= :dateTo
        GROUP BY c.id
        ORDER BY total DESC
    """)
    suspend fun getCategoryBreakdown(
        type: String, dateFrom: String, dateTo: String
    ): List<CategoryBreakdownItem>

    @Query("""
        SELECT t.id, t.type, t.category_id AS categoryId, t.amount_rub AS amountRub,
               t.date, t.comment, t.created_at AS createdAt, t.updated_at AS updatedAt,
               c.code AS categoryCode, c.name_ru AS categoryNameRu,
               c.icon_name AS categoryIconName, c.color AS categoryColor
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.date >= :dateFrom AND t.date <= :dateTo
        ORDER BY t.date DESC, t.id DESC
        LIMIT :limit
    """)
    suspend fun getRecent(dateFrom: String, dateTo: String, limit: Int = 5): List<TransactionWithCategory>

    @Query("SELECT COUNT(*) FROM transactions")
    fun observeCount(): Flow<Int>
}

data class CategoryBreakdownItem(
    val categoryId: Long,
    val categoryCode: String,
    val categoryNameRu: String,
    val categoryIconName: String,
    val categoryColor: String,
    val total: Long
)
