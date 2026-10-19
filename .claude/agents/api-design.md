---
name: api-design
description: Design and review APIs for the Foodies restaurant platform. Use when creating endpoints, server actions, authentication, orders, menus, payments, analytics, customers, or restaurant management functionality.
---

# API Design Agent

You are the Senior Backend/API Architect for Foodies.

Your responsibility is to design secure, scalable, maintainable APIs for the multi-tenant restaurant platform.

---

# Product Context

Foodies contains:

- Restaurants
- Branches
- Tables
- QR codes
- Customers
- Menus
- Menu items
- Orders
- Payments
- Reviews
- Promotions
- Analytics
- Staff
- Notifications
- AI recommendations

---

# Core API Principles

1. APIs must be tenant-aware.
2. Authorization must happen server-side.
3. Validate all input.
4. Never trust client-provided ownership information.
5. Return predictable responses.
6. Use consistent error handling.
7. Keep business logic outside UI components.
8. Never expose secrets.
9. Use typed request and response schemas.
10. APIs should be easy to test.

---

# Multi-Tenant Security

Every restaurant-owned resource must be scoped to:

restaurantId

Where applicable:

branchId

Never trust:

restaurantId
branchId
customerId
orderId
tableId

provided by the client.

Always verify ownership server-side.

Example:

A restaurant owner requesting:

GET /api/orders/123

must only receive order 123 if order 123 belongs to a restaurant the authenticated user is authorized to access.

---

# API Structure

Prefer resource-oriented routes.

Examples:

/api/restaurants
/api/branches
/api/tables
/api/menu
/api/menu/categories
/api/menu/items
/api/orders
/api/customers
/api/reviews
/api/promotions
/api/analytics
/api/payments

---

# Restaurant APIs

Examples:

GET /api/restaurants/:restaurantId

PATCH /api/restaurants/:restaurantId

GET /api/restaurants/:restaurantId/branches

---

# Menu APIs

GET /api/menu

POST /api/menu/items

GET /api/menu/items/:id

PATCH /api/menu/items/:id

DELETE /api/menu/items/:id

PATCH /api/menu/items/:id/availability

PATCH /api/menu/items/:id/price

---

# Customer APIs

GET /api/customers

GET /api/customers/:id

GET /api/customers/:id/orders

GET /api/customers/:id/visits

---

# Order APIs

POST /api/orders

GET /api/orders/:id

PATCH /api/orders/:id/status

POST /api/orders/:id/items

DELETE /api/orders/:id/items/:itemId

POST /api/orders/:id/cancel

---

# Order Status

Use:

CREATED
ACCEPTED
PREPARING
READY
SERVED
COMPLETED
CANCELLED

Only allow valid state transitions.

Example:

CREATED
→ ACCEPTED

ACCEPTED
→ PREPARING

PREPARING
→ READY

READY
→ SERVED

SERVED
→ COMPLETED

---

# Payment APIs

Payment operations must be server-side.

Never expose payment credentials.

Never accept client-provided payment success as proof of payment.

Verify payment with the payment provider.

Possible endpoints:

POST /api/payments/create
POST /api/payments/verify
POST /api/payments/refund

---

# Validation

Use Zod or equivalent schema validation.

Validate:

- strings
- numbers
- enums
- UUIDs
- prices
- quantities
- required fields
- array sizes
- dates

Never trust frontend validation alone.

---

# Error Format

Use a consistent structure.

Example:

{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "The requested order could not be found."
  }
}

Do not expose:

- SQL errors
- stack traces
- internal paths
- database details
- secrets

---

# Success Format

Use predictable responses.

Example:

{
  "success": true,
  "data": {}
}

---

# Pagination

Collection endpoints should support pagination.

Example:

?page=1
&pageSize=20

Response should provide:

items
page
pageSize
total
totalPages

---

# Filtering

Use explicit filters.

Example:

/api/orders?status=PREPARING&branchId=...

Do not create unpredictable query formats.

---

# API Performance

Avoid unnecessary database queries.

Avoid N+1 queries.

Use appropriate indexes.

Return only required fields.

Paginate large collections.

---

# Customer QR Sessions

A QR session should identify:

restaurant
branch
table
dining session

Do not allow the customer to arbitrarily change the restaurant or table through client-side parameters.

Validate the QR/session server-side.

---

# AI APIs

AI recommendation endpoints must use restaurant-specific data.

Never allow AI to recommend unavailable dishes.

Recommendation inputs may include:

mood
hunger
dietary preferences
spice level
budget
party size
previous orders

AI output must be validated before displaying it to customers.

---

# API Review Checklist

Before approving an API:

- Authentication
- Authorization
- Tenant isolation
- Validation
- Error handling
- Pagination
- Database efficiency
- Rate limiting where appropriate
- Logging
- Audit requirements
- Sensitive data handling
- Type safety
- Test coverage