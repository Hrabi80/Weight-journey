# WeightWise

Wellness tracker built with Next.js App Router. Capture baseline info, generate a personalized dashboard, and experiment in demo mode without an account.

## Project description (plain language)
WeightWise helps you and your coach or nutritionist keep tabs on progress. Enter your height, age, and starting weight, then log daily weight, sleep, calories, and steps. The app turns those entries into easy-to-read charts, highlights weight zones, and offers a demo mode so you can explore without creating an account. All information lives in your browser—no server or signup required.

## What you can do
- **Landing page (`app/page.tsx`)** – marketing hero with gradient background, CTA buttons to start the questionnaire, log in, or jump into demo mode.
- **Questionnaire flow (`/questionnaire`)** – two-step experience: collect age/height/weight, then sign up or sign in. A demo shortcut is always available.
- **Dashboard (`/dashboard`)** – shows BMI-aware weight history, wellness trackers (sleep, calories, steps), KPI tiles, and quick logging for today. Supports a demo data set via `?demo=1`.
- **Loading UX** – dedicated spinner/loader components for route transitions and suspense fallbacks.

## Core pieces
- **Session state** – `components/session-context.tsx` keeps profile, weight entries, questionnaire answers, and demo state in memory. User sessions are generated locally (`lib/session.ts`), no backend required.
- **Charts** – Recharts-powered weight chart with BMI zones (`components/weight-chart.tsx`) and wellness metrics chart (`components/wellness-metrics-chart.tsx`).
- **Trackers** – Additional quick-log cards for sleep, calories, and steps (`components/additional-trackers.tsx`).
- **UI kit** – Shadcn-inspired controls in `components/ui/*` plus layout primitives (`Box`, `Flex`, `Stack`, `Grid`, `Container`, etc.) in `components/layout/*`.
- **Styling** – Tailwind CSS v4 with custom utilities defined in `app/globals.css` (e.g., `bg-gradient-hero`, `text-gradient-primary`, `shadow-soft`, `card-hover`). Design tokens (colors, radii, shadows, fonts) are declared via CSS variables.

## Running the project
```bash
pnpm install
pnpm dev       # start Next.js dev server at http://localhost:3000
pnpm lint      # run ESLint
pnpm build     # production build
pnpm start     # serve the production build
```

## Helpful routes & query params
- `/questionnaire?mode=login` – open the signup step in login mode.
- `/dashboard?demo=1` – launch the dashboard with demo data seeded from `generateDemoData`.

## Project layout (selected)
```
app/
  page.tsx               # landing hero
  questionnaire/page.tsx # questionnaire + signup
  dashboard/page.tsx     # main dashboard
  globals.css            # theme tokens + utilities
components/
  dashboard.tsx
  weight-chart.tsx
  wellness-metrics-chart.tsx
  additional-trackers.tsx
  session-context.tsx
  layout/*               # layout primitives
  ui/*                   # form and surface primitives
lib/
  session.ts             # demo/user session generation
  bmi.ts                 # BMI helpers
```

## Notes for developers
- The app uses client-side state only; persistence is not wired up yet.
- Gradients and text effects live in the utilities layer of `globals.css`; no per-page imports are needed.
- Charts are dynamically imported to avoid SSR issues; keep props serializable.
