package com.finance.mobile.data.db.dao

import androidx.room.Dao
import androidx.room.Query
import com.finance.mobile.data.db.entity.AppSettingsEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AppSettingsDao {
    @Query("SELECT * FROM app_settings WHERE id = 1")
    fun observe(): Flow<AppSettingsEntity?>

    @Query("SELECT * FROM app_settings WHERE id = 1")
    suspend fun get(): AppSettingsEntity?

    @Query("UPDATE app_settings SET theme = :theme, updated_at = :updatedAt WHERE id = 1")
    suspend fun setTheme(theme: String, updatedAt: String)
}
