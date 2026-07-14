# ⚡ VoltEdge — Premium Electronics E-Commerce

A modern full-stack electronics dropshipping platform powered by **CJ Dropshipping**, built with **Next.js**, **Express.js**, **MongoDB**, and **Razorpay**.

🌐 **Live Demo:** https://voltedge-app.vercel.app/

---

# 📸 Preview

Visit the live application here:

### 🔗 https://voltedge-app.vercel.app/

---

# ✨ Features

- 🛍️ Premium electronics marketplace
- 🔄 Automatic product synchronization from CJ Dropshipping
- 🔍 Smart product search with autosuggestions
- 🏷️ Categories, filters & sorting
- ❤️ Wishlist
- 🛒 Persistent shopping cart
- 🔐 JWT Authentication
- 📦 Order management
- 💳 Razorpay Payments
- 💵 Cash on Delivery
- 🎟️ Coupon support
- 👤 User profiles & saved addresses
- 📊 Admin dashboard
- 📈 Product sync logs
- 📱 Fully responsive UI
- ⚡ Fast loading with Next.js App Router
- 🎨 Smooth animations using Framer Motion

---

# 🏗️ Project Structure

```
Ecommerce/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── jobs/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   ├── railway.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/
    ├── components/
    ├── lib/
    ├── store/
    ├── types/
    ├── .env.example
    ├── package.json
    └── vercel.json
```

---

# 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State Management | Zustand |
| Backend | Node.js, Express.js |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| Payment Gateway | Razorpay |
| Product Source | CJ Dropshipping API |
| Scheduler | node-cron |
| Deployment | Vercel + Railway |

---

# 🚀 Live Website

### Production

https://voltedge-app.vercel.app/

---

# ⚙️ Local Setup

## Prerequisites

- Node.js 18+
- MongoDB
- CJ Dropshipping Account
- Razorpay Test Account

---

## Clone Repository

```bash
git clone https://github.com/yourusername/VoltEdge.git

cd VoltEdge
```

---

# Backend

```bash
cd backend

cp .env.example .env

npm install

npm run dev
```

Backend runs at

```
http://localhost:5000
```

---

# Frontend

```bash
cd frontend

cp .env.example .env.local

npm install

npm run dev
```

Frontend runs at

```
http://localhost:3000
```

---

# 🔑 Backend Environment Variables

```env
NODE_ENV=

PORT=

MONGODB_URI=

JWT_SECRET=

JWT_EXPIRES_IN=

FRONTEND_URL=

CJ_EMAIL=

CJ_API_KEY=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=

RAZORPAY_WEBHOOK_SECRET=

SYNC_INTERVAL_HOURS=

SYNC_MISS_THRESHOLD=
```

---

# 🔑 Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=

NEXT_PUBLIC_RAZORPAY_KEY_ID=

NEXT_PUBLIC_APP_URL=
```

---

# 🛒 Main Features

## Authentication

- User Registration
- Login
- JWT Authentication
- Profile Update
- Saved Addresses
- Forgot Password

---

## Products

- Product Listing
- Product Details
- Categories
- Search
- Autosuggest
- Price Filter
- Category Filter
- Sorting
- Trending Products
- Best Sellers
- Featured Products
- New Arrivals

---

## Cart

- Add to Cart
- Remove from Cart
- Update Quantity
- Persistent Cart
- Server-side Cart

---

## Wishlist

- Add/Remove Wishlist
- Optimistic UI Updates
- Server Synchronization

---

## Checkout

- Address Selection
- Razorpay Payment
- Cash on Delivery
- Coupon Support
- Order Confirmation

---

## Orders

- Order History
- Order Tracking
- Animated Status Timeline
- Cancel Orders

---

## Admin Panel

- Dashboard
- Product Management
- Order Management
- Trigger Product Sync
- View Sync Logs

---

## Product Synchronization

Products automatically synchronize from CJ Dropshipping.

Configurable through

```
SYNC_INTERVAL_HOURS
```

Unavailable products are automatically hidden after repeated sync failures.

---

# 📡 API Endpoints

## Authentication

```
POST /api/auth/register

POST /api/auth/login

POST /api/auth/forgot-password/check

POST /api/auth/forgot-password/reset

GET /api/auth/me

PUT /api/auth/profile

POST /api/auth/addresses
```

---

## Products

```
GET /api/products

GET /api/products/search

GET /api/products/autosuggest

GET /api/products/categories

GET /api/products/category/:slug

GET /api/products/:id
```

---

## Cart

```
GET /api/cart

POST /api/cart

PUT /api/cart

DELETE /api/cart
```

---

## Orders

```
POST /api/orders/razorpay/create

POST /api/orders/razorpay/verify

POST /api/orders/cod

GET /api/orders/:id

POST /api/orders/:id/cancel
```

---

## Wishlist

```
GET /api/wishlist

POST /api/wishlist/:productId/toggle
```

---

## Admin

```
GET /api/admin/dashboard

GET /api/admin/orders

PUT /api/admin/orders

GET /api/admin/products

PUT /api/admin/products

DELETE /api/admin/products

POST /api/admin/sync

GET /api/admin/sync-logs
```

---

# 🔒 Security

- Helmet Security Headers
- JWT Authentication
- bcrypt Password Hashing
- Razorpay Webhook Signature Verification
- CORS Protection
- Express Rate Limiting
- Protected Admin Routes

---

# 📈 Performance

- Next.js App Router
- Optimized Images
- Lazy Loading
- Server-side Rendering
- Optimistic UI Updates
- Persistent Zustand Store
- Fast API Responses

---

# 🚀 Deployment

## Frontend

Deploy using Vercel

```
https://voltedge-app.vercel.app/
```

---

## Backend

Deploy using Railway

```
railway up
```

---

# 📦 Future Improvements

- Stripe Support
- Google Login
- Email Verification
- Reviews & Ratings
- Product Recommendations
- Recently Viewed Products
- Multi-language Support
- Inventory Analytics
- AI Search
- Push Notifications

---

# 👨‍💻 Developed By

**Aditya Chauhan**

GitHub: https://github.com/yourusername

LinkedIn: https://linkedin.com/in/yourprofile

---

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It helps support future development and makes the project easier for others to discover.

---

## 🌐 Live Demo

### https://voltedge-app.vercel.app/
