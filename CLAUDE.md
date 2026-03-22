# LaoDev - Laos Developer Community Platform

## Tech Stack
- **Framework:** React Router v7 (SPA mode, ssr: false)
- **Build:** Vite
- **Language:** TypeScript (strict mode)
- **Database:** MongoDB via Prisma ORM
- **Styling:** Tailwind CSS v4 + shadcn/ui (new-york style)
- **Package Manager:** bun

## Commands
- `bun run dev` — start dev server
- `bun run build` — production build
- `bun run db:generate` — generate Prisma client
- `bun run db:push` — push schema to MongoDB
- `bun run lint` — run ESLint

## Project Structure
```
app/
  root.tsx          — root layout (html, head, body)
  routes.ts         — all route definitions
  routes/           — route modules (dot-delimited naming)
  globals.css       — global styles + custom animations
components/         — shared components (navigation, footer, cards, modals)
components/ui/      — shadcn/ui primitives
lib/
  utils.ts          — cn() utility
  prisma.ts         — Prisma client singleton
prisma/
  schema.prisma     — MongoDB schema (10 models)
hooks/              — custom React hooks
public/             — static assets
```

## Routing Conventions
- Route files use dot-delimited naming: `admin.users.tsx`, `developer.bookings.tsx`
- Dynamic params use `$`: `developers.$id.tsx`, `posts.$id.tsx`
- Admin routes are wrapped in `admin.layout.tsx` (uses `<Outlet />`)
- Routes defined explicitly in `app/routes.ts` (not file-based)

## Prisma Models
User, Developer, Education, Post, Comment, Article, Booking, Review, Message, Payment

## Code Conventions
- Use `bun` for all package management and script running (not npm/pnpm/npx)
- Use `import { Link } from "react-router"` (not next/link)
- Use `useNavigate`, `useParams`, `useLocation` from `react-router`
- No `"use client"` directives (not needed in React Router v7)
- Path alias: `@/*` maps to project root
- shadcn/ui components live in `components/ui/`
- Dark theme by default (oklch color system)
