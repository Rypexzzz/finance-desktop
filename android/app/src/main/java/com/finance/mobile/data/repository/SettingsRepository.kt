package com.finance.mobile.data.repository

import com.finance.mobile.data.db.dao.AppSettingsDao
import com.finance.mobile.data.db.entity.AppSettingsEntity
import kotlinx.coroutines.flow.Flow
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SettingsRepository @Inject constructor(
    private val dao: AppSettingsDao
) {
    fun observe(): Flow<AppSettingsEntity?> = dao.observe()

    suspend fun get(): AppSettingsEntity? = dao.get()

    suspend fun setTheme(theme: String) {
        val ts = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        dao.setTheme(theme, ts)
    }
}
