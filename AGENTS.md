# AIBC Client Portal

A Next.js 15 + Tailwind CSS client portal for AI Business Centers address plan members.

## What this is
Client-facing portal at portal.aibusinesscenters.com where AIBC Address plan members log in to:
- View and manage their incoming mail
- Request scans, forwards, shreds, and check deposits (via Anytime Mailbox API)
- Monitor business credit bureau reporting status
- Manage plan and billing (via Stripe)
- Access unit owner resources (if applicable)

## Tech stack
- Next.js 15 App Router
- Tailwind CSS
- Supabase (auth + database)
- Anytime Mailbox API (mail operations)
- Stripe (billing)

## What needs to be configured
1. Supabase: add ANON_KEY and SERVICE_ROLE_KEY to .env.local
2. Anytime Mailbox: confirm OPERATOR_ID in .env.local
3. Stripe: add publishable and secret keys
4. Wire Supabase Auth in /app/api/auth/login/route.ts
5. Pull mailbox_id from user session in /app/api/mail/route.ts

## Current state
- Login page complete
- Dashboard home complete
- Mail inbox page complete (wired to API, returns empty until operator ID configured)
- Requests history page (shell)
- Billing page complete (plan display, add-ons, one-time services)
- Credit status page complete (upsell and active states)
- Auth API route stubbed (needs Supabase keys)
- Anytime Mailbox client library complete (lib/anytime-mailbox.ts)
