package com.restoflow.spicehaven.data

import com.restoflow.spicehaven.model.*

object SampleData {
    val Categories = listOf(
        MenuCategory("starters", "Starters", 28, "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300"),
        MenuCategory("main-course", "Main Course", 42, "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300"),
        MenuCategory("biryani-rice", "Biryani & Rice", 14, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300"),
        MenuCategory("breads", "Breads", 12, "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300"),
        MenuCategory("soups-salads", "Soups & Salads", 10, "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300"),
        MenuCategory("desserts", "Desserts", 16, "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300")
    )

    val GarlicNaan = MenuItem(
        id = "garlic-naan",
        name = "Garlic Naan",
        description = "Leavened flatbread brushed with garlic butter and fresh coriander.",
        price = 90,
        categoryId = "breads",
        imageUrl = "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
        rating = 4.8f,
        reviewCount = 980,
        isVegetarian = true,
        spiceLevel = SpiceLevel.MILD,
        calories = 220,
        prepTimeMinutes = 5,
        isBestSeller = true
    )

    val JeeraRice = MenuItem(
        id = "jeera-rice",
        name = "Jeera Rice",
        description = "Fragrant aged basmati rice tempered with ghee and roasted cumin.",
        price = 140,
        categoryId = "biryani-rice",
        imageUrl = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
        rating = 4.7f,
        reviewCount = 820,
        isVegetarian = true,
        spiceLevel = SpiceLevel.MILD,
        calories = 260,
        prepTimeMinutes = 6
    )

    val ButterChicken = MenuItem(
        id = "butter-chicken",
        name = "Butter Chicken",
        description = "Rich, creamy and full of authentic flavors. Tender grilled chicken in a silky tomato gravy with aromatic spices.",
        price = 340,
        categoryId = "main-course",
        imageUrl = "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600",
        rating = 4.8f,
        reviewCount = 1240,
        isVegetarian = false,
        spiceLevel = SpiceLevel.MEDIUM,
        calories = 520,
        prepTimeMinutes = 15,
        isChefSpecial = true,
        isBestSeller = true,
        isMostOrdered = true,
        whyCustomersLoveIt = listOf(
            "Our most ordered signature North Indian main course",
            "Perfect balance of creamy, smoky, and aromatic spices",
            "Pairs exceptionally well with butter garlic naan or jeera rice"
        ),
        pairings = listOf(
            MenuItemPairing("garlic-naan", "Garlic Naan", 90, GarlicNaan.imageUrl),
            MenuItemPairing("jeera-rice", "Jeera Rice", 140, JeeraRice.imageUrl)
        )
    )

    val PaneerTikka = MenuItem(
        id = "paneer-tikka",
        name = "Paneer Tikka",
        description = "Cottage cheese cubes marinated in spiced yogurt with bell peppers and roasted in the clay tandoor.",
        price = 280,
        categoryId = "starters",
        imageUrl = "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600",
        rating = 4.8f,
        reviewCount = 1520,
        isVegetarian = true,
        spiceLevel = SpiceLevel.MEDIUM,
        calories = 380,
        prepTimeMinutes = 12,
        isChefSpecial = true,
        isBestSeller = true
    )

    val ChickenBiryani = MenuItem(
        id = "chicken-biryani",
        name = "Chicken Biryani",
        description = "Aromatic long-grain basmati rice layered with spiced marinated chicken, saffron and caramelised onions.",
        price = 320,
        categoryId = "biryani-rice",
        imageUrl = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
        rating = 4.7f,
        reviewCount = 980,
        isVegetarian = false,
        spiceLevel = SpiceLevel.MEDIUM,
        calories = 640,
        prepTimeMinutes = 18,
        isMostOrdered = true
    )

    val MenuList = listOf(ButterChicken, PaneerTikka, ChickenBiryani, GarlicNaan, JeeraRice)
}
