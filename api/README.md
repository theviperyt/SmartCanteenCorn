# Smart Canteen — Backend API

A Node.js + Express REST API that powers the Smart Canteen system. It handles user registration and authentication, menu management for admins, order placement for customers, and automated order expiry via a cron scheduler.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB (via Mongoose 9) |
| Auth | JWT (cookie-based) |
| Validation | Joi |
| Password Hashing | Argon2 |
| Logging | Winston |
| Scheduling | node-cron |
| Rate Limiting | express-rate-limit |
| HTTP Logger | Morgan |

---

## Project Structure

```
api/
├── src/
│   ├── server.js               # App factory & bootstrap
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── logger.js           # Winston logger setup
│   ├── controllers/
│   │   ├── user.js             # register / login / logout
│   │   ├── menu.js             # CRUD for menu items
│   │   └── order.js            # Place / view / cancel orders
│   ├── routers/
│   │   ├── userAuth.js         # /api/user routes
│   │   ├── menuAuth.js         # /api/auth routes  (menu)
│   │   └── orderAuth.js        # /api/order routes
│   ├── middleware/
│   │   ├── authUser.js         # JWT verification
│   │   ├── authRole.js         # Role-based access control
│   │   └── rateLimiter.js      # Global + sensitive limiters
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Menu.js             # Menu item schema
│   │   └── Order.js            # Order schema
│   ├── utils/
│   │   ├── genToken.js         # JWT signing helper
│   │   └── validate.js         # Joi validation schemas
│   └── cron/
│       └── autoCancelOrders.js # Cron: auto-cancel stale orders every minute
├── logs/
│   ├── combined.log
│   └── error.log
├── .env
├── package.json
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (or a connection URI)

### Steps

```bash
# 1. Clone/navigate to the backend directory
cd "Smart Canteen/api"

# 2. Install dependencies
npm install

# 3. Configure environment variables (see below)
cp .env.example .env   # or create .env manually

# 4. Start in development mode (with nodemon)
npm run dev

# 5. Start in production mode
npm start
```

---

## Environment Variables

Create a `.env` file in the `api/` root:

```env
# App
NODE_ENV=development       # "development" | "production"
PORT=3000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/canteen-db

# Auth
JWT_SECRET=your_super_secret_jwt_key_here

# CORS (restrict to your frontend origin in production)
ALLOWED_ORIGIN=http://localhost:5173
```
---

## API Reference

All endpoints are prefixed with the base URL: `http://localhost:3000`

Authentication uses **HTTP-only cookies**. After login/register, the `token` cookie is set automatically.

---

### Auth / User — `/api/auth`

#### `POST /api/auth/register`
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "phone": 9876543210,
  "password": "secret123",
  "role": "user"
}
```

| Field | Type | Rules |
|---|---|---|
| `name` | string | min 3, max 30 chars, required |
| `phone` | number | required (must be a valid phone number) |
| `password` | string | min 6 chars, required |
| `role` | string | `"user"` or `"admin"`, defaults to `"user"` |

**Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully :- <userId>",
  "data": { "id": "...", "username": "John Doe", "role": "user" }
}
```

---

#### `POST /api/auth/login`
Login and receive a session cookie.

**Body:**
```json
{
  "phone": 9876543210,
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "User logged in successfully :- <userId>",
  "data": { "id": "...", "username": "John Doe", "role": "user" }
}
```

---

#### `POST /api/auth/logout`
Clear the session cookie.

**Response `200`:**
```json
{ "success": true, "message": "User logged out successfully" }
```

---

### Menu — `/api/menu`

> All menu routes require authentication (`authUser` middleware). Write operations require `admin` role.

#### `GET /api/menu/getmenu`
Get all menu items (name, price, stock).

**Response `200`:**
```json
{
  "success": true,
  "message": "Menu items fetched successfully",
  "data": [{ "name": "Masala Dosa", "price": 40, "stock": 20 }]
}
```

---

#### `GET /api/menu/available`
Get only currently available (in-stock) items.

**Response `200`:**
```json
{
  "success": true,
  "message": "Current available items fetched successfully",
  "data": [{ "_id": "...", "name": "Masala Dosa", "price": 40, "stock": 20 }]
}
```

---

#### `POST /api/menu/additem` 🔒 `admin`
Add a new menu item.

**Body:**
```json
{
  "name": "Masala Dosa",
  "price": 40,
  "stock": 50
}
```

| Field | Type | Rules |
|---|---|---|
| `name` | string | required |
| `price` | number | > 0, required |
| `stock` | number | > 0, required |

**Response `201`:**
```json
{
  "success": true,
  "message": "Menu item added successfully",
  "data": { "_id": "...", "name": "Masala Dosa", "price": 40, "stock": 50, "isAvailable": true }
}
```

---

#### `PUT /api/menu/updateitem/:id` 🔒 `admin`
Update an existing menu item. All fields are optional.

**Params:** `:id` — MongoDB ObjectId of the menu item

**Body (partial update):**
```json
{
  "price": 45,
  "stock": 30
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": { "_id": "...", "name": "Masala Dosa", "price": 45, "stock": 30, "isAvailable": true }
}
```

---

#### `DELETE /api/menu/deleteitem/:id` 🔒 `admin`
Delete a menu item. A confirmation query parameter is required.

**Params:** `:id` — MongoDB ObjectId  
**Query:** `?confirm=yes` to confirm deletion, `?confirm=no` to cancel

```
DELETE /api/auth/deleteitem/64abc...?confirm=yes
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Menu item deleted successfully",
  "deletedItem": { ... }
}
```

---

### Orders — `/api/order`

> All order routes require authentication (`authUser` middleware).

#### `POST /api/order/placeorder`
Place a new order. Deducts stock immediately. Order expires in 15 minutes if not confirmed.

**Body:**
```json
{
  "items": [
    { "name": "Masala Dosa", "quantity": 2 },
    { "name": "Filter Coffee", "quantity": 1 }
  ]
}
```

**Response `201`:**
```json
{
  "message": "Order placed successfully",
  "order": {
    "orderId": "...",
    "totalPrice": 95,
    "totalItemOrdered": 3,
    "status": { "value": "PENDING" },
    "expiresAt": "2026-03-20T09:15:00.000Z"
  }
}
```

**Error cases:** 404 if item not found / unavailable; 400 if out of stock or insufficient stock.

---

#### `GET /api/order/getorder/:id`
Get a single order by ID.

**Params:** `:id` — MongoDB ObjectId of the order

**Response `200`:** Full order document.

---

#### `GET /api/order/totalorders`
Get all orders placed by the currently authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "totalOrders": 3,
  "orderDetails": [
    {
      "_id": "...",
      "items": [{ "menuName": "Masala Dosa", "quantity": 2 }],
      "totalPrice": 80,
      "status": { "value": "CONFIRMED" },
      "createdAt": "..."
    }
  ]
}
```

---

#### `PUT /api/order/changestatus/:id` 🔒 `admin`
Change the status of an order.

**Params:** `:id` — MongoDB ObjectId of the order

**Body:**
```json
{
  "status": "CONFIRMED"
}
```

| `status` value | Behaviour |
|---|---|
| `"CONFIRMED"` | Confirms the order |
| `"CANCELLED"` | Cancels and restocks all items |

**Response `200`:**
```json
{
  "message": "Order status changed successfully",
  "order": { ... }
}
```

---

## Order Lifecycle

```
PENDING  ──(admin confirms)──► CONFIRMED
PENDING  ──(admin cancels)───► CANCELLED  (stock returned)
PENDING  ──(15 min passes, cron runs)──► CANCELLED  (stock returned automatically)
```

The cron job (`autoCancelOrders.js`) runs **every minute** and automatically cancels any orders that are still `PENDING` past their `expiresAt` timestamp, restoring the stock.

---

## Error Responses

All endpoints return a consistent error shape:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

| HTTP Code | Meaning |
|---|---|
| `400` | Bad request / validation error |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role |
| `404` | Resource not found |
| `429` | Too many requests (rate limit hit) |
| `500` | Internal server error |

---

## Rate Limiting

| Limiter | Routes | Limit |
|---|---|---|
| `globalLimiter` | All routes | 100 req / 15 min per IP |
| `sensitiveLimiter` | `/api/user/register`, `/api/user/login` | 5 req / 15 min per IP |

---

## Logging

Logs are written using **Winston** to:

- `logs/combined.log` — all log levels
- `logs/error.log` — errors only (with stack traces)
- Console — enabled in `development` mode (colorized)

---

## Scripts

```bash
npm run dev     # Start with nodemon (auto-reloads on file change)
npm start       # Start with plain node
```

---

## Author

**Subham Banerjee**
