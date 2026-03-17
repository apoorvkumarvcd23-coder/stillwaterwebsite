# Stillwater Unified Stack

This repository contains:

- Main website (Express) in the repo root
- Recommendation backend (Express + Prisma) in Recommendation_Website/backend
- Recommendation frontend (Next.js) in Recommendation_Website/frontend

## Local Development (Docker)

1. Set environment variables in a local .env file at the repo root:
   - SESSION_SECRET
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - ADMIN_EMAIL

2. Start all services:

   ```bash
   docker compose up --build
   ```

3. Run the recommendation rules seed once:
   ```bash
   docker compose exec recommendation-backend node prisma/seed.js
   ```

Services:

- Main website: http://localhost:3000
- Recommendation frontend: http://localhost:3002
- Recommendation backend: http://localhost:3001

## Auth Flow

Recommendation pages require Google OAuth login via the main website. Unauthenticated users are redirected to the Google OAuth flow and returned to the intended recommendation page.

## Prisma Migrations

For the recommendation backend:

```bash
cd Recommendation_Website/backend
npx prisma migrate dev
npx prisma generate
```

## Render Deployment Notes

- Deploy three services (main, recommendation backend, recommendation frontend) and one managed PostgreSQL database.
- Ensure `NEXT_PUBLIC_AUTH_BASE_URL` points to the main website domain.
- Ensure `NEXT_PUBLIC_API_BASE_URL` points to the recommendation backend domain.
- Set `COOKIE_DOMAIN` if you use a shared custom domain and need cookies available across subdomains.
