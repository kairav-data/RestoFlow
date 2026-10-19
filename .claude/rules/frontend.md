# Frontend Rules

Use TypeScript strictly.

Avoid `any`.

Prefer server components where appropriate.

Use client components only when interactivity requires them.

Keep components small.

Do not create giant page components.

Use feature folders.

Example:

src/features/menu/
├── components/
├── hooks/
├── services/
├── types/
└── utils/

Reusable components belong in:

src/components/ui/

Business logic belongs in:

src/features/

API communication belongs in:

src/services/

Do not place database queries directly inside presentational components.