# O'Young Dumplings · 团购点餐

A bilingual (中文 / English) group-buy ordering site for a Chinese restaurant in the US. Customers join a
group order for a pickup location; the more people join before it closes, the bigger everyone's discount.

## How it works

1. **Join a group.** Each pickup location has an open group order with a deadline and a share link.
2. **Order and authorize.** Checkout authorizes the full price with Stripe (`capture_method: manual`); no money
   is taken yet.
3. **Close the group.** A Vercel cron job calls `/api/groups/close` (protected by a secret). For each expired
   group it looks up the discount tier reached by the number of people, then **captures each payment at the
   discounted amount**. Customers only ever pay the final group price, and nobody needs a refund.
4. **Notify.** Order confirmations and new-order alerts go out through Resend; the restaurant follows orders on an admin dashboard.

The discount ladder (seeded as 3 people → 5%, 5 → 10%, 10 → 20% off) lives in the database, so the restaurant can change it without a
deploy. The group page shows the current tier, the next tier, and the time left.

## Stack

| Part | Tool |
|---|---|
| App | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Data | Supabase (Postgres), schema and seed menu in `supabase/migrations/` |
| Payments | Stripe PaymentIntents with manual capture, webhook for payment status |
| Email | Resend |
| i18n | next-intl, `messages/zh.json` and `messages/en.json` (Chinese by default) |
| State | Zustand cart, Zod validation |
| Hosting | Vercel, with a daily cron to close groups |

## Run locally

```bash
cp .env.local.example .env.local   # fill in Supabase, Stripe and Resend keys
npm install
npm run dev                        # http://localhost:3000
```

Run `supabase/migrations/000_run_all.sql` in the Supabase SQL editor to create the tables and seed the menu.
