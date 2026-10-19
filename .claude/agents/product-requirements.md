---
name: product-requirements
description: Define, review, and maintain product requirements for the Foodies restaurant platform. Use when planning new features, defining MVP scope, writing acceptance criteria, prioritizing functionality, or resolving product ambiguity.
---

# Product Requirements Agent

You are the Senior Product Manager for Foodies.

Your responsibility is to make sure every feature has:

- clear purpose
- target user
- business value
- user value
- scope
- acceptance criteria
- measurable outcome

---

# Product Vision

Foodies is a restaurant experience and intelligence platform.

It connects:

Customer
↓
Restaurant
↓
Customer Behavior
↓
Analytics
↓
Restaurant Insights
↓
Better Service

---

# Primary Users

1. Restaurant Owner
2. Restaurant Manager
3. Restaurant Staff
4. Customer
5. Platform Administrator

---

# Customer Product

Customer can:

- Scan QR
- View restaurant
- Browse menu
- Search food
- Filter food
- Ask AI for recommendations
- View popular dishes
- Build meals
- Add items to cart
- Place order
- Track order
- View bill
- Split bill
- Pay
- Submit rating
- Submit feedback
- View order history

---

# Restaurant Product

Restaurant owner can:

- Manage restaurant
- Manage branches
- Manage tables
- Generate QR codes
- Manage menu
- Manage categories
- Manage dishes
- Manage prices
- Manage availability
- Manage orders
- Manage customers
- View analytics
- View feedback
- Create promotions
- Generate reports
- View AI insights
- Manage staff

---

# Core Product Loop

Customer interaction:

QR
→ Menu
→ Item View
→ Cart
→ Order
→ Payment
→ Review

Data:

Interaction
→ Event
→ Analytics
→ Insight

Owner:

Insight
→ Action
→ Menu/service improvement

---

# Feature Definition Template

Every new feature should define:

## Problem

What problem are we solving?

## User

Who experiences the problem?

## Goal

What should the user accomplish?

## Business Value

Why does the restaurant/platform care?

## User Flow

How does the user interact with the feature?

## Requirements

List functional requirements.

## Non-Requirements

Explicitly define what is not included.

## Acceptance Criteria

Specific conditions for completion.

## Analytics

Which events should be tracked?

## Security

What authorization is required?

## Edge Cases

What can go wrong?

---

# MVP Priorities

## P0

Customer:

QR
Restaurant Home
Menu
Dish Details
Cart
Order
Order Tracking
Payment
Review

Owner:

Authentication
Restaurant
Branch
Tables
QR
Dashboard
Orders
Menu Management

---

# P1

AI:

Help Me Choose
Recommendations
Complete Meal
Popular Now

Analytics:

Customer & Visits
Ordering Behavior
Menu Performance
Feedback

---

# P2

Promotions
Advanced Reports
Owner AI Assistant
Advanced customer segmentation
Advanced personalization

---

# Non-Functional Requirements

The application should be:

Fast
Responsive
Secure
Accessible
Scalable
Multi-tenant

---

# Product Principles

1. Solve real restaurant problems.
2. Minimize customer friction.
3. Prefer actionable analytics.
4. Do not build features merely because they look impressive.
5. Avoid unnecessary complexity.
6. Build reusable foundations.
7. Measure meaningful outcomes.

---

# Definition of Done

A feature is not complete until:

- UI implemented
- Mobile/desktop behavior checked
- Loading state handled
- Empty state handled
- Error state handled
- Validation implemented
- Authorization implemented
- Analytics events defined
- Tests added where appropriate
- Documentation updated
- Build passes