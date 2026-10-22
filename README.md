# LedgerPro API

Secure booking backend for **LedgerPro Accountants** — clients book tax-consultation and audit-review slots, staff manage services and capacity. Built with Node.js, Express 5, MongoDB (Mongoose), JWT and bcrypt.

## Setup

```bash
npm install
cp .env.example .env      # then edit values
npm run seed              # creates the first admin
npm run dev               # http://localhost:5000
```

## Project structure

```
src/
  config/db.js            MongoDB connection
  models/                 User, Service, Booking (schemas + indexes)
  middleware/             auth (JWT), role (RBAC), error (central handler)
  controllers/            request logic
  routes/                 route definitions
  app.js / server.js      app setup / entry point
scripts/seed.js           creates admin account
```

## Roles

| Role | How created | Access |
|------|-------------|--------|
| customer | public `/register` | own bookings |
| staff | created by admin | manage services, view all bookings |
| admin | `npm run seed` | everything staff can + create staff |

## API endpoints

Protected routes need header `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/health | public | Health check |
| POST | /api/auth/register | public | Register a customer. Body: `name, email, password (8+)` |
| POST | /api/auth/login | public | Returns `{ token, role, name }` |
| GET | /api/auth/me | any logged-in | Current user profile |
| POST | /api/auth/staff | admin | Create a staff account |
| GET | /api/services | public | List active services |
| POST | /api/services | staff, admin | Create service. Body: `name, durationMins, dailyCapacity, description` |
| PATCH | /api/services/:id | staff, admin | Update service fields |
| DELETE | /api/services/:id | staff, admin | Deactivate service (soft delete) |
| GET | /api/customer/bookings | customer | Own bookings only |
| GET | /api/staff/bookings | staff, admin | All bookings with customer info |

### Example

```bash
curl -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@ledgerpro.com","password":"Admin@12345"}'
```

## Error codes

All errors return `{ "error": "CODE", "message": "..." }`.

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | VALIDATION_ERROR | Missing or invalid fields |
| 400 | INVALID_ID | Malformed MongoDB id |
| 400 | BAD_JSON | Malformed JSON body |
| 401 | NO_TOKEN | Authorization header missing |
| 401 | INVALID_TOKEN | Token tampered or malformed |
| 401 | TOKEN_EXPIRED | Token expired, log in again |
| 401 | INVALID_CREDENTIALS | Wrong email or password |
| 403 | FORBIDDEN | Role not allowed for this route |
| 404 | NOT_FOUND | Resource or route does not exist |
| 409 | EMAIL_EXISTS / DUPLICATE | Unique value already used |
| 500 | SERVER_ERROR | Unexpected error (details only in server logs) |

## Data model

- **User** — name, email (unique), password (hash, `select: false`), role
- **Service** — name, durationMins, dailyCapacity, isActive, createdBy → User
- **Booking** — customer → User, service → Service, slotStart, status, notes

Indexes:
- `User.email` unique, `User.role`
- `Service {isActive, name}` for the public listing
- `Booking {customer, slotStart:-1}` for "my bookings"
- `Booking {service, slotStart, status}` for capacity checks and staff calendar

## Architectural decision log

**ADR-1: Separate User, Service and Booking collections, linked by references.**
Services and users change independently of bookings, and bookings grow fastest. References avoid duplicating data. Trade-off: reads need `populate()` (extra query), accepted because lists are small and indexed.

**ADR-2: Stateless JWT instead of server sessions.**
The React frontend and API can be deployed separately on free hosts, and no session store is needed. Trade-off: a token cannot be revoked before it expires, so tokens are short-lived (1 day). Refresh tokens can be added later.

**ADR-3: bcrypt with cost 12 for passwords.**
Slow by design to resist brute force. Trade-off: about 250 ms per hash, acceptable for login and register.

**ADR-4: Role comes from the database and token, never from request bodies.**
Public registration always creates a `customer`. Staff are created only by an admin, and the first admin comes from a seed script. This blocks privilege escalation through signup.

**ADR-5: Role-based middleware (`protect` then `allow(...roles)`).**
Authorization lives in one reusable place instead of `if` checks in every controller. Trade-off: roles are coarse; fine-grained ownership checks (e.g. a customer cancelling only their own booking) are done in controllers.

**ADR-6: Soft delete for services.**
Deactivating (`isActive: false`) keeps old bookings pointing at a valid service.

**ADR-7: Central error handler with stable error codes.**
The frontend can branch on `error` codes, and internal errors are not leaked to clients.

## Known limitations (planned for later tasks)

- Booking creation and capacity enforcement
- Rate limiting, helmet, input sanitization (security hardening task)
- Pagination and caching (performance task)
