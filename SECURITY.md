# Security Overview

This document outlines the security measures implemented in the TradeIn Pro widget app and the steps required to operate it safely in production.

## Summary of controls

- Authentication
  - Staff login issues JWT tokens signed with `JWT_SECRET` and 1h expiry
  - Token is also set as HttpOnly, SameSite=Strict cookie (`auth_token`), Secure in production

- Authorization
  - All `pages/api/staff/**` routes require a valid JWT and enforce roles via `withAuth(roles)`

- Rate limiting
  - In-memory, per-IP buckets via `withRateLimit`
  - Defaults:
    - Login: 5/min
    - Staff APIs: 60/min
    - Uploads: 20/min
    - Public trade-in: submit/respond 30/min, track 60/min
  - Replace with a distributed store (Redis/Upstash) for production

- Input validation
  - zod schemas validate body payloads and normalize numeric fields

- CORS & Security headers
  - `next.config.js` removes wildcard CORS and sets:
    - `Access-Control-Allow-Origin` to `NEXT_PUBLIC_SITE_ORIGIN`
    - CSP: limits scripts, images, and connections to self + Supabase
    - `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`
    - `Permissions-Policy` denies geo/mic/camera
    - HSTS in production

- Supabase service role usage
  - `supabaseAdmin` uses `SUPABASE_SERVICE_ROLE_KEY` only in serverless API routes
  - Staff endpoints that mutate data are protected by JWT

## Operational guidance

- Environment
  - Set a strong `JWT_SECRET`
  - Set `NEXT_PUBLIC_SITE_ORIGIN` to your domain (e.g., `https://example.com`)
  - Ensure `SUPABASE_SERVICE_ROLE_KEY` is stored only in server environment variables

- Logging
  - Avoid logging sensitive data in production. Remove or reduce debugging logs.

- Sessions & CSRF
  - Prefer reading JWT from HttpOnly cookie server-side
  - SameSite=Strict minimizes CSRF risk; for cross-site admin surfaces, add CSRF tokens

- Rate limit backing store (prod)
  - Replace `withRateLimit` with a Redis-backed limiter to survive restarts and scale horizontally

- Content Security Policy
  - Review and tailor CSP to any added domains (e.g., analytics, fonts)

## Files of interest

- `apps/widget/src/lib/security.ts`: `withAuth`, `withRateLimit`
- `apps/widget/src/pages/api/auth/staff-login.ts`: issues cookie + JWT
- `apps/widget/next.config.js`: headers and CORS allowlist

## Future enhancements

- JWT refresh tokens and rotation
- Signed URLs for uploads instead of raw image POSTs
- Fine-grained RBAC: admin vs staff permissions per route
- Structured audit logging of admin actions


