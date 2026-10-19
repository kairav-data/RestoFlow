# RestoFlow (SpiceHaven) — Enterprise Multi-Tenant Restaurant Platform

> A production-grade restaurant technology platform connecting restaurant owners, staff, and diners through contactless table QR access, digital menus, conversational AI food discovery, kitchen dispatch (KDS), split payments, and deep operational analytics.

---

## 🌟 Visual & UX Alignment with Design Prompt & Screenshots

This implementation faithfully reproduces and elevates the design specifications from `design_prompt.md` and the 3 high-resolution UI references in `Screenshot UI/`:

1. **Customer Mobile Experience (`Screenshot UI/d80cbec3-3d50-452f-bb57-96671cd4f2a3.png`)**:
   - **Screen 1 (Home)**: Dark obsidian header with golden chef crest logo, EN language selector, Table #T12 pill, ambient photography hero card ("Good Food Brings People Together"), 4 primary action cards (*View Menu, Help Me Choose ✨, Popular Now, Surprise Me 🎲*), Order Again quick re-order, Chef's Specials carousel, and 3×2 category browser.
   - **Screen 2 (Category Listing)**: Sticky category selector, quick dietary toggle (*All, Veg with green leaf, Non-Veg with red meat*), secondary filter chips (*Popular, Price, Spice Level, Dietary*), dish cards with favorite heart, ratings, and circular gold `+` action button.
   - **Screen 3 (Dish Details Modal)**: Hero photo with carousel pagination dots (`● ○ ○`), verified badges (*🔥 Most Ordered, 👨‍🍳 Chef's Special, ★ Best Seller*), 4 highlight cards (*Medium Spicy, 520 kcal, Gluten Free, Contains Dairy/Nuts*), *Why Customers Love It* checklist, *Perfect Pairings* interactive add-ons (Garlic Naan ₹90, Jeera Rice ₹140, Onion Salad ₹60), quantity stepper, and dynamic "Add to Cart • ₹340" CTA.
   - **Screen 4 (Advanced Filters Sheet)**: Dietary preferences, 4-tier spice selector (*Mild 1🌶, Medium 2🌶, Spicy 3🌶, Extra Spicy 4🌶*), price ranges (*Under ₹200, ₹200–₹400, ₹400–₹600, ₹600+*), and sort criteria with "Apply Filters" CTA.

2. **Customer "Help Me Choose" AI Flow (`Screenshot UI/SpiceHaven AI Ordering App Flow.png`)**:
   - 4-step wizard guiding diners through cravings, hunger levels, dietary constraints, budget, and party sizes.
   - Natural language query input ("creamy but not too spicy").
   - AI recommendation ranking (#1 Butter Chicken, #2 Chicken Biryani, #3 Tandoori Chicken) with personalized justification checklist.
   - Complete Meal Combos ("Recommended Combo - Dinner for 2", ₹1,180 with 10% savings breakdown and 1-click cart addition).
   - "At Nearby Tables" live social proof feed ("Table 5 ordered Paneer Tikka + Garlic Naan 2 min ago").

3. **Restaurant Owner Analytics Dashboard (`Screenshot UI/SpiceHaven Restaurant Analytics Dashboard (1).png`)**:
   - Dark sidebar with golden brand crest, multi-branch selector (*SpiceHaven - Andheri*), and owner profile (*Rohan Mehta*).
   - Header with greeting, live updates pulsing badge, and date selector.
   - 5 KPI metric cards: Total Revenue (₹48,750 ↑12%), Total Orders (126 ↑8%), Total Customers (110 ↑10%), AOV (₹387 ↑5%), Avg Rating (4.6 ↑0.3).
   - Revenue & Orders Trend (Recharts dual-axis combo chart).
   - Dine-in vs Takeaway donut breakdown (54% Dine-in, 33% Takeaway, 13% Online QR).
   - Real-time Live Orders queue with status transitions (*[New]*, *[Preparing]*, *[Ready]*, *[Served]*).
   - Customer & Visit Insights (New vs Returning donut, hourly timeline, top visit days).
   - Top Dishes Today ranked list with gross revenue.
   - Customer Feedback satisfaction score (4.6★ / 234 reviews) and live feedback stream.
   - Menu Performance tabs with conversion rate bars.
   - Popular Combinations with automated "Create Promotion" conversion.
   - Menu Quick Actions & AI Diagnostic Advisor.

---

## 🛠 Project Structure

```
resto-platform/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── globals.css           # Brand tokens, fonts, and scrollbars
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main platform container
│   ├── components/
│   │   ├── PlatformSwitcher.tsx  # Mode switcher (Owner SaaS vs Customer Phone vs KDS vs QR)
│   │   └── ui/
│   │       └── BrandLogo.tsx     # Golden SpiceHaven chef hat mark
│   ├── data/
│   │   └── mockData.ts           # Realistic restaurant dataset (SpiceHaven - Andheri)
│   ├── features/
│   │   ├── customer/             # Customer Mobile / PWA Dining Experience
│   │   │   ├── components/       # Home, Menu, DishDetail, FilterSheet, HelpMeChoose, Cart, Tracking, Bill, Review
│   │   │   ├── context/          # React customer state store
│   │   │   └── CustomerApp.tsx   # Master customer container
│   │   └── owner/                # Restaurant Owner Desktop SaaS
│   │       ├── components/       # Dashboard, Live Orders KDS, Menu Catalog, Tables & QR, AI Advisor
│   │       ├── context/          # React owner state store
│   │       └── OwnerApp.tsx      # Master owner container
│   ├── lib/
│   │   └── utils.ts              # Class name and currency utilities
│   └── types/
│       └── index.ts              # TypeScript domain types
├── android/                      # Native Android Companion App (Jetpack Compose)
│   ├── app/
│   │   ├── build.gradle.kts      # Android application Gradle script
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── java/com/restoflow/spicehaven/
│   │           ├── MainActivity.kt
│   │           ├── data/SampleData.kt
│   │           ├── model/Models.kt
│   │           └── ui/
│   │               ├── screens/  # HomeScreen, MenuScreen, DishDetailSheet, HelpMeChoose, OwnerDashboard
│   │               └── theme/    # Material 3 Color, Type, Theme matching tokens
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── gradle/libs.versions.toml
├── design_prompt.md              # Master specification
└── Screenshot UI/                # Visual UI reference screenshots
```

---

## 🚀 Running the Web Application

1. **Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

2. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

3. **Interactive Features**:
   - Use the **Top Platform Bar** to toggle between **Owner Dashboard**, **Customer Mobile App** (in authentic iPhone 16 Pro device shell), **Kitchen KDS**, and **Table QR Hub**.
   - In Customer mode: try adding items, running the "Help Me Choose" AI wizard, placing an order, following the live kitchen status steps, and submitting a multi-attribute review.
   - In Owner mode: click any live order to advance its status, toggle dish availability, inspect visitor timelines, and chat with the AI Advisor.

---

## 📱 Running the Android Native App

The native Android app is built with **Kotlin 2.0+** and **Jetpack Compose Material 3**:
1. Open the `android/` directory in **Android Studio**.
2. Sync Gradle dependencies.
3. Select an Android emulator or connected device (API 26+) and click **Run**.
