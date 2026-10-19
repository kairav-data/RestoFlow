# Security Rules

Never expose secrets.

Never commit:

.env
.env.local
private keys
API credentials

Validate all external input.

Validate authorization server-side.

Never trust:

restaurantId
branchId
customerId
orderId

from client requests without verifying ownership.

Every restaurant-scoped request must verify tenant access.

Payment operations must be server-side.

Never store raw card information.