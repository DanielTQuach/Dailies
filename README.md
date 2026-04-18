This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment variables

Copy `.env.example` to `.env.local` and fill in values as you add features.

Environment variables are validated at startup via `lib/env.ts` using `zod`.

- In **development**, `NEXT_PUBLIC_APP_URL` defaults to `http://localhost:3000`.
- On **Vercel Production** (`VERCEL_ENV=production`), `NEXT_PUBLIC_APP_URL` must be set to your real deployed URL (not the localhost default).

## Authentication (Clerk)

This app uses [Clerk](https://clerk.com/) for authentication.

1. Create a Clerk application and copy **Publishable key** and **Secret key** into `.env.local` (and `.env` if you use Prisma CLI patterns from above).
2. Sign-in and sign-up routes live at `/sign-in` and `/sign-up` (see `app/sign-in` / `app/sign-up`).

`CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are **required** at build time because `lib/env.ts` validates them.

### Protected routes

`middleware.ts` treats `/`, `/sign-in`, and `/sign-up` as **public**. All other matched routes (including `/dashboard`) require a signed-in user via `auth.protect()`.

### Onboarding

After sign-in, new users are redirected to **`/onboarding`** until they submit a display name. `app/dashboard/layout.tsx` enforces `User.onboardingCompleted` in the database.

This requires **`DATABASE_URL`** (Prisma) plus Clerk keys, because onboarding persists to the `User` table via `lib/ensure-user.ts`.

## Database (Prisma)

Prisma is configured for **PostgreSQL** (`prisma/schema.prisma`). This repo pins **Prisma 6** so `DATABASE_URL` stays in `schema.prisma` (Prisma 7 moved connection config). Use `DATABASE_URL` in `.env.local` (see `.env.example`) for Next.js, and **also** put it in `.env` if you want Prisma CLI commands (`migrate`, `validate`, `generate` in some setups) to pick it up automatically—Prisma reads `.env` by default, not `.env.local`.

Common commands:

```bash
npm run db:generate   # regenerate Prisma Client after schema changes
npm run db:migrate    # create/apply migrations (needs DATABASE_URL)
npm run db:push       # push schema to DB without migrations (dev only)
npm run db:studio     # open Prisma Studio
```

Import the shared client from `lib/prisma.ts` in server code (API routes, Server Actions, `server-only` modules). `postinstall` runs `prisma generate` so CI and deploys get a generated client after `npm install`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
