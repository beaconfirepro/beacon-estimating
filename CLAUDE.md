# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in this repository.

## Project overview

**Beacon Estimator Pro** is a fire-protection estimating web app for fire
sprinkler and standpipe systems. Estimators create projects, enter take-off
quantities (heads, pipe, fittings, valves, hangers, etc.), and the app computes
labor hours and material costs from configurable factors and a material price
list. Results roll up into a per-project summary that can be exported to PDF.

It is a [Base44](https://base44.com) app: the code lives here and in the Base44
Builder simultaneously. Any change pushed to this repo is reflected in the
Builder, and changes in the Builder are synced back here. Treat Base44 as the
backend — entities (data models), auth, and file storage are all served by the
Base44 platform via the `@base44/sdk`.

## Tech stack

- **Build/dev:** Vite 6 (`@base44/vite-plugin` + `@vitejs/plugin-react`)
- **UI:** React 18, React Router 6 (`BrowserRouter`), Tailwind CSS 3
- **Components:** shadcn/ui (Radix primitives) under `src/components/ui/`
- **Data fetching:** TanStack Query (`@tanstack/react-query`)
- **Forms:** react-hook-form + zod
- **Toasts:** `sonner` (primary) and the shadcn `Toaster`
- **PDF/canvas:** jspdf + html2canvas (see `src/lib/pdfExport.js`)
- **Backend SDK:** `@base44/sdk` (entities, auth, integrations)
- **Language:** JavaScript/JSX (TypeScript available; `checkJs` is on via `jsconfig.json`)

## Commands

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server
npm run build      # production build to ./dist
npm run preview    # preview the production build
npm run lint       # eslint . --quiet
npm run lint:fix   # eslint --fix
npm run typecheck  # tsc -p ./jsconfig.json (checkJs)
```

There is **no test suite** in this repo. Verify changes with `npm run lint`,
`npm run typecheck`, and a manual run via `npm run dev`.

### Environment variables

Create `.env.local` (gitignored) with:

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
```

These can also be supplied as URL params (`app_id`, `app_base_url`,
`access_token`, …); see `src/lib/app-params.js`, which reads URL params first,
then localStorage, then the `VITE_*` env defaults.

## Architecture

### Entry & routing
- `src/main.jsx` → renders `src/App.jsx`.
- `src/App.jsx` wires up providers in this order: `AuthProvider` →
  `QueryClientProvider` → `Router`. Routes are declared inline:
  - **Public auth routes:** `/login` (`pages/Login.jsx`), `/register`
    (`pages/Register.jsx`), `/forgot-password` (`pages/ForgotPassword.jsx`),
    `/reset-password` (`pages/ResetPassword.jsx`).
  - **Protected routes** (wrapped in `ProtectedRoute`, which redirects
    unauthenticated users to `/login`):
    - `/` — redirects to `/dashboard`
    - `/dashboard` — `pages/Dashboard.jsx` (project list)
    - `/project/:id` — `pages/ProjectDetail.jsx` (`:id` may be `"new"`)
    - `/price-list` — `pages/PriceList.jsx` (material prices + assemblies admin)
  - `*` — `lib/PageNotFound.jsx`.
- `src/pages.config.js` is **auto-generated** by Base44 — do not hand-edit it
  except the `mainPage` value. App routing is driven by `App.jsx`, not this file.

### Backend access (Base44)
- `src/api/base44Client.js` creates the shared `base44` client. Import it as
  `import { base44 } from "@/api/base44Client"`.
- **Entities** (Base44 data models). Schemas are checked into the repo as
  `base44/entities/*.jsonc` (kept in sync with the Base44 platform) — read these
  for the authoritative field list before touching entity code:
  - `Project` — project metadata. Fields: `project_name` (required),
    `street_address`, `city_state_zip`, `sales_rep`, `wsfp_project_number`,
    `gc_owner`, `date`, `notes`, `status` (`draft` | `in_progress` | `complete`
    | `submitted`), `head_layout_pdf_url`.
  - `SprinklerTakeoff` — a fire-sprinkler take-off section. Fields: `project_id`
    (required), `area_name`, `section_number`, `formula_inputs` (the high-level
    inputs fed to the formula engine), `labor_items[]`, `material_items[]`,
    `total_labor`, `total_material`, `total_design`, `notes`.
  - `StandpipeTakeoff` — a standpipe/bulk take-off section. Like
    `SprinklerTakeoff` plus a `type` (`horizontal_bulk` | `vertical`); has no
    `formula_inputs`.
  - `MaterialPrice` — price-list entries: `generic_part_name` (required),
    `supplier_*` fields, `price`, `list_price`, `category` (`pipe` | `fittings`
    | `hangers` | `sprinkler_heads` | `valves` | `misc`), `last_updated`.
  - `Assembly` — saved assemblies. `name` (required), `category`,
    `quick_pick_category` (when set, surfaces the assembly in the takeoff Quick
    Pick), `quick_pick_unit`, `default_basis`, `components[]`, `labor_hours`.
  - `User` — Base44 platform user with an app `role` (`admin` | `user`).
  - CRUD patterns: `base44.entities.X.list(sort, limit)`,
    `.filter({ field }, sort, limit)`, `.create(data)`, `.update(id, data)`,
    `.delete(id)`.
- **Integrations:** file uploads via
  `base44.integrations.Core.UploadFile({ file })` (see `HeadLayoutUpload.jsx`).
- **Auth:** `src/lib/AuthContext.jsx` provides `useAuth()` and handles public
  settings, `auth.me()`, and the `user_not_registered` / `auth_required` states.
  Login is email/password (`base44.auth.loginViaEmailPassword`) or a provider
  (`base44.auth.loginWithProvider("google", …)`) — see `pages/Login.jsx` /
  `pages/Register.jsx`. `components/ProtectedRoute.jsx` gates the app routes via
  an `<Outlet>`, showing a loading fallback, `UserNotRegisteredError`, or the
  unauthenticated redirect as appropriate. Shared auth-page chrome lives in
  `components/AuthLayout.jsx` (`GoogleIcon.jsx` is the provider button icon).

### Domain / business logic (the important part)
- `src/lib/sprinklerFormulas.js` — **the estimating engine.**
  `calculateSprinklerTakeoff(inputs, materialPriceMap)` takes take-off
  quantities plus criteria selectors (labor class, hoisting, project size,
  system type wet/dry/preaction, seismic) and returns `{ labor_items,
  material_items, total_labor, total_material, total_design }`. Labor factors
  are adjusted by composite criteria multipliers defined at the top of the file.
  `DEFAULT_SPRINKLER_INPUTS` defines the full input shape (all zeros).
- `src/lib/quickPickAssemblies.js` — predefined "quick pick" assemblies
  (heads, risers, mains, branchlines, valves/trim). Each assembly's components
  reference the same field names as `sprinklerFormulas.js` inputs.
- `src/lib/defaultItems.js` — default labor factor and material price rows
  mirroring the source "SPK" spreadsheet.
- `src/lib/pdfExport.js` — `generatePDF(project, sprinklerTakeoffs,
  standpipeTakeoffs)`.
- `src/utils/index.ts` — `createPageUrl(pageName)` helper.

When changing estimating behavior, keep these three in sync: the input field
names in `sprinklerFormulas.js`, the item/price names used as `materialPriceMap`
keys, and the quick-pick component `field`s in `quickPickAssemblies.js`.

### Components
- `src/components/ui/` — shadcn/ui primitives. Generally don't edit by hand;
  these are generated. `components.json` holds the shadcn config.
- `src/components/project/` — project-level UI: `ProjectInfoForm`,
  `HeadLayout`, `HeadLayoutUpload`, `MasterSummary`.
- `src/components/takeoff/` — take-off UI: `TakeoffCard`,
  `SprinklerTakeoffSection`, `SprinklerInputForm`, `SprinklerCriteriaSelectors`,
  `QuickPickPanel`, `MaterialItemRow`, `StandpipeSection`.

## Conventions

- **Imports:** use the `@/` alias for `src/` (e.g. `@/components/ui/button`).
  Configured in both `vite.config.js` and `jsconfig.json`.
- **Styling:** Tailwind utility classes with CSS variables / semantic tokens
  (`bg-background`, `text-muted-foreground`, `text-accent`, …) defined in
  `src/index.css` and `tailwind.config.js`. Prefer these tokens over raw colors.
- **Class merging:** use `cn()` from `src/lib/utils.js` (clsx + tailwind-merge).
- **Toasts:** prefer `import { toast } from "sonner"`.
- **Money:** format with `toLocaleString("en-US", { minimumFractionDigits: 2 })`.
- **Data models:** don't invent new entity fields casually — entity schemas are
  mirrored in `base44/entities/*.jsonc` and must stay consistent with the Builder.

## Working with Base44

- This repo is **bidirectionally synced** with the Base44 Builder. Files may
  appear/change as a sync completes. Avoid reformatting auto-generated files
  (`src/pages.config.js`, `src/components/ui/*`) unnecessarily.
- Entity schema changes (new fields/entities) generally belong in the Base44
  platform, not invented purely in front-end code. The synced schemas live in
  `base44/entities/*.jsonc` — treat them as generated/synced (don't hand-author
  fields that don't exist on the platform).
- `base44/.app.jsonc` holds the app id; `base44/config.jsonc` holds
  install/build/serve commands used by the platform.

## Gotchas

- `src/pages.config.js` ships with an empty `Pages: {}` — actual routing is in
  `App.jsx`. Don't rely on `pages.config.js` to find routes.
- `base44Client.js` is created with `requiresAuth: false`; auth gating happens
  in `AuthContext`/`App.jsx`, not at the client level.
- No tests exist, so lint + typecheck + a manual dev run are the safety net.
