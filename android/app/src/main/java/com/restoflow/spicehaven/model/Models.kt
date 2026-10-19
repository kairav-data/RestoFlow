package com.restoflow.spicehaven.model

enum class SpiceLevel { MILD, MEDIUM, SPICY, EXTRA_SPICY }

enum class OrderStatus { NEW, PREPARING, READY, SERVED, CANCELLED }

data class MenuItemPairing(
    val id: String,
    val name: String,
    val price: Int,
    val imageUrl: String
)

data class MenuItem(
    val id: String,
    val name: String,
    val description: String,
    val price: Int,
    val categoryId: String,
    val imageUrl: String,
    val rating: Float,
    val reviewCount: Int,
    val isVegetarian: Boolean,
    val spiceLevel: SpiceLevel,
    val calories: Int,
    val prepTimeMinutes: Int,
    val isChefSpecial: Boolean = false,
    val isBestSeller: Boolean = false,
    val isMostOrdered: Boolean = false,
    val isAvailable: Boolean = true,
    val allergens: List<String> = emptyList(),
    val whyCustomersLoveIt: List<String> = emptyList(),
    val pairings: List<MenuItemPairing> = emptyList()
)

data class MenuCategory(
    val id: String,
    val name: String,
    val itemCount: Int,
    val imageUrl: String
)

data class OrderItem(
    val id: String,
    val menuItem: MenuItem,
    val quantity: Int,
    val selectedPairings: List<MenuItemPairing> = emptyList()
)

data class Order(
    val id: String,
    val orderNumber: String,
    val tableNumber: String,
    val items: List<OrderItem>,
    val subtotal: Int,
    val total: Int,
    val status: OrderStatus,
    val createdAt: String
)
