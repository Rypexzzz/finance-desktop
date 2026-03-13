package com.finance.mobile.data.repository

import com.finance.mobile.data.db.dao.CategoryBreakdownItem
import com.finance.mobile.data.db.dao.TransactionDao
import com.finance.mobile.data.db.dao.TransactionWithCategory
import com.finance.mobile.data.db.entity.TransactionEntity
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TransactionRepository @Inject constructor(
    private val dao: TransactionDao
) {
    private val now get() = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)

    suspend fun getFiltered(
        type: String? = null,
        categoryId: Long? = null,
        dateFrom: String? = null,
        dateTo: String? = null,
        search: String? = null,
        limit: Int = 50,
        offset: Int = 0
    ): List<TransactionWithCategory> =
        dao.getFiltered(type, categoryId, dateFrom, dateTo, search, limit, offset)

    suspend fun getFilteredCount(
        type: String? = null,
        categoryId: Long? = null,
        dateFrom: String? = null,
        dateTo: String? = null,
        search: String? = null
    ): Int = dao.getFilteredCount(type, categoryId, dateFrom, dateTo, search)

    suspend fun create(
        type: String, categoryId: Long, amountRub: Long, date: String, comment: String
    ): Long {
        val ts = now
        return dao.insert(
            TransactionEntity(
                type = type, categoryId = categoryId, amountRub = amountRub,
                date = date, comment = comment, createdAt = ts, updatedAt = ts
            )
        )
    }

    suspend fun update(
        id: Long, type: String, categoryId: Long, amountRub: Long, date: String, comment: String
    ) = dao.update(id, type, categoryId, amountRub, date, comment, now)

    suspend fun delete(id: Long) = dao.delete(id)

    suspend fun sumByType(type: String, dateFrom: String, dateTo: String): Long =
        dao.sumByType(type, dateFrom, dateTo)

    suspend fun getCategoryBreakdown(
        type: String, dateFrom: String, dateTo: String
    ): List<CategoryBreakdownItem> = dao.getCategoryBreakdown(type, dateFrom, dateTo)

    suspend fun getRecent(dateFrom: String, dateTo: String, limit: Int = 5) =
        dao.getRecent(dateFrom, dateTo, limit)

    fun observeCount() = dao.observeCount()
}
