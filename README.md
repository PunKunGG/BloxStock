# BloxStock

A responsive Blox Fruits stock tracker using Next.js App Router, TypeScript, Tailwind CSS, and Lucide. Phase 2A adds a **server-only Supabase database reader** while preserving the UI and deterministic mock provider. No real stock source or synchronization is implemented.

## Run locally

Use Node.js 22+ (verified with Node.js 24). Run `npm install`, copy `.env.example` to `.env.local`, then run `npm run dev`. Open http://127.0.0.1:3000. For production, use `npm run build` and `npm start`. Restart after changing environment variables.

| Variable              | Purpose                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `DATA_PROVIDER`       | `mock` (default when omitted) or `supabase`. Other values fail clearly.                               |
| `SUPABASE_URL`        | Project API origin; required in Supabase mode.                                                        |
| `SUPABASE_SECRET_KEY` | Modern `sb_secret_...` server secret from the project's API Keys settings; required in Supabase mode. |

Mock mode requires no credentials; its catalog, prices, and rotations are demonstration data. In Supabase mode, missing/malformed configuration fails at startup/build. Rejected credentials and query/schema errors surface as server errors. **There is no silent mock fallback.** Format validation cannot authenticate a key; the database request does that.

Keep `.env.local` out of Git. Set the same unprefixed variables in the hosting platform's server environment. Never use `NEXT_PUBLIC_` for the secret, put it in `next.config`'s `env` object, send it as a component prop, or paste it into logs. This implementation accepts modern secret keys, not publishable/anon keys or legacy JWT service-role keys. No database password belongs in the application.

## Data architecture

```text
React UI (existing domain types)
  -> getFruits / getFruit / getCurrentStock / getDealerStocks / getStockHistory
  -> lib/providers/data-provider.ts
       mock     -> lib/mock-provider.ts + data/*
       supabase -> lib/supabase/repository.ts -> server.ts -> PostgreSQL
                    -> mappers.ts -> domain models
```

- `types/fruit.ts` and `types/stock.ts` remain the public application models. `types/database.ts` is generated from the hosted schema; database rows stay inside the data layer.
- `lib/supabase/server.ts` imports `server-only`, disables auth session persistence/refresh, and uses uncached fetches with a timeout. Client Components never import it.
- Routes render dynamically. React request-scoped caching deduplicates catalog/detail reads without persisting stock across requests.
- Catalog queries return active fruits; individual URLs also resolve inactive records so historical links remain useful.
- Current stock joins items and fruits, ordered by stored rotation start, fetch time, and ID. Future rotations are excluded. Raw payloads and sync errors never enter UI props.
- History loads completed rotations newest first with joined metadata and database pagination. Dealer, fruit, and Bangkok date filters compose without N+1 lookups. Fruit filtering retains every fruit in each matching rotation.

The History UI still shows the last seven days and filters immediately on the client. The server API also accepts an explicit `YYYY-MM-DD` date for older records. Dates consistently use **Asia/Bangkok (ICT / UTC+7)**.

## Freshness and empty databases

Expiry uses stored absolute `rotation_start` / `rotation_end`, never page-load time. They map to `observedAt` / `expiresAt`; `fetched_at` maps to `updatedAt`. Mock Normal rotations remain four hours and Mirage two hours. The future synchronizer must persist actual source boundaries. SQL validates end > start without hardcoding a provider schedule.

A known-good unexpired rotation preserves `live` or source-reported `stale`. An expired rotation becomes `stale` and retains its fruit list. A newer `unavailable` record falls back to the latest known-good rotation as `stale`. Without known-good data, stock is `unavailable` with no fabricated fruits.

An empty database is valid: both dealers are unavailable, the countdown shows dashes, catalog/history show empty states, and unknown fruit URLs use the existing friendly 404. The unavailable model uses epoch timestamps only as internal absence markers; they are never shown as observations/countdown targets. Demo labels become stored-data labels. Layout and styling are unchanged.

## Supabase project and schema

Target: **BloxStock**, ref `zmlkjhlpxrkuwcukfezo`, region **ap-southeast-1 (Singapore)**. API origin: `https://zmlkjhlpxrkuwcukfezo.supabase.co`. Enable the Data API with `public` exposed to the server client. Obtain a secret through the project's API Keys settings and save it only in the server environment.

Version-controlled migrations are the schema source of truth:

1. `supabase/migrations/20260926111521_phase_2a_database_foundation.sql`: four tables, checks, foreign keys, indexes, update trigger, RLS, and explicit privileges.
2. `supabase/migrations/20260926112025_restrict_platform_rls_helper.sql`: removes public execution of the platform's pre-existing `rls_auto_enable()` helper if present. It preserves the platform event trigger and creates no SECURITY DEFINER function.

Both exact files have been applied through Supabase MCP to the named project. Filenames match remote migration versions. All four tables were verified empty. **No prototype catalog, prices, stock, or history was imported.**

| Table             | Structure                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fruits`          | Unique slug; five rarities; Natural/Elemental/Beast types; nonnegative prices; active flag; timestamps. Money stays within JavaScript's safe integer range. Required display metadata cannot be null; Robux price may be null. |
| `stock_rotations` | Unique `(dealer, slot_key)`; validated dealer/status; absolute time window; source metadata; optional hash/raw payload. Indexes cover dealer/latest order, history order, expiry, and fetch time.                              |
| `stock_items`     | Composite primary key `(rotation_id, fruit_id)`; ordered positions; cascading rotation deletion; restricted fruit deletion; fruit-reference index.                                                                             |
| `sync_runs`       | Private operational metadata with completion/duration validation and an attempted-time index. No application code currently writes or exposes it.                                                                              |

### Migration workflow

Authenticate the CLI with your own account. Commands target the project explicitly without embedding a database password:

```sh
npx supabase login
npx supabase migration list --project-ref zmlkjhlpxrkuwcukfezo
npx supabase db push --project-ref zmlkjhlpxrkuwcukfezo --dry-run --skip-vault
npx supabase db push --project-ref zmlkjhlpxrkuwcukfezo --skip-vault
```

The existing project should have no pending migrations. Review the dry run first. If your CLI/account requires database authentication, complete it locally through the CLI's secure prompt; do not share the password or commit it. Do not use `--include-seed` or reset the hosted database.

For new changes, run `npx supabase migration new descriptive_name`, edit/review the SQL, and apply that exact file using the CLI or MCP. Never make untracked Dashboard DDL changes. If MCP assigns a different timestamp, align the local filename with its remote version before later CLI pushes. Never edit already-applied SQL; add another migration.

Regenerate database types after schema changes (PowerShell):

```powershell
npx supabase gen types typescript --project-id zmlkjhlpxrkuwcukfezo --schema public | Set-Content -Encoding utf8 types/database.ts
```

Run `supabase/verify.sql` in the SQL editor or connected SQL tool after migrations. It is read-only and reports tables/RLS, constraints, indexes, role privileges, policies, function privileges, and row counts.

### Security model

All application tables have RLS enabled and **no anonymous/authenticated policies**. Explicit table privileges are revoked from `PUBLIC`, `anon`, and `authenticated`, including SELECT and writes. `sync_runs` is not publicly readable. There is no browser database client.

The secret key operates as `service_role`, which bypasses RLS but still requires table privileges. This phase grants it **SELECT only** on the four tables. Future trusted synchronization writes require a reviewed grant migration. Never disable RLS to fix permissions. The updated-at trigger is SECURITY INVOKER with a fixed empty search path and restricted execution.

Future tables still require explicit RLS and privilege review. Postgres-owned table/sequence default public grants are revoked. New functions should always revoke public execution explicitly because global function defaults and schema-specific defaults differ.

The hosted audit confirmed no public SELECT/INSERT/UPDATE/DELETE access, no broad policies, and no security warnings/errors. Supabase reports four informational [RLS enabled with no policy notices](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), intentional for these private tables. References: [securing the Data API](https://supabase.com/docs/guides/api/securing-your-api), [API keys](https://supabase.com/docs/guides/api/api-keys).

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Tests retain the original mock checks and cover provider selection, configuration, row mapping, empty tables, stale/unavailable states, inactive fruit details, history joins/filters/pagination, and safe errors. The real Supabase query builder uses an injected in-memory fetch transport; tests never contact the hosted project. The `react-server` test condition resolves the `server-only` marker as a server environment.

Verified on 26 September 2026: dependency installation, TypeScript, ESLint, all 26 tests, and the production build passed. Browser checks covered mock dealer switching/countdown, search with rarity filters, details/history links, and empty Supabase-mode pages on desktop/mobile. No secret-key or Supabase server SDK references were found in the generated browser assets. The hosted schema, migration hashes, constraints, indexes, RLS, role privileges, and zero row counts were checked through MCP.

Live connection verification was subsequently completed using the user's untracked `.env`: the existing server data-access functions successfully read the hosted project, returning zero catalog/history records, unavailable stock for both dealers, and an undefined result for a missing fruit. The actual Supabase-backed dashboard, dealer switch, directory, and history pages rendered their empty states without application errors. These checks were read-only and did not insert data or expose credentials.

For a reproducible **offline empty-database UI check**:

```sh
node tests/serve-empty-database.mjs
```

Open http://127.0.0.1:3001. This runs Supabase mode with a test-only `.invalid` hostname intercepted by a Node preload, a clearly fake fixture key, and a separate ignored build directory. It does not change normal app behavior, contact Supabase, or insert data. Stop with Ctrl+C. A real hosted Next.js connection still requires your local/hosting secret key; the offline fixture is not evidence of that connection.

## Routes and Phase 2B

- `/`: current stock, Normal/Mirage switching, countdown, rarity highlights, freshness.
- `/fruits`: combined name search and rarity filters.
- `/fruits/[slug]`: prices, availability, last seen, recent appearances, friendly 404.
- `/history`: dealer/fruit/date filters and progressively displayed rotations. `?fruit=<fruit-id>&dealer=mirage` preselects filters; mock IDs are slugs.

Phase 2B can add a verified real provider, Edge Function, scheduled synchronization, and history ingestion. It must first import a verified catalog and define trusted write privileges. **None are implemented here.** Scraping, FruityBlox/Parse.bot, Cron, Auth, accounts, watchlists, alerts, notifications, Discord, web push, PWA, and trading values remain out of scope.

## Artwork and font credits

Prototype artwork comes from [Blox Fruits Wiki](https://bloxfruitswiki.org/); exact source URLs are in `public/fruits/sources.json`. Game assets belong to their owners. Mock values include requested legacy names and are not a production catalog.

[Inter](https://rsms.me/inter/) by Rasmus Andersson is self-hosted under the SIL Open Font License (`public/fonts/OFL.txt`). BloxStock is an independent fan project, not affiliated with Roblox or Gamer Robot.
