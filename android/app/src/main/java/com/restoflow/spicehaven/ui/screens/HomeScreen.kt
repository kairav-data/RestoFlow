package com.restoflow.spicehaven.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
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
fun CustomerHomeScreen(
    onNavigateMenu: () -> Unit,
    onNavigateHelpMeChoose: () -> Unit,
    onNavigatePopular: () -> Unit,
    onDishClick: (MenuItem) -> Unit,
    onAddToCart: (MenuItem) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "SPICEHAVEN",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            letterSpacing = 2.sp
                        )
                        Text(
                            text = "RESTAURANT • ANDHERI",
                            style = MaterialTheme.typography.labelSmall,
                            color = BrandGold,
                            letterSpacing = 1.sp
                        )
                    }
                },
                actions = {
                    Surface(
                        color = Color.White.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.padding(end = 8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Icon(
                                Icons.Default.Place,
                                contentDescription = null,
                                tint = BrandGold,
                                modifier = Modifier.size(12.dp)
                            )
                            Spacer(Modifier.width(4.dp))
                            Text(
                                "Table T12",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkObsidian)
            )
        },
        containerColor = BackgroundCream
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { Spacer(Modifier.height(4.dp)) }

            // Hero Card
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkObsidian),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(modifier = Modifier.fillMaxWidth().height(160.dp)) {
                        AsyncImage(
                            model = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize().alpha(0.35f)
                        )
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Star, null, tint = BrandGold, modifier = Modifier.size(14.dp))
                                    Spacer(Modifier.width(4.dp))
                                    Text("4.8 (234 reviews)", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                                Text("Open: 11:30 AM - 11:30 PM", color = BrandGold, fontSize = 10.sp)
                            }
                            Column {
                                Text(
                                    "Good Food Brings People Together",
                                    color = Color.White,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    lineHeight = 22.sp
                                )
                                Spacer(Modifier.height(4.dp))
                                Text(
                                    "Fresh Ingredients • Authentic Flavors • Great Times",
                                    color = Color.LightGray,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }
                }
            }

            // 4 Grid Actions
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // View Menu
                    ActionCard(
                        title = "View Menu",
                        subtitle = "Explore dishes",
                        icon = Icons.Default.MenuBook,
                        isHighlighted = false,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateMenu
                    )

                    // Help Me Choose
                    ActionCard(
                        title = "Help Me Choose",
                        subtitle = "AI food guide",
                        icon = Icons.Default.AutoAwesome,
                        isHighlighted = true,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateHelpMeChoose
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ActionCard(
                        title = "Popular Now",
                        subtitle = "Most ordered",
                        icon = Icons.Default.LocalFireDepartment,
                        isHighlighted = false,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigatePopular
                    )

                    ActionCard(
                        title = "Surprise Me",
                        subtitle = "Chef picks",
                        icon = Icons.Default.Casino,
                        isHighlighted = false,
                        modifier = Modifier.weight(1f),
                        onClick = { onDishClick(SampleData.ButterChicken) }
                    )
                }
            }

            // Today's Specials Header & Row
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Today's Specials", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text(
                        "View All →",
                        color = BrandGold,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.clickable { onNavigateMenu() }
                    )
                }
            }

            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(bottom = 4.dp)
                ) {
                    items(SampleData.MenuList) { dish ->
                        SpecialDishCard(dish = dish, onClick = { onDishClick(dish) }, onAdd = { onAddToCart(dish) })
                    }
                }
            }

            // Browse by Category
            item {
                Text("Browse by Category", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SampleData.Categories.take(3).forEach { cat ->
                        CategoryChipCard(category = cat, modifier = Modifier.weight(1f), onClick = onNavigateMenu)
                    }
                }
            }

            item { Spacer(Modifier.height(80.dp)) }
        }
    }
}

@Composable
fun ActionCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isHighlighted: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isHighlighted) BrandLightTint else Color.White
        ),
        border = if (isHighlighted) androidx.compose.foundation.BorderStroke(1.dp, BrandGold) else androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
        modifier = modifier.clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(if (isHighlighted) BrandGold else BackgroundCream, RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = if (isHighlighted) DarkObsidian else BrandGold, modifier = Modifier.size(18.dp))
            }
            Spacer(Modifier.height(10.dp))
            Text(title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
            Text(subtitle, fontSize = 11.sp, color = TextSecondary)
        }
    }
}

@Composable
fun SpecialDishCard(dish: MenuItem, onClick: () -> Unit, onAdd: () -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
        modifier = Modifier.width(160.dp).clickable { onClick() }
    ) {
        Column {
            Box(modifier = Modifier.fillMaxWidth().height(100.dp)) {
                AsyncImage(
                    model = dish.imageUrl,
                    contentDescription = dish.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                Surface(
                    color = BrandGold,
                    shape = RoundedCornerShape(bottomEnd = 8.dp),
                    modifier = Modifier.align(Alignment.TopStart)
                ) {
                    Text("Chef's Special", color = DarkObsidian, fontSize = 9.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                }
            }
            Column(modifier = Modifier.padding(10.dp)) {
                Text(dish.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, maxLines = 1, color = TextPrimary)
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 2.dp)) {
                    Icon(Icons.Default.Star, null, tint = BrandGold, modifier = Modifier.size(12.dp))
                    Text(" ${dish.rating} (${dish.reviewCount})", fontSize = 10.sp, color = TextSecondary)
                }
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("₹${dish.price}", fontWeight = FontWeight.Black, fontSize = 13.sp, color = TextPrimary)
                    Box(
                        modifier = Modifier
                            .size(26.dp)
                            .background(BrandGold, CircleShape)
                            .clickable { onAdd() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Add, null, tint = DarkObsidian, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun CategoryChipCard(category: com.restoflow.spicehaven.model.MenuCategory, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
        modifier = modifier.clickable { onClick() }
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            AsyncImage(
                model = category.imageUrl,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.size(48.dp).clip(RoundedCornerShape(8.dp))
            )
            Spacer(Modifier.height(6.dp))
            Text(category.name, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextPrimary, maxLines = 1)
            Text("${category.itemCount} items", fontSize = 9.sp, color = TextSecondary)
        }
    }
}
