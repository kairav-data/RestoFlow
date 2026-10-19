# Database Rules

Database:

PostgreSQL

ORM:

Prisma

Every major entity must have:

- id
- createdAt
- updatedAt

Use UUIDs for externally exposed identifiers.

Support multi-tenancy.

Every restaurant-owned entity must be associated with:

restaurantId

Branch-specific entities should additionally use:

branchId

Never allow queries to access another restaurant's data.

Use database constraints where possible.

Do not solve data integrity only at application level.