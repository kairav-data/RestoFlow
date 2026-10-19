package com.restoflow.spicehaven.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = BrandGold,
    onPrimary = DarkObsidian,
    primaryContainer = BrandLightTint,
    onPrimaryContainer = DarkObsidian,
    secondary = BrandDarkGold,
    onSecondary = SurfaceWhite,
    background = BackgroundCream,
    onBackground = TextPrimary,
    surface = SurfaceWhite,
    onSurface = TextPrimary,
    surfaceVariant = BackgroundCream,
    onSurfaceVariant = TextSecondary,
    outline = BorderSubtle
)

@Composable
fun SpiceHavenTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}
