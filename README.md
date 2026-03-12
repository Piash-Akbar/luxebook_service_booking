# LuxeBook — Premium Service Booking App

A full-stack booking website built with Next.js 14, Firebase, Stripe, and Nodemailer.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Firebase Firestore
- **Payments**: Stripe Checkout
- **Email**: Nodemailer (Gmail SMTP)
- **Deployment**: Vercel

---

## Features

### User-Facing
- 🎨 Elegant, responsive UI with smooth animations
- 📋 Browse 6 premium services across categories
- 🔍 Filter services by category
- 📝 Booking form with validation
- 💳 Stripe Checkout payment integration
- ✅ Success/cancel pages
- 📧 Email confirmation after payment

### Admin Panel (`/admin`)
- 🔐 Password-protected access
- 📊 Dashboard stats (total, confirmed, revenue)
- 📋 Full bookings table with search & filters
- 🔄 Update booking status (pending/confirmed/completed/cancelled)
- 🗑️ Delete bookings
- 📋 Detailed booking view panel

---

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd booking-app
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database** (start in test mode)
4. Go to **Project Settings → General** → copy the Web App config
5. Go to **Project Settings → Service Accounts** → Generate new private key
6. Copy the values to `.env.local`

### 3. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **Publishable Key** and **Secret Key** from API Keys
3. For webhooks:
   - Install Stripe CLI: `npm install -g @stripe/stripe-js`
   - Run: `stripe listen --forward-to localhost:3000/api/webhook`
   - Copy the **webhook signing secret**
4. For production: add webhook in Stripe Dashboard → Developers → Webhooks
   - Endpoint URL: `https://your-domain.com/api/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`

### 4. Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Create an app password for "Mail"
4. Use this 16-character password as `EMAIL_PASS`

### 5. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

### 6. Run Development Server

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhook
```

Visit `http://localhost:3000`

---

## Deployment to Vercel

1. Push your code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!
5. After deployment, update `NEXT_PUBLIC_APP_URL` to your Vercel URL
6. Add the production webhook URL in your Stripe dashboard

---

## Project Structure

```
booking-app/
├── app/
│   ├── api/
│   │   ├── create-checkout-session/route.ts  # Stripe checkout
│   │   ├── webhook/route.ts                   # Stripe webhook
│   │   └── bookings/route.ts                  # Admin CRUD API
│   ├── admin/page.tsx                         # Admin dashboard
│   ├── success/page.tsx                       # Payment success
│   ├── cancel/page.tsx                        # Payment cancel
│   ├── layout.tsx
│   ├── page.tsx                               # Homepage
│   └── globals.css
├── components/
│   ├── ServiceCard.tsx                        # Service listing card
│   └── BookingModal.tsx                       # Booking form modal
├── lib/
│   ├── firebase.ts                            # Firebase client
│   ├── firebase-admin.ts                      # Firebase admin SDK
│   ├── stripe.ts                              # Stripe instance
│   ├── email.ts                               # Email functions
│   └── services-data.ts                       # Service definitions
├── types/
│   └── index.ts                               # TypeScript types
└── .env.local.example
```

---

## Admin Access

Visit `/admin` and use your `ADMIN_SECRET_KEY` from `.env.local`.

---

## Customizing Services

Edit `/lib/services-data.ts` to add, remove, or modify services. Each service has:
- `id`, `name`, `description`
- `price` (in cents — e.g., 12000 = $120.00)
- `duration`, `category`, `icon`, `features`
- `popular` (optional badge)
