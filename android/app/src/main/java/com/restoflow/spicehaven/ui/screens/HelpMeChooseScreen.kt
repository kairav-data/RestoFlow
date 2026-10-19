package com.restoflow.spicehaven.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.restoflow.spicehaven.data.SampleData
import com.restoflow.spicehaven.model.MenuItem
import com.restoflow.spicehaven.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelpMeChooseScreen(
    onBack: () -> Unit,
    onDishClick: (MenuItem) -> Unit,
    onAddToCart: (MenuItem) -> Unit
) {
    var step by remember { mutableStateOf(1) }
    var selectedMood by remember { mutableStateOf("Spicy") }
    var hunger by remember { mutableStateOf("Normal") }
    var budget by remember { mutableStateOf("₹300 - ₹500") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        if (step <= 3) "Help Me Choose (Step $step/3)" else "AI Recommendations ✨",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { if (step > 1) step-- else onBack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
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
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            if (step == 1) {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("What are you in the mood for?", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("Select your primary craving", fontSize = 12.sp, color = TextSecondary)

                    val moods = listOf(
                        "🍗 Something Filling",
                        "🥗 Something Light",
                        "🌶️ Spicy",
                        "🍲 Comfort Food",
                        "🥩 Protein Rich",
                        "🍰 Something Sweet"
                    )

                    moods.forEach { m ->
                        val isSelected = selectedMood == m
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = if (isSelected) BrandLightTint else Color.White),
                            border = if (isSelected) androidx.compose.foundation.BorderStroke(1.5.dp, BrandGold) else androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { selectedMood = m }
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(m, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                if (isSelected) {
                                    Icon(Icons.Default.Check, null, tint = BrandDarkGold)
                                }
                            }
                        }
                    }
                }

                Button(
                    onClick = { step = 2 },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandGold),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth().height(48.dp)
                ) {
                    Text("Next →", color = DarkObsidian, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            } else if (step == 2) {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("How hungry are you?", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)

                    val hungers = listOf("🥣 Light", "🍲 Normal", "🍛 Very Hungry", "🍱 Extremely Hungry")
                    hungers.forEach { h ->
                        val isSelected = hunger == h
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = if (isSelected) BrandLightTint else Color.White),
                            border = if (isSelected) androidx.compose.foundation.BorderStroke(1.5.dp, BrandGold) else androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
                            modifier = Modifier.fillMaxWidth().clickable { hunger = h }
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(h, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                if (isSelected) Icon(Icons.Default.Check, null, tint = BrandDarkGold)
                            }
                        }
                    }
                }

                Button(
                    onClick = { step = 3 },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandGold),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth().height(48.dp)
                ) {
                    Text("Next →", color = DarkObsidian, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            } else if (step == 3) {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("Budget & Party Size", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)

                    Text("Estimated budget per person", fontSize = 12.sp, color = TextSecondary)
                    val budgets = listOf("Under ₹300", "₹300 - ₹500", "₹500 - ₹800", "₹800+")
                    budgets.forEach { b ->
                        val isSelected = budget == b
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = if (isSelected) BrandLightTint else Color.White),
                            border = if (isSelected) androidx.compose.foundation.BorderStroke(1.5.dp, BrandGold) else androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
                            modifier = Modifier.fillMaxWidth().clickable { budget = b }
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(b, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                if (isSelected) Icon(Icons.Default.Check, null, tint = BrandDarkGold)
                            }
                        }
                    }
                }

                Button(
                    onClick = { step = 4 },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandGold),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth().height(48.dp)
                ) {
                    Text("✨ Show AI Recommendations", color = DarkObsidian, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            } else {
                // AI Result Screen
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    item {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF3E8FF)),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text("✨ AI Personalized Picks", fontWeight = FontWeight.Bold, color = Color(0xFF7E22CE), fontSize = 13.sp)
                                Text(
                                    "Based on your craving: $selectedMood • $hunger appetite • $budget",
                                    fontSize = 11.sp,
                                    color = TextPrimary
                                )
                            }
                        }
                    }

                    items(SampleData.MenuList.take(3)) { dish ->
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
                            modifier = Modifier.fillMaxWidth().clickable { onDishClick(dish) }
                        ) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(dish.name, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                    Text("₹${dish.price}", fontWeight = FontWeight.Black, fontSize = 15.sp)
                                }
                                Text("✓ Why we recommend: Matches your craving for authentic rich gravy.", fontSize = 11.sp, color = BrandDarkGold)
                                Button(
                                    onClick = { onAddToCart(dish) },
                                    colors = ButtonDefaults.buttonColors(containerColor = BrandGold),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Add to Cart", color = DarkObsidian, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }

                Button(
                    onClick = { step = 1 },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.LightGray.copy(alpha = 0.3f)),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                ) {
                    Text("Restart Guide", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }
}
