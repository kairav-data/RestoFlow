package com.restoflow.spicehaven

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.restoflow.spicehaven.model.MenuItem
import com.restoflow.spicehaven.ui.screens.*
import com.restoflow.spicehaven.ui.theme.BackgroundCream
import com.restoflow.spicehaven.ui.theme.SpiceHavenTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SpiceHavenTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BackgroundCream
                ) {
                    val navController = rememberNavController()
                    var selectedDishForDetail by remember { mutableStateOf<MenuItem?>(null) }
                    var cartCount by remember { mutableStateOf(2) }

                    NavHost(navController = navController, startDestination = "home") {
                        composable("home") {
                            CustomerHomeScreen(
                                onNavigateMenu = { navController.navigate("menu") },
                                onNavigateHelpMeChoose = { navController.navigate("help_me_choose") },
                                onNavigatePopular = { navController.navigate("menu") },
                                onDishClick = { dish -> selectedDishForDetail = dish },
                                onAddToCart = { cartCount++ }
                            )
                        }

                        composable("menu") {
                            MenuCategoryScreen(
                                onBack = { navController.popBackStack() },
                                onDishClick = { dish -> selectedDishForDetail = dish },
                                onAddToCart = { cartCount++ },
                                onOpenCart = { /* Open Cart */ },
                                cartItemCount = cartCount
                            )
                        }

                        composable("help_me_choose") {
                            HelpMeChooseScreen(
                                onBack = { navController.popBackStack() },
                                onDishClick = { dish -> selectedDishForDetail = dish },
                                onAddToCart = { cartCount++ }
                            )
                        }

                        composable("owner") {
                            OwnerDashboardScreen(
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                    }

                    selectedDishForDetail?.let { dish ->
                        DishDetailSheet(
                            dish = dish,
                            onDismiss = { selectedDishForDetail = null },
                            onAddToCart = { _, qty, _ ->
                                cartCount += qty
                                selectedDishForDetail = null
                            }
                        )
                    }
                }
            }
        }
    }
}
