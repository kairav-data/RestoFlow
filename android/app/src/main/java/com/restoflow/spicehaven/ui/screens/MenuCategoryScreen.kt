package com.restoflow.spicehaven.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.restoflow.spicehaven.data.SampleData
import com.restoflow.spicehaven.model.MenuItem
import com.restoflow.spicehaven.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MenuCategoryScreen(
    onBack: () -> Unit,
    onDishClick: (MenuItem) -> Unit,
    onAddToCart: (MenuItem) -> Unit,
    onOpenCart: () -> Unit,
    cartItemCount: Int
) {
    var selectedDietary by remember { mutableStateOf("all") }

    val filteredList = remember(selectedDietary) {
        when (selectedDietary) {
            "veg" -> SampleData.MenuList.filter { it.isVegetarian }
            "non-veg" -> SampleData.MenuList.filter { !it.isVegetarian }
            else -> SampleData.MenuList
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Main Course", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.White)
                    }
                    Box(modifier = Modifier.padding(end = 8.dp)) {
                        IconButton(onClick = onOpenCart) {
                            Icon(Icons.Default.ShoppingBag, contentDescription = "Cart", tint = Color.White)
                        }
                        if (cartItemCount > 0) {
                            Badge(
                                containerColor = BrandGold,
                                contentColor = DarkObsidian,
                                modifier = Modifier.align(Alignment.TopEnd).offset(x = (-4).dp, y = 4.dp)
                            ) {
                                Text("$cartItemCount", fontWeight = FontWeight.Black, fontSize = 10.sp)
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkObsidian)
            )
        },
        containerColor = BackgroundCream
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Quick Filter Row (All, Veg, Non-Veg)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = selectedDietary == "all",
                    onClick = { selectedDietary = "all" },
                    label = { Text("All (${SampleData.MenuList.size})", fontWeight = FontWeight.Bold, fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = BrandLightTint,
                        selectedLabelColor = DarkObsidian
                    )
                )

                FilterChip(
                    selected = selectedDietary == "veg",
                    onClick = { selectedDietary = "veg" },
                    label = { Text("🌱 Veg (2)", fontWeight = FontWeight.Bold, fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFFD1FAE5),
                        selectedLabelColor = VegGreen
                    )
                )

                FilterChip(
                    selected = selectedDietary == "non-veg",
                    onClick = { selectedDietary = "non-veg" },
                    label = { Text("🍗 Non-Veg (3)", fontWeight = FontWeight.Bold, fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFFFFE4E6),
                        selectedLabelColor = NonVegRed
                    )
                )
            }

            // Dish List (Reference 1 Screen 2)
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredList) { dish ->
                    DishListItemCard(
                        dish = dish,
                        onClick = { onDishClick(dish) },
                        onAdd = { onAddToCart(dish) }
                    )
                }

                item { Spacer(Modifier.height(40.dp)) }
            }
        }
    }
}

@Composable
fun DishListItemCard(dish: MenuItem, onClick: () -> Unit, onAdd: () -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Food Image
            Box(
                modifier = Modifier
                    .size(90.dp)
                    .clip(RoundedCornerShape(12.dp))
            ) {
                AsyncImage(
                    model = dish.imageUrl,
                    contentDescription = dish.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                // Veg/Non-Veg dot
                Box(
                    modifier = Modifier
                        .padding(4.dp)
                        .size(14.dp)
                        .background(Color.White.copy(alpha = 0.9f), RoundedCornerShape(2.dp))
                        .align(Alignment.TopStart),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .background(if (dish.isVegetarian) VegGreen else NonVegRed, CircleShape)
                    )
                }
            }

            // Details
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(dish.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextPrimary)
                        Text("₹${dish.price}", fontWeight = FontWeight.Black, fontSize = 14.sp, color = TextPrimary)
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(top = 2.dp)
                    ) {
                        Icon(Icons.Default.Star, null, tint = BrandGold, modifier = Modifier.size(12.dp))
                        Text(
                            " ${dish.rating} (${dish.reviewCount} orders)",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }

                    Text(
                        dish.description,
                        fontSize = 11.sp,
                        color = TextSecondary,
                        maxLines = 2,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = if (dish.isVegetarian) Color(0xFFECFDF5) else Color(0xFFFFF1F2),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            if (dish.isVegetarian) "Pure Veg" else "Non-Veg",
                            color = if (dish.isVegetarian) VegGreen else NonVegRed,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(30.dp)
                            .background(BrandGold, CircleShape)
                            .clickable { onAdd() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Add, null, tint = DarkObsidian, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }
}
