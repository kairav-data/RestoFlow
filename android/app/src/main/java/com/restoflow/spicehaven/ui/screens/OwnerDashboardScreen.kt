package com.restoflow.spicehaven.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.restoflow.spicehaven.data.SampleData
import com.restoflow.spicehaven.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OwnerDashboardScreen(
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("SpiceHaven Analytics", fontWeight = FontWeight.Bold, color = Color.White)
                        Text("Live Restaurant Pulse • Andheri", fontSize = 11.sp, color = BrandGold)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    Surface(
                        color = Color(0xFF065F46),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Box(modifier = Modifier.size(6.dp).background(Color(0xFF34D399), androidx.compose.foundation.shape.CircleShape))
                            Spacer(Modifier.width(4.dp))
                            Text("Live", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkObsidian)
            )
        },
        containerColor = Color(0xFFF8FAFC)
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    "Today's Performance",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            // 5 KPI Cards Strip
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    item {
                        KpiStatCard("Total Revenue", "₹48,750", "↑ 12%", Color(0xFF10B981))
                    }
                    item {
                        KpiStatCard("Total Orders", "126", "↑ 8%", Color(0xFF3B82F6))
                    }
                    item {
                        KpiStatCard("Total Customers", "110", "↑ 10%", Color(0xFF8B5CF6))
                    }
                    item {
                        KpiStatCard("Avg. Order Value", "₹387", "↑ 5%", Color(0xFF10B981))
                    }
                    item {
                        KpiStatCard("Avg. Rating", "4.6★", "↑ 0.3", BrandGold)
                    }
                }
            }

            // Channel Breakdown Card
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Dine-in vs Takeaway", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Dine-in: 68 orders (54%)", fontSize = 12.sp, color = VegGreen, fontWeight = FontWeight.SemiBold)
                            Text("Takeaway: 42 orders (33%)", fontSize = 12.sp, color = BrandGold, fontWeight = FontWeight.SemiBold)
                        }
                        Text("Online QR: 16 orders (13%)", fontSize = 12.sp, color = StatusNew, fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            // Live Orders
            item {
                Text("Recent Live Orders", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }

            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        LiveOrderRow("Table T05", "#1028 • 2m ago", "Paneer Tikka ×1, Garlic Naan ×2", "₹560", "New", StatusNew)
                        HorizontalDivider(color = BorderSubtle)
                        LiveOrderRow("Table T12", "#1027 • 5m ago", "Butter Chicken ×1, Jeera Rice ×1", "₹420", "Preparing", StatusPreparing)
                        HorizontalDivider(color = BorderSubtle)
                        LiveOrderRow("Table T03", "#1026 • 8m ago", "Chicken Biryani ×2", "₹640", "Ready", StatusReady)
                    }
                }
            }

            item { Spacer(Modifier.height(40.dp)) }
        }
    }
}

@Composable
fun KpiStatCard(title: String, value: String, change: String, changeColor: Color) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
        modifier = Modifier.width(150.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(title, fontSize = 11.sp, color = TextSecondary, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Black, color = TextPrimary)
            Spacer(Modifier.height(4.dp))
            Text(change, fontSize = 11.sp, color = changeColor, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun LiveOrderRow(table: String, time: String, items: String, amount: String, status: String, statusColor: Color) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(table, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Spacer(Modifier.width(6.dp))
                Text(time, fontSize = 10.sp, color = TextSecondary)
            }
            Text(items, fontSize = 11.sp, color = TextSecondary, maxLines = 1)
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(amount, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Surface(
                color = statusColor.copy(alpha = 0.15f),
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    status,
                    color = statusColor,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }
    }
}
