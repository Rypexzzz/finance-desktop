package com.finance.mobile.data.db.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val code: String,
    @ColumnInfo(name = "name_ru") val nameRu: String,
    val type: String,
    @ColumnInfo(name = "icon_name") val iconName: String,
    val color: String,
    @ColumnInfo(name = "is_service") val isService: Int = 0,
    @ColumnInfo(name = "sort_order") val sortOrder: Int = 0,
    @ColumnInfo(name = "is_active") val isActive: Int = 1
)
