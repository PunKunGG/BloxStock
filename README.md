# BloxStock

A responsive Blox Fruits stock tracker built with Next.js App Router, TypeScript, Tailwind CSS 4, and Lucide. This prototype uses **sample stock, sample history, and placeholder prices**. It makes no external stock API requests and has no authentication or database dependency.

## Run locally

Requires Node.js 20.9+ (developed with Node.js 24).

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. For a production build, run `npm run build` then `npm start`.

```sh
npm run typecheck
npm run lint
npm test
```

## Routes

- `/` — current stock, immediate Normal/Mirage switching, automatic countdown, rarity highlights, freshness indicator.
- `/fruits` — catalog with combined name search and rarity filtering.
- `/fruits/[slug]` — prices, availability at both dealers, last seen, recent appearances, and a friendly 404 for unknown fruit slugs.
- `/history` — rolling sample history with dealer, fruit, and date filters; progressively load older rotations. `?fruit=portal&dealer=mirage` preselects filters.

## Data architecture

```text
data/                  Mock catalog and ID-based rotation patterns
types/                 Shared Fruit, Dealer, StockRotation, and view types
lib/mock-provider.ts   Deterministic sample rotation generator and reference resolver
lib/fruits/            Server-only catalog access and pure search/filter utilities
lib/stock/             Server-only stock access and dealer metadata
lib/history/           Server-only history access and pure filter utilities
components/            Layout, stock, fruit, history, and shared UI components
app/                   Server-rendered routes and shared loading/error/404 boundaries
tests/                 Rotation boundary, integrity, timezone, and filtering checks
```

React components receive typed view models from the server; they do not import mock arrays. Replace `getFruits`, `getCurrentStock`, and `getStockHistory` with server-side API/database adapters to use real data. Keep API secrets on the server. Runtime validation and source freshness decisions belong in those adapters. No specific future provider is assumed.

Rotations store fruit IDs rather than duplicate fruit details. The resolver joins them to the catalog at the data boundary. Both dealer feeds are loaded together for immediate switching. Client components are limited to navigation state, filters, and ticking stock views. Fonts and artwork are served locally.

## Mock timing and freshness

Normal sample rotations last four hours; Mirage sample rotations last two. Three deterministic patterns cycle per dealer, using the same calculation for current stock and history. The clock uses absolute ISO timestamps, so it does not reset on reload. On expiry, the server view refreshes; an expired view is marked stale while waiting. Sample `updatedAt` timestamps simulate a recent observation, not a real upstream check.

All visible history dates and times use **Asia/Bangkok (ICT / UTC+7)** consistently, including date filtering. The `StockStatus` component supports `live`, `stale`, and `unavailable`. The seven-day history contains completed rotations; the detail page adds the current appearances explicitly.

Watchlists are displayed as unavailable. Supabase, authentication, notifications, PWA, scheduled syncing, and external stock feeds are deliberately outside this first version.

## Artwork and font credits

Fruit artwork is used as prototype imagery from [Blox Fruits Wiki](https://bloxfruitswiki.org/). Exact source and image URLs are recorded in `public/fruits/sources.json`. Blox Fruits game assets belong to their respective owners; these are not original BloxStock illustrations. Catalog values are intentionally mock values, and include the requested legacy fruit names.

[Inter](https://rsms.me/inter/) by Rasmus Andersson is self-hosted under the SIL Open Font License (see `public/fonts/OFL.txt`).

This is an independent fan project, not affiliated with Roblox or Gamer Robot.
