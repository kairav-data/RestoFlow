# RestoFlow - Project Instructions

## Product

RestoFlow is a multi-tenant restaurant SaaS platform.

The platform connects:

- Restaurant owners
- Restaurant managers
- Restaurant staff
- Restaurant customers

Core product areas:

1. Customer QR experience
2. Digital menu
3. AI food recommendations
4. Ordering
5. Payment
6. Reviews
7. Restaurant analytics
8. Menu management
9. Order management
10. Customer intelligence
11. Promotions
12. Restaurant AI insights

---

# Technology

Use:

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Recharts
- Framer Motion
- Prisma
- PostgreSQL
- Zod
- React Hook Form

Do not introduce another frontend framework.

---

# Architecture

Use feature-based architecture.

Business logic must not be placed directly inside UI components.

Prefer:

src/features/<feature>/

Examples:

src/features/menu/
src/features/orders/
src/features/customers/
src/features/analytics/

Reusable UI belongs in:

src/components/ui/

Shared application components belong in:

src/components/

---

# Design Principles

The application must feel:

- Premium
- Modern
- Elegant
- Fast
- Minimal
- Data-driven
- Hospitality-focused

Avoid generic admin-dashboard design.

Avoid excessive gradients.

Avoid excessive shadows.

Avoid excessive rounded cards.

Do not use emoji as primary UI icons.

Use Lucide icons.

Use food photography where appropriate.

---

# Customer Design

Customer experience is mobile-first.

Primary customer journey:

QR Scan
→ Restaurant Home
→ Menu / Help Me Choose
→ Dish
→ Cart
→ Order
→ Track
→ Pay
→ Review

The customer should never feel overwhelmed.

Primary actions should always be obvious.

---

# Owner Design

Owner application is desktop-first.

Primary navigation:

Dashboard
Orders
Menu Management
Tables & QR
Customers
Analytics
Promotions
Reports
Staff
Settings

Analytics should prioritize actionable insights instead of displaying charts merely for decoration.

---

# Component Rules

Build reusable components.

Do not duplicate:

- Cards
- Buttons
- Modals
- Tables
- Charts
- Filters
- Form controls

Prefer reusable components.

---

# Responsive Design

Customer:

Mobile-first.

Owner:

Desktop-first but responsive.

Support:

1920px
1440px
1280px
1024px
768px
390px

---

# Accessibility

Use:

- semantic HTML
- keyboard navigation
- accessible labels
- focus states
- sufficient contrast
- ARIA only when necessary

---

# Data

Never hardcode production business logic into components.

Demo data may be used during UI development.

Keep demo data separate from production services.

---

# Security

Never expose:

- API keys
- database credentials
- payment secrets
- private tokens

Never commit .env.

Use .env.example.

---

# Development Process

Before implementing a large feature:

1. Understand existing architecture.
2. Inspect related components.
3. Identify reusable components.
4. Plan the implementation.
5. Implement.
6. Run lint.
7. Run tests.
8. Run build.
9. Review responsive behavior.
10. Review visual consistency.

Do not rewrite unrelated parts of the application.

---

# UI Quality

Before considering a UI feature complete, check:

- Visual hierarchy
- Spacing
- Typography
- Responsive behavior
- Loading state
- Empty state
- Error state
- Hover state
- Disabled state
- Mobile usability

---

# Important

Do not implement all application features in one step.

Build incrementally.

Keep the application runnable after every major change.