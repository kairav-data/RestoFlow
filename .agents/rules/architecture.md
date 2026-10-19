# Architecture Rules

Use modular feature-based architecture.

Core domains:

- auth
- restaurants
- branches
- tables
- qr
- customers
- menu
- orders
- payments
- reviews
- analytics
- promotions
- notifications

Each feature should own its:

- components
- types
- validation
- services
- hooks

Keep domain logic isolated.

Avoid circular dependencies.

Shared code belongs in common modules.

Do not import feature internals directly from unrelated features unless explicitly required.