# Neighbour Friendly Rentals (NFR)

A peer-to-peer rental marketplace where people rent out items, rooms and local services to others nearby, instead of buying things they need once.

**Live:** [neighbourfriendly.vercel.app](https://neighbourfriendly.vercel.app) · Reached **500+ monthly active users** at peak.

I took NFR from idea to production on my own: product decisions, UX, the full-stack build, database security and day-to-day operations.

## What it does

- **Listings** for items, properties and services, with photos (compressed in the browser before upload), favourites and reviews
- **Bookings** with an availability calendar, owner approval and booking history
- **In-app messaging** between renters and owners
- **Rental agreements** generated as PDFs from booking details
- **Payments** through Razorpay, with server-side payment verification
- **ID verification** and an admin panel for moderating users and listings
- **AI assistant** (Gemini) that answers questions about listings and suggests items
- **Email** for sign-up, password reset and booking events (Supabase Edge Functions + Resend)
- **Premium plans** with automatic expiry handled by a scheduled Edge Function

## Architecture

```
Next.js (App Router) on Vercel
  ├── app/            pages: listings, bookings, messages, dashboard, admin, blog
  ├── app/api/        chat, payment verification, admin auth, text-to-speech, product feed
  ├── services/       booking, listing, messaging, payment, agreement, verification logic
  └── lib/            Supabase clients (browser + server), rate limiting
            │
            ▼
Supabase
  ├── Postgres with row-level security
  ├── Auth
  ├── Storage (listing images)
  └── Edge Functions: handle-signup, send-email, send-reset-password, check-premium-expiry, share
```

## Security work

Running a real marketplace meant fixing real problems. The migrations in `supabase/migrations/` record them:

- Tightened row-level security so users can read only their own private profile fields (`fix_profile_data_exposure`)
- Fixed recursive RLS policies that caused query failures (`fix_rls_recursion`, `phase2`)
- Rate limiting on API routes that call paid services (`lib/rateLimit.ts`)
- Sanitised user-generated HTML with DOMPurify
- A dedicated Playwright security test suite (`e2e/tests/security.spec.ts`)

## Tests

End-to-end tests with Playwright cover auth, dashboard, listings, messaging, profile, public pages and security:

```bash
npm run test:e2e
npm run test:e2e:security
```

## Run locally

```bash
npm install
cp .env.example .env.local     # Supabase URL and anon key, Razorpay, Gemini, Resend keys
npm run dev
```

## Tech stack

Next.js · React · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage, Edge Functions) · Razorpay · Google Gemini · Resend · Playwright · Sentry · Vercel

More detail on notifications: [`docs/notifications.md`](docs/notifications.md)
