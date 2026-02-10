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
- **Session state** – `components/session-context.tsx` keeps profile, weight entries, questionnaire answers, and demo state in memory. It switches between backend and demo repositories at one boundary.
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
- `/dashboard?demo=1` – launch the dashboard with demo data from `src/infrastructure/repositories/demo-dashboard-session.repository.ts`.

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
  types.ts               # UI-facing types
src/
  domaine/services/bmi.service.ts                          # BMI domain rules
  infrastructure/repositories/demo-dashboard-session.repository.ts  # demo adapter
```

## Notes for developers
- Persistence now goes through Supabase (see backend section below); demo mode still runs fully client-side.
- Gradients and text effects live in the utilities layer of `globals.css`; no per-page imports are needed.
- Charts are dynamically imported to avoid SSR issues; keep props serializable.

## Backend (Supabase + Clean architecture)
- Environment: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and `SUPABASE_SERVICE_ROLE_KEY` if you want admin cleanup on failed signups).
- Tables (SQL sketch):
  ```sql
  create table public.profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    username text not null unique,
    age int not null,
    height int not null,
    initial_weight numeric not null,
    created_at timestamptz default now()
  );

  create table public.weight_entries (
    id uuid primary key default uuid_generate_v4(),
    username text not null references public.profiles(username) on delete cascade,
    weight numeric not null,
    recorded_at timestamptz not null default now()
  );

  create table public.wellness_entries (
    id uuid primary key default uuid_generate_v4(),
    username text not null references public.profiles(username) on delete cascade,
    metric text not null check (metric in ('sleep','calories','steps')),
    value numeric not null,
    date date not null,
    created_at timestamptz default now(),
    unique (username, metric, date)
  );

  alter table public.profiles enable row level security;
  alter table public.weight_entries enable row level security;
  alter table public.wellness_entries enable row level security;

  -- Policies (per-user access)
  create policy \"Profiles manageable by owner\" on public.profiles
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy \"Weights manageable by owner\" on public.weight_entries
    for all using (exists (select 1 from public.profiles p where p.username = weight_entries.username and p.user_id = auth.uid()))
    with check (exists (select 1 from public.profiles p where p.username = weight_entries.username and p.user_id = auth.uid()));
  create policy \"Wellness manageable by owner\" on public.wellness_entries
    for all using (exists (select 1 from public.profiles p where p.username = wellness_entries.username and p.user_id = auth.uid()))
    with check (exists (select 1 from public.profiles p where p.username = wellness_entries.username and p.user_id = auth.uid()));
  ```
- Regenerate typed client once schema exists:
  ```
  supabase gen types typescript --project-id <id> > lib/supabase/types.ts
  ```
- API routes live under `app/api/*` and use domain use-cases + Supabase repositories. Client hooks call those endpoints so the UI stays in sync.
