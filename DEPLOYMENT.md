# Deployment Guide

## Local Development Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### 2. Sanity CMS Setup

```bash
# Create a new Sanity project (one time)
npx sanity@latest init

# Or use an existing project — get project ID from sanity.io/manage
# Set in .env.local:
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

Get your API token: `sanity.io/manage → Project → API → Tokens`
Set permissions to **Editor** for the token.

### 3. Database (PostgreSQL)

Option A — **Neon** (recommended, free tier):
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

Option B — **Supabase**:
```
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

Run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → Enable OAuth 2.0
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy client ID and secret to `.env.local`

### 5. Stripe

```bash
# Get keys from stripe.com/dashboard (use Test mode)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Webhook setup (local):
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook secret to .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 6. Run the App

```bash
npm run dev
# Open http://localhost:3000
# Sanity Studio: http://localhost:3000/studio
```

---

## Vercel Deployment

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ecommerce-store.git
git push -u origin main
```

### Step 2 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables from `.env.example`
   - `NEXTAUTH_URL` → your Vercel domain (e.g., `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_SITE_URL` → same as above

### Step 3 — Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-app.vercel.app/api/webhooks/stripe`
3. Events to listen: `checkout.session.completed`
4. Copy webhook secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

### Step 4 — Configure Sanity CORS

1. Go to sanity.io/manage → Your project → API → CORS Origins
2. Add `https://your-app.vercel.app`
3. Allow credentials: ✓

### Step 5 — Configure Google OAuth for Production

1. Go to Google Cloud Console → OAuth 2.0
2. Add authorized redirect URI:
   `https://your-app.vercel.app/api/auth/callback/google`

### Step 6 — Database Migration

```bash
# Run against production DB
DATABASE_URL=your_production_url npx prisma migrate deploy
```

---

## Post-Deployment Checklist

- [ ] Add test products in Sanity Studio (`/studio`)
- [ ] Test checkout with Stripe test card `4242 4242 4242 4242`
- [ ] Verify webhook creates order in DB
- [ ] Test Google login
- [ ] Test magic link email login
- [ ] Verify order history page
- [ ] Check mobile responsiveness
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production URL

## Test Credit Cards (Stripe)

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | 3D Secure required |

Use any future expiry date (e.g., 12/28), any CVC, any postal code.

---

## Project Structure

```
ecommerce-store/
├── app/
│   ├── (store)/          # Store pages with Navbar + Footer
│   │   ├── page.tsx      # Home page
│   │   ├── shop/         # Product listing
│   │   │   └── [slug]/   # Single product (ISR 60s)
│   │   ├── cart/         # Cart page
│   │   ├── checkout/     # Checkout (Stripe redirect)
│   │   └── order-success/# Post-payment confirmation
│   ├── (auth)/
│   │   └── login/        # NextAuth login page
│   ├── account/
│   │   └── orders/       # Order history (auth required)
│   ├── studio/           # Sanity CMS Studio
│   └── api/
│       ├── auth/         # NextAuth handler
│       ├── checkout/     # Stripe session creation
│       ├── webhooks/stripe/ # Stripe payment webhook
│       └── orders/       # Order lookup API
├── components/
│   ├── layout/           # Navbar, Footer
│   ├── product/          # ProductCard, ProductGrid, ProductFilters
│   └── cart/             # CartDrawer
├── lib/
│   ├── sanity.ts         # Sanity client + GROQ queries
│   ├── stripe.ts         # Stripe client
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # Helpers + constants
├── sanity/schemas/       # Product, Category, Order schemas
├── store/cartStore.ts    # Zustand cart (persisted to localStorage)
├── types/index.ts        # TypeScript interfaces
└── prisma/schema.prisma  # DB schema (User, Order, etc.)
```
