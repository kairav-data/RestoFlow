Act as a Principal Product Designer, Senior UX/UI Engineer, SaaS Architect, and Full-Stack Engineer.

I want you to design and build a production-quality, modern, premium restaurant technology platform called "RestoFlow".

The platform is a multi-restaurant SaaS application connecting:

1. Restaurant Owners / Managers
2. Restaurant Staff
3. Customers / Diners

The platform should support QR-based table access, digital menus, AI-assisted food discovery, ordering, payments, customer feedback, restaurant analytics, menu management, customer insights, and operational order management.

IMPORTANT:

The application must NOT look like a generic restaurant website or a basic admin dashboard.

It should feel like a premium modern SaaS product comparable to high-quality products from Stripe, Linear, Notion, Shopify, Toast, Square, and modern hospitality platforms.

Use the attached UI references as visual and UX inspiration:

REFERENCE 1:
Customer mobile restaurant home screen.

REFERENCE 2:
Restaurant owner desktop analytics dashboard.

REFERENCE 3:
Customer "Help Me Choose" AI ordering flow.

Maintain a consistent design language across all three experiences.


====================================================
1. PRODUCT ARCHITECTURE
====================================================

Build the platform as a multi-tenant restaurant SaaS.

Each restaurant should have its own:

- Restaurant profile
- Logo
- Cover image
- Brand colors
- Branches
- Tables
- QR codes
- Menu
- Categories
- Products
- Orders
- Customers
- Reviews
- Analytics
- Promotions
- Staff users
- Payment configuration
- Restaurant settings

The architecture must support multiple restaurants and multiple branches.

Example:

Platform
│
├── Restaurant A
│   ├── Branch 1
│   ├── Branch 2
│   └── Branch 3
│
├── Restaurant B
│   └── Branch 1
│
└── Restaurant C
    └── Branch 1


====================================================
2. USER TYPES
====================================================

Create role-based experiences for:

A. Platform Admin

B. Restaurant Owner

C. Restaurant Manager

D. Restaurant Staff

E. Customer


====================================================
3. CUSTOMER EXPERIENCE
====================================================

Customers should NOT need to install an application.

The primary customer experience should be a mobile-first responsive web application / PWA.

A customer scans the QR code placed on a restaurant table.

Example:

Restaurant:
SpiceHaven

Branch:
Andheri

Table:
T-12

The URL should automatically identify:

- Restaurant
- Branch
- Table
- Current dining session


====================================================
4. CUSTOMER HOME SCREEN
====================================================

Create a premium mobile home screen.

Top section:

- Restaurant logo
- Restaurant name
- Branch/location
- Rating
- Restaurant tagline
- Language selector
- Table number
- Optional profile/login

Example:

SPICEHAVEN
Multi-Cuisine Restaurant

⭐ 4.8
📍 Andheri, Mumbai
Table T12

Hero message:

"Good Food Brings People Together"

Below the hero section provide six primary actions:

1. View Menu
2. Help Me Choose
3. Popular Now
4. Order Now
5. Pay Bill
6. Review & Rating


====================================================
5. VIEW MENU
====================================================

Create a modern digital restaurant menu.

Categories:

- All
- Starters
- Main Course
- Biryani & Rice
- Breads
- Soups & Salads
- Beverages
- Desserts
- Healthy
- Chef Specials

Each food card should contain:

- Food image
- Food name
- Description
- Price
- Rating
- Number of orders
- Vegetarian/non-vegetarian indicator
- Spice level
- Dietary tags
- Bestseller badge
- Chef Special badge
- Add button
- Favorite button

Example:

Butter Chicken
⭐ 4.8 (1.2K orders)

Rich, creamy and full of authentic flavors.

₹340

[ + ]


====================================================
6. ADVANCED MENU FILTERING
====================================================

Allow customers to filter by:

Dietary preference:

- Vegetarian
- Non-Vegetarian
- Vegan
- Egg
- Gluten-Free
- Dairy-Free
- Jain
- Halal

Spice:

- Mild
- Medium
- Spicy
- Extra Spicy

Price:

- Under ₹200
- ₹200–₹400
- ₹400–₹600
- ₹600+

Sort:

- Most Popular
- Highest Rated
- Price Low → High
- Price High → Low
- Newest


====================================================
7. HELP ME CHOOSE
====================================================

This is one of the most important features.

Create an AI-powered food recommendation experience.

The customer should be able to say:

"I'm not sure what to eat."

The application guides them through a short conversational selection process.

Step 1:

"What are you in the mood for?"

Options:

- Something Filling
- Something Light
- Spicy
- Comfort Food
- Protein Rich
- Something Sweet
- Surprise Me

Step 2:

"How hungry are you?"

- Light
- Normal
- Very Hungry
- Extremely Hungry

Step 3:

Dietary preferences:

- Vegetarian
- Non-Vegetarian
- Egg
- No Spicy
- Gluten-Free
- Dairy-Free
- Healthy
- Halal

Step 4:

Budget:

- Under ₹300
- ₹300–₹500
- ₹500–₹800
- ₹800–₹1,200
- ₹1,200+

Number of people:

- 1
- 2
- 3
- 4+

Optional natural-language input:

"I want something creamy but not too spicy."

Then generate personalized recommendations.


====================================================
8. AI FOOD RECOMMENDATIONS
====================================================

Display:

"Recommended For You"

Based on:

- Customer selections
- Previous orders
- Restaurant popularity
- Dish ratings
- Price
- Dietary preferences
- Spice level
- Current availability
- Number of people
- Time of day
- Current restaurant trends

Show top recommendations.

Example:

# 1 Butter Chicken
⭐ 4.8
₹340

Medium Spicy
Chef's Special
Most Ordered

"Why we recommend this"

✓ You selected spicy
✓ You wanted something filling
✓ Popular among groups of 2
✓ Highly rated
✓ Pairs well with naan


====================================================
9. COMPLETE MEAL RECOMMENDATION
====================================================

Do not only recommend individual dishes.

Create complete meal recommendations.

Example:

DINNER FOR 2

Chicken Tikka
Butter Chicken
2 Garlic Naan
Jeera Rice
2 Soft Drinks

₹1,180

"Perfect for 2 people"

Show:

- Individual prices
- Combo price
- Savings
- Reason for recommendation

Button:

[Add Complete Meal]


====================================================
10. POPULAR NOW
====================================================

Show real-time/popular dishes.

Sections:

- Most Ordered Today
- Trending
- Popular at This Restaurant
- Popular at Nearby Tables
- Popular This Week

Example:

🔥 Most Ordered Today

1. Butter Chicken
2. Chicken Biryani
3. Paneer Tikka
4. Garlic Naan
5. Tandoori Chicken


====================================================
11. ORDER NOW
====================================================

Customers should be able to place orders directly from the table.

Order flow:

Browse Menu
→ Add Items
→ Customize
→ Cart
→ Confirm
→ Send Order
→ Kitchen
→ Preparation
→ Ready
→ Served

Support:

- Quantity
- Add-ons
- Customization
- Spice level
- Special instructions
- Allergies
- Notes


====================================================
12. ORDER STATUS
====================================================

Customers should be able to track:

Order Received
↓
Kitchen Accepted
↓
Preparing
↓
Ready
↓
Served

Example:

ORDER #1042

🟢 Order Confirmed
🟡 Preparing
⚪ Ready
⚪ Served

Estimated time:
15–20 minutes


====================================================
13. PAY BILL
====================================================

Create a simple digital bill experience.

Show:

Table
Number of people
Ordered items
Subtotal
Taxes
Discount
Service charge
Total

Support:

- Split Bill
- Pay Entire Bill
- Pay by Item
- Multiple people paying separately

Payment methods:

- UPI
- Card
- Wallet
- Other configured payment methods

After payment:

"Payment Successful"

Show receipt.


====================================================
14. REVIEW & RATING
====================================================

After dining/payment, allow customers to provide feedback.

Overall rating:

⭐⭐⭐⭐⭐

Then separately capture:

- Food Quality
- Taste
- Portion Size
- Presentation
- Temperature
- Service
- Staff Behavior
- Cleanliness
- Ambience
- Waiting Time
- Value for Money

Ask:

"What could we improve?"

Quick options:

- Food took too long
- Food wasn't hot enough
- Portion was small
- Too expensive
- Staff response was slow
- Table wasn't clean
- Everything was great

Optional:

"What did you like most?"

Text feedback.

Allow private feedback and public review separately.


====================================================
15. RESTAURANT OWNER DASHBOARD
====================================================

Create a desktop-first premium SaaS dashboard.

The restaurant owner should immediately understand:

"What is happening in my restaurant today?"


Sidebar navigation:

Dashboard
Orders
Menu Management
Customers
Analytics
    Customer & Visits
    Ordering Behavior
    Menu Performance
    Feedback & Reviews
Promotions
Reports
Settings


====================================================
16. OWNER DASHBOARD
====================================================

Top-level KPI cards:

Total Revenue
Total Orders
Total Customers
Average Order Value
Average Rating

Each card should show:

Current value
Comparison with previous period
Percentage change
Small trend indicator


Example:

Total Revenue

₹48,750

↑ 12%

vs yesterday


====================================================
17. REVENUE & ORDER ANALYTICS
====================================================

Interactive chart:

Revenue & Orders Trend

Support:

Today
Yesterday
7 Days
30 Days
3 Months
Custom Range

Show:

- Revenue
- Orders
- Average Order Value


====================================================
18. DINE-IN VS TAKEAWAY
====================================================

Visualize:

Dine-in
Takeaway
QR Orders
Other channels

Show percentage and absolute numbers.


====================================================
19. LIVE ORDER MANAGEMENT
====================================================

Create a real-time order management panel.

Example:

Table T05
Paneer Tikka ×1
Garlic Naan ×2
₹560

[New]

Table T12
Butter Chicken ×1
Jeera Rice ×1
₹420

[Preparing]

Table T03
Chicken Biryani ×2
₹640

[Ready]

Table T08
Tandoori Chicken ×1
₹780

[Served]

Allow staff to change status.


====================================================
20. CUSTOMER & VISIT INSIGHTS
====================================================

Track:

- New Customers
- Returning Customers
- Visit frequency
- Visit date/time
- Restaurant branch
- Table number
- Number of people
- Dining duration
- Dine-in / Takeaway
- QR scan time
- Order time
- Payment time

Show:

New vs Returning Customers
Visitor Timeline
Peak Visit Hours
Most Active Days
Average Dining Duration


====================================================
21. ORDERING BEHAVIOR ANALYTICS
====================================================

Track:

- Items viewed
- Items added to cart
- Items ordered
- Quantity
- Items removed
- Frequently ordered together
- Average order value
- Number of items per order
- Vegetarian/non-vegetarian preferences
- Add-ons
- Customizations
- Spice preferences
- Frequently reordered dishes

Create funnel:

Menu Views
↓
Product Views
↓
Add to Cart
↓
Checkout
↓
Completed Orders


====================================================
22. MENU PERFORMANCE
====================================================

Provide tabs:

Most Viewed
Most Ordered
Highest Rated
Low Performing
High Conversion
Low Conversion

For each dish show:

Views
Add-to-cart rate
Orders
Conversion rate
Revenue
Rating
Repeat orders
Complaints


Example:

Butter Chicken

Views: 520
Orders: 42
Conversion: 8.1%
Rating: 4.8
Revenue: ₹14,280


====================================================
23. POPULAR COMBINATIONS
====================================================

Identify frequently ordered combinations.

Examples:

Paneer Tikka + Garlic Naan
Butter Chicken + Naan
Chicken Biryani + Raita
Tandoori Chicken + Mint Lassi

Show:

Orders
Revenue
Average rating

Allow owner to convert combinations into promotions/combo meals.


====================================================
24. CUSTOMER FEEDBACK ANALYTICS
====================================================

Dashboard:

Overall Rating
Total Reviews
5-star %
4-star %
3-star %
2-star %
1-star %

Analyze feedback categories:

Food
Taste
Service
Cleanliness
Ambience
Waiting Time
Value

Show recurring complaints.

Example:

🔴 Waiting Time
32 complaints

🟡 Food Temperature
18 complaints

🟢 Staff Service
92% positive


====================================================
25. CUSTOMER INTELLIGENCE
====================================================

Create customer analytics.

Show:

Total Customers
New Customers
Returning Customers
Repeat Rate
Average Visits
Average Spend
Customer Lifetime Value
Average Visit Frequency

Segments:

- New Customer
- Returning Customer
- Frequent Customer
- High Value Customer
- Inactive Customer


====================================================
26. MENU MANAGEMENT
====================================================

Restaurant owners should be able to completely manage the menu.

Features:

Add Dish
Edit Dish
Delete Dish
Duplicate Dish
Enable/Disable Dish
Set Availability
Change Price
Change Image
Change Category
Set Spice Level
Set Dietary Tags
Set Ingredients
Set Allergens
Set Preparation Time
Set Recommended Pairings

Fields:

Dish Name
Description
Price
Category
Image
Veg/Non-Veg
Spice Level
Calories
Ingredients
Allergens
Preparation Time
Availability


====================================================
27. ORDER MANAGEMENT
====================================================

Owner/staff can:

- View orders
- Accept orders
- Reject orders
- Start preparation
- Mark ready
- Mark served
- Cancel orders
- Modify orders
- Add items
- Remove items
- Print/send kitchen ticket

Filter by:

Table
Order Status
Time
Order Type
Amount


====================================================
28. TABLE MANAGEMENT
====================================================

Create restaurant floor/table management.

Show:

Table number
Capacity
Status

Statuses:

Available
Occupied
Waiting
Order Preparing
Bill Requested
Payment Pending
Completed

Allow owner to:

- Add table
- Edit table
- Delete table
- Generate QR
- Download QR
- Print QR


====================================================
29. QR MANAGEMENT
====================================================

Every table receives a unique QR.

Example:

Restaurant:
SpiceHaven

Branch:
Andheri

Table:
T12

QR URL should identify the exact table.

Allow:

Generate QR
Download QR
Print QR
Regenerate QR
Deactivate QR


====================================================
30. PROMOTIONS
====================================================

Owner can create:

- Discount
- Combo
- Happy Hour
- First Visit Offer
- Returning Customer Offer
- Dish Promotion
- Time-based promotion

Example:

"Paneer Tikka + Garlic Naan"

₹350 → ₹299

Happy Hour:

4 PM – 6 PM


====================================================
31. AI RESTAURANT INSIGHTS
====================================================

Create an AI Insights section.

The AI should analyze restaurant data and surface actionable insights.

Examples:

"Paneer Tikka is highly viewed but has a lower conversion rate."

"Orders increase significantly between 7 PM and 9 PM."

"Garlic Naan is frequently ordered with Butter Chicken."

"Customers are reporting longer waiting times during the dinner peak."

"Returning customers have a higher average order value."

Do not simply display charts.

Explain:

WHAT happened
WHY it may be happening
WHAT the owner can investigate or change


====================================================
32. RESTAURANT OWNER REPORTS
====================================================

Create downloadable reports:

Sales Report
Order Report
Customer Report
Menu Performance
Feedback Report
Daily Report
Monthly Report
Branch Report

Support:

CSV
Excel
PDF


====================================================
33. SEARCH
====================================================

Global search for owner:

Search:

Customer
Order
Dish
Table
Transaction
Review

Example:

Search "T05"

→ Table
→ Current order
→ Previous orders
→ Customer session


====================================================
34. NOTIFICATIONS
====================================================

Owner notifications:

New Order
Low Stock
Low Performing Dish
New Review
Negative Feedback
Payment Received
Menu Item Unavailable
Peak Hour Alert

Example:

🔔 New order received

Table T12
₹420


====================================================
35. DESIGN SYSTEM
====================================================

Use a premium modern SaaS design system.

Visual style:

- Clean
- Minimal
- Premium
- Modern
- Professional
- Hospitality-focused
- High readability
- Soft shadows
- Rounded cards
- Generous whitespace
- Subtle gradients
- Elegant animations

Customer application:

Warm restaurant aesthetic
Cream / ivory backgrounds
Deep charcoal typography
Gold/orange primary accent
Rich food photography
Soft rounded cards

Owner dashboard:

Light SaaS interface
Dark charcoal sidebar
White cards
Subtle gray background
Gold/orange brand accent
Green success indicators
Red warning indicators
Blue informational elements
Purple AI features


====================================================
36. RESPONSIVE DESIGN
====================================================

Customer:

Mobile-first.

Must work beautifully on:

Mobile
Tablet

Owner:

Desktop-first.

Must work on:

1920px
1440px
1280px
1024px
Tablet


====================================================
37. UX PRINCIPLES
====================================================

Never overwhelm the user.

Customer should be able to:

Scan QR
→ Understand restaurant
→ Find food
→ Get recommendation
→ Order
→ Pay
→ Review

with minimal friction.

Restaurant owner should be able to:

Open dashboard
→ Understand today's situation
→ See problems
→ Manage orders
→ Update menu
→ Analyze customers
→ Take action


====================================================
38. IMPORTANT DATA MODEL
====================================================

Design the application with proper relational entities.

Core entities:

Restaurant
Branch
User
Role
Staff
Table
QRCode
DiningSession
Customer
Menu
MenuCategory
MenuItem
MenuItemVariation
MenuItemAddon
Ingredient
Order
OrderItem
Payment
Review
Rating
CustomerPreference
CustomerVisit
Promotion
Combo
Notification
AnalyticsEvent
CustomerFeedback


====================================================
39. EVENT TRACKING
====================================================

Track meaningful customer events:

QR_SCANNED
MENU_OPENED
CATEGORY_VIEWED
ITEM_VIEWED
ITEM_ADDED
ITEM_REMOVED
CUSTOMIZATION_SELECTED
AI_HELP_STARTED
AI_PREFERENCE_SELECTED
AI_RECOMMENDATION_VIEWED
ITEM_ORDERED
ORDER_CREATED
ORDER_ACCEPTED
ORDER_PREPARING
ORDER_READY
ORDER_SERVED
BILL_OPENED
PAYMENT_STARTED
PAYMENT_COMPLETED
REVIEW_STARTED
REVIEW_SUBMITTED


These events should feed the restaurant analytics dashboard.


====================================================
40. SECURITY & PRIVACY
====================================================

Implement:

- Authentication
- Role-based access control
- Restaurant-level tenant isolation
- Branch-level permissions
- Secure payment handling
- Input validation
- API authorization
- Audit logs
- Secure QR session handling

A restaurant should NEVER be able to access another restaurant's data.


====================================================
41. DASHBOARD LAYOUT
====================================================

The owner dashboard should prioritize actionable information.

Top:

Greeting
Date selector
Branch selector
Live status

Then:

KPI cards

Then:

Revenue & Orders
Dine-in vs Takeaway
Live Orders

Then:

Customer Insights
Top Dishes
Customer Feedback

Then:

Menu Performance
Popular Combinations
Quick Actions

Then:

Customer Intelligence
Dining Duration
Peak Hours

Then:

AI Insights
Recommendations
Promotions


====================================================
42. QUICK ACTIONS
====================================================

Provide easily accessible actions:

+ Add New Dish
+ Create Promotion
+ Generate QR
+ View Orders
+ View Customers
+ Edit Menu
+ View Reports


====================================================
43. AI ASSISTANT FOR RESTAURANT OWNER
====================================================

Add an AI assistant inside the owner dashboard.

Owner can ask:

"Which dishes are performing poorly?"

"What are my peak hours?"

"What are customers complaining about?"

"Which dishes are commonly ordered together?"

"What should I promote?"

"How many returning customers did I have this month?"

"Why did my average order value decrease?"

"Show me my best-performing menu categories."

The AI should answer using the restaurant's actual analytics data.


====================================================
44. EMPTY STATES
====================================================

Design beautiful empty states.

Example:

"No orders yet today."

"Once customers start ordering, your order activity will appear here."


====================================================
45. LOADING STATES
====================================================

Use skeleton loaders instead of blank screens.

Create polished:

- Card skeletons
- Table skeletons
- Chart skeletons
- Menu skeletons


====================================================
46. ERROR HANDLING
====================================================

Create user-friendly error states.

Never expose raw technical errors.

Example:

"Something went wrong while loading your menu."

[Try Again]


====================================================
47. MICRO INTERACTIONS
====================================================

Use subtle animations for:

- Button hover
- Card hover
- Add to cart
- Order status
- Notifications
- Charts
- AI recommendations
- Success messages

Avoid excessive animations.


====================================================
48. CUSTOMER + OWNER DATA CONNECTION
====================================================

The most important concept:

Every customer interaction should contribute useful restaurant intelligence.

Example:

Customer scans QR
↓
Menu viewed
↓
Items viewed
↓
Items added
↓
Items removed
↓
Order created
↓
Order prepared
↓
Food served
↓
Payment
↓
Review

This generates the restaurant's customer intelligence dataset.


====================================================
49. FINAL PRODUCT EXPERIENCE
====================================================

The final application should feel like:

"Shopify + Toast + modern AI food assistant + restaurant analytics"

but with a unique hospitality-focused experience.

Do not create a generic CRUD dashboard.

The product should feel:

Premium
Intelligent
Fast
Data-driven
Modern
Easy to use
Visually impressive


====================================================
50. DEVELOPMENT REQUIREMENT
====================================================

Build the application as a real functional product, not just static screens.

Implement:

- Reusable components
- Responsive layouts
- Proper routing
- Authentication
- Role-based access
- API architecture
- Database schema
- State management
- Form validation
- Loading states
- Error states
- Empty states
- Search
- Filters
- Charts
- Real-time order updates
- QR-based restaurant/table identification
- Customer ordering
- Menu management
- Analytics

Use realistic seed/demo data so that the dashboards look populated during development.


====================================================
51. DESIGN QUALITY REQUIREMENT
====================================================

Before finalizing each screen, evaluate:

1. Is the hierarchy immediately understandable?
2. Can the user identify the primary action within 2 seconds?
3. Is the interface visually balanced?
4. Is information density appropriate?
5. Are important insights visually prioritized?
6. Are charts actually useful?
7. Are mobile interactions comfortable?
8. Does the design feel premium?
9. Are empty/loading/error states handled?
10. Does the customer experience feel different from the restaurant-owner experience?

Do not sacrifice usability for visual effects.


====================================================
52. REQUIRED SCREENS
====================================================

CUSTOMER:

1. QR Landing
2. Restaurant Home
3. View Menu
4. Category Menu
5. Dish Details
6. Help Me Choose
7. AI Recommendations
8. Complete Meal Recommendation
9. Popular Now
10. Cart
11. Order Confirmation
12. Live Order Tracking
13. Bill
14. Split Bill
15. Payment
16. Payment Success
17. Review & Rating
18. Customer Profile
19. Order History


OWNER:

1. Login
2. Dashboard
3. Live Orders
4. Order Details
5. Menu Management
6. Add Dish
7. Edit Dish
8. Categories
9. Table Management
10. QR Management
11. Customers
12. Customer Details
13. Customer & Visit Analytics
14. Ordering Behavior Analytics
15. Menu Performance
16. Feedback & Reviews
17. Promotions
18. Reports
19. AI Insights
20. Owner AI Assistant
21. Staff Management
22. Branch Management
23. Settings
24. Restaurant Profile


====================================================
53. NAVIGATION
====================================================

OWNER SIDEBAR:

Dashboard
Orders
Menu Management
Tables & QR
Customers
Analytics
  ├ Customer & Visits
  ├ Ordering Behavior
  ├ Menu Performance
  └ Feedback & Reviews
Promotions
Reports
Staff
Settings


CUSTOMER BOTTOM NAVIGATION:

Home
Menu
Scan
Orders
Profile


====================================================
54. BRAND
====================================================

Use "SpiceHaven" as the demo restaurant.

Logo:
Elegant chef/restaurant mark.

Brand personality:

Premium
Warm
Modern
Welcoming
Trustworthy


====================================================
55. FINAL UI EXPECTATION
====================================================

Create a complete design system and application where:

CUSTOMER SIDE:

QR
↓
Restaurant
↓
Discover
↓
Choose
↓
Order
↓
Track
↓
Pay
↓
Review


OWNER SIDE:

Customers
↓
Behavior
↓
Orders
↓
Feedback
↓
Analytics
↓
Insights
↓
Action


The two sides should continuously feed each other.

Customer behavior generates insights.

Insights help restaurant owners improve the menu and service.

Improved menu/service improves the customer experience.

This feedback loop is the core product concept.


IMPORTANT:
Prioritize UX and information architecture before implementation.

Do not create every screen at once without a consistent design system.

First establish:

1. Design tokens
2. Typography
3. Color system
4. Spacing
5. Component library
6. Navigation
7. Customer UX
8. Owner UX

Then implement the complete application.

Use the attached reference images as visual inspiration, but improve the layouts where appropriate rather than copying them literally.