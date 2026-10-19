package com.restoflow.spicehaven.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.restoflow.spicehaven.model.MenuItem
import com.restoflow.spicehaven.model.MenuItemPairing
import com.restoflow.spicehaven.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DishDetailSheet(
    dish: MenuItem,
    onDismiss: () -> Unit,
    onAddToCart: (MenuItem, Int, List<MenuItemPairing>) -> Unit
) {
    var quantity by remember { mutableStateOf(1) }
    val selectedPairings = remember { mutableStateListOf<MenuItemPairing>() }

    val pairingsTotal = selectedPairings.sumOf { it.price }
    val finalPrice = (dish.price + pairingsTotal) * quantity

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 24.dp)
        ) {
            // Hero Image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
            ) {
                AsyncImage(
                    model = dish.imageUrl,
                    contentDescription = dish.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .padding(16.dp)
                        .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                        .align(Alignment.TopEnd)
                ) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                }
            }

            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Title & Price
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(dish.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 4.dp)) {
                            Icon(Icons.Default.Star, null, tint = BrandGold, modifier = Modifier.size(14.dp))
                            Text(" ${dish.rating} (${dish.reviewCount} orders)", fontSize = 12.sp, color = TextSecondary)
                        }
                    }
                    Text("₹${dish.price}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
                }

                // Badges
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Surface(color = Color(0xFFFFF1F2), shape = RoundedCornerShape(8.dp)) {
                        Text("🔥 Most Ordered", color = NonVegRed, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                    }
                    Surface(color = Color(0xFFECFDF5), shape = RoundedCornerShape(8.dp)) {
                        Text("👨‍🍳 Chef's Special", color = VegGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                    }
                }

                // Description
                Text(dish.description, fontSize = 13.sp, color = TextSecondary, lineHeight = 18.sp)

                // 4 Highlights
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    HighlightBox("Medium", "Spice", Modifier.weight(1f))
                    HighlightBox("${dish.calories} kcal", "Calories", Modifier.weight(1f))
                    HighlightBox(if (dish.isVegetarian) "Pure Veg" else "Non-Veg", "Dietary", Modifier.weight(1f))
                    HighlightBox("Dairy / Nuts", "Allergen", Modifier.weight(1f))
                }

                // Why Customers Love It
                if (dish.whyCustomersLoveIt.isNotEmpty()) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = BrandLightTint.copy(alpha = 0.5f)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Why Customers Love It", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            dish.whyCustomersLoveIt.forEach { reason ->
                                Row(verticalAlignment = Alignment.Top) {
                                    Text("✓ ", color = BrandDarkGold, fontWeight = FontWeight.Bold)
                                    Text(reason, fontSize = 11.sp, color = TextPrimary)
                                }
                            }
                        }
                    }
                }

                // Perfect Pairings
                if (dish.pairings.isNotEmpty()) {
                    Text("Perfect Pairings (Add-ons)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        dish.pairings.forEach { p ->
                            val isChecked = selectedPairings.contains(p)
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isChecked) BrandLightTint else Color.White
                                ),
                                border = if (isChecked) androidx.compose.foundation.BorderStroke(1.5.dp, BrandGold) else androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable {
                                        if (isChecked) selectedPairings.remove(p) else selectedPairings.add(p)
                                    }
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    AsyncImage(
                                        model = p.imageUrl,
                                        contentDescription = p.name,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(55.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                    )
                                    Spacer(Modifier.height(4.dp))
                                    Text(p.name, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("₹${p.price}", fontSize = 11.sp, fontWeight = FontWeight.Black)
                                        Text(if (isChecked) "✓" else "+", fontWeight = FontWeight.Bold, color = BrandGold)
                                    }
                                }
                            }
                        }
                    }
                }

                // Quantity and Add to Cart
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Stepper
                    Row(
                        modifier = Modifier
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                            .padding(horizontal = 8.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = { if (quantity > 1) quantity-- },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Text("-", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        }
                        Text("$quantity", fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 12.dp))
                        IconButton(
                            onClick = { quantity++ },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Text("+", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    // Add Button
                    Button(
                        onClick = {
                            onAddToCart(dish, quantity, selectedPairings.toList())
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGold),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) {
                        Text(
                            "Add to Cart • ₹$finalPrice",
                            color = DarkObsidian,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun HighlightBox(title: String, subtitle: String, modifier: Modifier = Modifier) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            Text(subtitle, fontSize = 9.sp, color = TextSecondary)
        }
    }
}
