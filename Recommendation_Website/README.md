# Wellness Data Collection Web Application

A full-stack wellness intake platform that collects user health and contact data for team follow-up.

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: SQLite (Local Dev) / PostgreSQL (Production)

## Features

- Interactive, multi-step health assessment form with `localStorage` autosave.
- Lead capture funnel with confirmation messaging.
- Stores assessment and contact information in PostgreSQL via Prisma.
- Admin dashboard to track basic conversion metrics and top health issues.

## Setup Instructions

### 1. Database & Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   Create a `.env` file in `backend/` and add:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=3001
   ```
4. Run Prisma migrations and generate the client:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
5. Seed the database with the Service Rules:
   ```bash
   node prisma/seed.js
   ```
6. Start the Express server:
   ```bash
   node src/server.js
   ```

### 2. Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment Notes

- **Frontend**: Deploy to Vercel easily by linking the `frontend` directory via GitHub.
- **Backend**: Deploy to Render or Railway. Set the `DATABASE_URL` appropriately for your production Postgres DB (e.g., Supabase).
- **Database**: Ensure you run `npx prisma db push` or `npx prisma migrate deploy` in your CI/CD pipeline.
