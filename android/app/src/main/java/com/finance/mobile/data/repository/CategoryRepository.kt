package com.finance.mobile.data.repository

import com.finance.mobile.data.db.dao.CategoryDao
import com.finance.mobile.data.db.entity.CategoryEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CategoryRepository @Inject constructor(
    private val dao: CategoryDao
) {
    fun observeAll(): Flow<List<CategoryEntity>> = dao.observeAll()

    fun observeByType(type: String): Flow<List<CategoryEntity>> = dao.observeByType(type)

    suspend fun getAll(): List<CategoryEntity> = dao.getAll()

    suspend fun getByType(type: String): List<CategoryEntity> = dao.getByType(type)

    suspend fun getById(id: Long): CategoryEntity? = dao.getById(id)
}
