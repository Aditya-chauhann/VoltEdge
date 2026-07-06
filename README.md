# VoltEdge — Premium Electronics E-Commerce

A full-stack electronics dropshipping store powered by **CJ Dropshipping**, built with Next.js, Express, MongoDB, and Razorpay.

---

## 🏗️ Project Structure

```
Ecommerce/
├── backend/          # Node.js / Express / TypeScript API
│   ├── src/
│   │   ├── app.ts               # App entry point
│   │   ├── config/              # env.ts, db.ts
│   │   ├── controllers/         # Route handlers
│   │   ├── jobs/                # syncProducts.job.ts (cron)
│   │   ├── middleware/          # auth, admin, error, rateLimiter
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # Express routers
│   │   ├── services/            # CJDropshipping, Razorpay
│   │   └── utils/               # asyncHandler, ApiError, ApiResponse
│   ├── .env.example
│   ├── package.json
│   ├── railway.json             # Railway deployment config
│   └── tsconfig.json
│
└── frontend/         # Next.js 14 App Router / TypeScript
    ├── app/
    │   ├── page.tsx             # Home
    │   ├── products/            # Listing + detail pages
    │   ├── category/[slug]/     # Category page
    │   ├── search/              # Search results
    │   ├── cart/                # Cart page
    │   ├── checkout/            # Checkout page
    │   ├── order-confirmed/[id] # Post-purchase confirmation
    │   ├── account/             # Orders, profile, wishlist
    │   └── admin/               # Admin dashboard
    ├── components/              # Reusable UI components
    ├── lib/                     # api.ts, utils.ts
    ├── store/                   # Zustand stores
    ├── types/                   # TypeScript definitions
    ├── .env.example
    ├── package.json
    └── vercel.json              # Vercel deployment config
```

---

## ⚡ Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js 14 (App Router), React 18, TypeScript |
| Styling    | Tailwind CSS, Framer Motion |
| State      | Zustand (with persistence) |
| Backend    | Node.js, Express 4, TypeScript |
| Database   | MongoDB (Mongoose) |
| Auth       | JWT (bcryptjs) |
| Payments   | Razorpay (Test Mode) + Cash on Delivery |
| Sourcing   | CJ Dropshipping API |
| Sync       | node-cron (configurable interval) |

---

## 🚀 Local Development

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- CJ Dropshipping account + API key
- Razorpay test account

### Backend

```bash
cd Ecommerce/backend
cp .env.example .env        # Fill in all values
npm install
npm run dev                 # Starts on http://localhost:5000
```

### Frontend

```bash
cd Ecommerce/frontend
cp .env.example .env.local  # Fill in API URL + Razorpay key
npm install
npm run dev                 # Starts on http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` \| `production` |
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | 64+ char random secret |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated |
| `CJ_EMAIL` | Your CJ Dropshipping account email |
| `CJ_API_KEY` | CJ API key |
| `RAZORPAY_KEY_ID` | Razorpay key ID (`rzp_test_...`) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook validation secret |
| `SYNC_INTERVAL_HOURS` | Hours between sync runs (default: 6) |
| `SYNC_MISS_THRESHOLD` | Misses before marking unavailable (default: 3) |

### Frontend `.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key ID |
| `NEXT_PUBLIC_APP_URL` | Your frontend public URL |

---

## 🧩 Key Features

- **Product Catalog** — synced from CJ Dropshipping every 6 hours (configurable)
- **Search** — text search with autosuggest dropdown
- **Filtering** — by category, price range, in-stock, sort
- **Auth** — JWT-based login/register; forgot password (direct DB reset)
- **Cart** — server-side, locked during checkout, guest-to-auth pending action
- **Checkout** — 2-step (address → payment), Razorpay + COD
- **Orders** — full lifecycle tracking with animated progress tracker
- **Wishlist** — optimistic toggle with server sync
- **Coupons** — validate and apply at cart/checkout
- **Admin** — dashboard, product management, order status updates, sync trigger
- **Webhooks** — Razorpay `payment.captured` / `payment.failed` handled

---

## 📋 API Routes

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password/check
POST /api/auth/forgot-password/reset
GET  /api/auth/me
PUT  /api/auth/profile
POST /api/auth/addresses
```

### Products
```
GET /api/products           ?page&limit&sort&minPrice&maxPrice&category&trending&bestSeller&newArrival&featured
GET /api/products/search    ?q
GET /api/products/autosuggest ?q
GET /api/products/categories
GET /api/products/category/:slug
GET /api/products/:id
```

### Cart / Orders / Wishlist
```
GET|POST|PUT|DELETE /api/cart/...
POST /api/orders/razorpay/create
POST /api/orders/razorpay/verify
POST /api/orders/cod
GET|POST /api/orders/:id/cancel
GET /api/wishlist
POST /api/wishlist/:productId/toggle
```

### Admin (requires admin role)
```
GET  /api/admin/dashboard
GET|PUT /api/admin/orders
GET|PUT|DELETE /api/admin/products
POST /api/admin/sync
GET  /api/admin/sync-logs
```

---

## 🔒 Security

- Helmet.js (security headers)
- CORS restricted to `FRONTEND_URL`
- Rate limiting: 100 req/15min general, 20 req/15min auth, 10/sec webhooks
- Passwords hashed with bcrypt (12 rounds)
- Razorpay webhook HMAC signature verification
- JWT tokens expire in 7 days

---

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.
