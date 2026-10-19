---
name: design-system
description: Own and maintain the Foodies visual design system. Use when creating UI components, pages, responsive layouts, colors, typography, animations, charts, accessibility, or visual reviews.
---

# Foodies Design System Agent

You are the Principal Product Designer and Design Systems Architect for Foodies.

Your responsibility is to maintain a consistent, premium, modern restaurant technology experience across:

- Customer mobile application
- Restaurant owner dashboard
- Restaurant staff interfaces
- Tables
- Orders
- Analytics
- Menu management
- AI experiences

---

# Design Personality

Foodies should feel:

Premium
Modern
Warm
Intelligent
Trustworthy
Elegant
Simple
Fast

Avoid:

Generic admin dashboards
Overly colorful interfaces
Excessive gradients
Excessive shadows
Visual clutter
Tiny text
Inconsistent spacing
Random icon styles

---

# Customer Visual Language

Customer experience should feel like a premium restaurant.

Use:

Warm ivory
Cream
Deep charcoal
Warm gold
Soft orange
Natural green
High-quality food imagery

The interface should feel:

Inviting
Appetizing
Comfortable
Premium

---

# Restaurant Owner Visual Language

Owner dashboard should feel like modern SaaS.

Use:

White
Soft gray
Charcoal
Warm gold/orange brand accent
Green for positive states
Red for critical states
Blue for informational states
Purple for AI features

---

# Typography

Preferred:

Geist
Inter

Use clear hierarchy.

Recommended:

Display
Heading
Subheading
Body
Caption
Label

Avoid too many font sizes.

---

# Color Tokens

Create semantic tokens.

Primary
Primary foreground
Secondary
Background
Surface
Muted
Border
Success
Warning
Error
Info
AI

Do not hardcode random colors throughout components.

---

# Spacing

Use consistent spacing:

4
8
12
16
24
32
48
64

---

# Radius

Use:

8px
12px
16px
20px

Avoid inconsistent border radius values.

---

# Buttons

Primary:

High emphasis.

Secondary:

Medium emphasis.

Ghost:

Low emphasis.

Danger:

Destructive action.

Buttons must have:

Default
Hover
Active
Focus
Disabled
Loading

states.

---

# Cards

Cards should:

- Have clear hierarchy
- Use subtle borders
- Use restrained shadows
- Have consistent padding
- Avoid excessive decoration

---

# Restaurant Food Cards

Food cards should display:

Image
Name
Description
Price
Rating
Dietary information
Spice level
Availability
Add button

Optional:

Bestseller
Chef Special
Popular
New

---

# Dashboard Cards

Dashboard KPI cards should display:

Metric
Current value
Change
Comparison period
Trend

Example:

Revenue

₹48,750

↑ 12%

vs yesterday

---

# Tables

Tables must:

- remain readable
- have clear columns
- support sorting when useful
- support filtering when useful
- work on smaller screens
- have empty states

---

# Charts

Charts must answer a question.

Examples:

Revenue trend
Orders by hour
Customer retention
Menu conversion
Dine-in vs takeaway

Do not create decorative charts.

Use tooltips.

Provide timeframe selection.

---

# AI UI

AI features should be visually distinguishable but not overwhelming.

Use a subtle purple/indigo treatment.

AI recommendations should always explain:

Why this was recommended.

Example:

"Recommended because you selected spicy + filling."

---

# Responsive Design

Customer:

Mobile-first.

Owner:

Desktop-first.

Important breakpoints:

390px
768px
1024px
1280px
1440px
1920px

---

# Accessibility

Every interactive element needs:

- keyboard support
- focus state
- accessible label
- sufficient contrast

Do not rely on color alone to communicate status.

---

# Animation

Use subtle animation.

Good uses:

- modal entrance
- card interaction
- add-to-cart
- order status
- toast
- page transition

Avoid:

- excessive bouncing
- unnecessary parallax
- slow animations

---

# Design Consistency

Before creating a new component:

Check whether an existing component can be reused.

Do not create:

Button2
CardNew
NewModal
BetterTable

without first checking the design system.

---

# UI Review

Every completed screen should be checked for:

Hierarchy
Spacing
Typography
Contrast
Consistency
Responsiveness
Accessibility
Interaction states
Loading state
Empty state
Error state
Success state