# VoltEdge Deployment Guide

> Deploy the backend to **Railway** and the frontend to **Vercel**.

---

## Prerequisites

- GitHub account (push your code to a repo)
- [Railway account](https://railway.app) (free tier works)
- [Vercel account](https://vercel.com) (free tier works)
- MongoDB Atlas cluster (free M0 tier works)
- Razorpay test account with Key ID + Secret

---

## Part 1 — MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free M0 cluster.
2. Under **Database Access**, create a user with username + password.
3. Under **Network Access**, add `0.0.0.0/0` (allow all IPs — required for Railway/Vercel).
4. Click **Connect → Connect your application** and copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/voltedge?retryWrites=true&w=majority
   ```
5. Save this as `MONGODB_URI`.

---

## Part 2 — Backend on Railway

### Step 1: Create Railway project

1. Log in to [railway.app](https://railway.app)
2. Click **New Project → Deploy from GitHub repo**
3. Select your repository
4. Set the **Root Directory** to `Ecommerce/backend`

### Step 2: Configure environment variables

In the Railway project → **Variables** tab, add every variable from `backend/.env.example`:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` and paste the output |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Your Vercel URL (add AFTER deploying frontend), e.g. `https://voltedge.vercel.app` |
| `CJ_EMAIL` | Your CJ Dropshipping email |
| `CJ_API_KEY` | Your CJ API key |
| `RAZORPAY_KEY_ID` | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | Create a webhook secret in your Razorpay dashboard |
| `SYNC_INTERVAL_HOURS` | `6` |
| `SYNC_MISS_THRESHOLD` | `3` |

### Step 3: Deploy

Railway will auto-detect the `railway.json` and run:
```
npm run build   # tsc
npm start       # node dist/app.js
```

Once deployed, Railway gives you a URL like:
```
https://voltedge-backend-production.up.railway.app
```

Save this as your backend URL.

### Step 4: Verify backend is running

```bash
curl https://your-railway-url.railway.app/health
# Expected: {"status":"ok","service":"VoltEdge API",...}
```

---

## Part 3 — Frontend on Vercel

### Step 1: Create Vercel project

1. Log in to [vercel.com](https://vercel.com)
2. Click **Add New → Project → Import Git Repository**
3. Select your repo
4. Set **Root Directory** to `Ecommerce/frontend`
5. Framework will be auto-detected as **Next.js**

### Step 2: Configure environment variables

In Vercel → **Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-url.railway.app/api` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_...` (your Razorpay public key) |
| `NEXT_PUBLIC_APP_NAME` | `VoltEdge` |
| `NEXT_PUBLIC_APP_URL` | `https://your-vercel-url.vercel.app` |

### Step 3: Deploy

Click **Deploy**. Vercel runs:
```
npm install
npm run build   # next build
```

Your site is live at:
```
https://voltedge.vercel.app
```

---

## Part 4 — Post-Deployment Wiring

### Update CORS on Railway

After your Vercel URL is confirmed, go to Railway → Variables and update:
```
FRONTEND_URL=https://voltedge.vercel.app
```

Then redeploy the backend.

### Set up Razorpay Webhook

1. Log in to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings → Webhooks → Add New Webhook**
3. Set **Webhook URL** to:
   ```
   https://your-railway-url.railway.app/api/webhooks/razorpay
   ```
4. Select events: `payment.captured`, `payment.failed`, `refund.created`
5. Copy the **Webhook Secret** and update `RAZORPAY_WEBHOOK_SECRET` on Railway

### Create the first admin user

After the backend is live, use any MongoDB client (Atlas Data Explorer, Compass, or mongosh):

```javascript
// In mongosh connected to your Atlas cluster:
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Or register normally then update:
```bash
# Using mongosh on the Atlas cluster
use voltedge
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## Part 5 — Custom Domain (Optional)

### Vercel custom domain

1. In Vercel → **Settings → Domains**, add your domain
2. Update DNS records as instructed by Vercel
3. Update `NEXT_PUBLIC_APP_URL` and `FRONTEND_URL` to your custom domain

### Railway custom domain

1. In Railway → **Settings → Domains**, click **Generate Domain** or add a custom one
2. Update `NEXT_PUBLIC_API_URL` in Vercel to the new Railway domain

---

## Environment Summary

### Backend (Railway)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/voltedge
JWT_SECRET=<64-char hex>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://voltedge.vercel.app
CJ_EMAIL=your@email.com
CJ_API_KEY=your_cj_api_key
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
SYNC_INTERVAL_HOURS=6
SYNC_MISS_THRESHOLD=3
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
NEXT_PUBLIC_APP_NAME=VoltEdge
NEXT_PUBLIC_APP_URL=https://voltedge.vercel.app
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors in browser | Ensure `FRONTEND_URL` on Railway matches the Vercel URL exactly (no trailing slash) |
| MongoDB connection refused | Check Atlas Network Access → add `0.0.0.0/0` |
| Razorpay "invalid key" | Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches the Key ID in your Razorpay test dashboard |
| Products not loading | Backend may still be doing the initial sync — check Railway logs. Wait ~2 min and refresh. |
| Admin panel not accessible | Ensure the user document in MongoDB has `role: "admin"` |
| Build fails on Vercel | Check that `NEXT_PUBLIC_API_URL` is set before triggering the build |
