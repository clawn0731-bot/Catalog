# AX Catalog Management System

KT AX 카탈로그 관리 시스템 — Internal tool for managing and searching AX offerings across products, technologies, and services.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + React 18
- **UI:** Tailwind CSS + shadcn/ui
- **State:** React Query (TanStack Query) + Zustand (prepared)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table
- **Database:** Prisma + PostgreSQL
- **Auth:** Mock internal auth (SSO-ready structure)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or Docker)
- npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database named `ax_catalog`, then update `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ax_catalog?schema=public"
```

### 3. Push Schema & Generate Client

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Data

```bash
npm run db:seed
```

### 5. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Quick Reset

```bash
npm run db:reset
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── input/              # Input Workspace (create/edit catalog items)
│   ├── data/               # Data Integration Workspace (table/filters)
│   ├── visualization/      # Visualization Workspace (dashboard/charts)
│   ├── user/               # User Workspace (search/recommendations)
│   └── api/                # API routes
│       ├── catalog/        # CRUD for catalog items
│       ├── search/         # Scored search endpoint
│       ├── stats/          # Dashboard statistics
│       ├── filters/        # Filter options
│       └── favorites/      # Bookmark toggle
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── layout/             # App shell, sidebar, header
│   ├── catalog/            # Catalog-specific components
│   ├── charts/             # Chart/dashboard components
│   └── search/             # Search/recommendation components
├── lib/                    # Utilities, DB, auth, scoring
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript type definitions

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed data
```

## Workspaces

| Workspace | Route | Purpose |
|-----------|-------|---------|
| 카탈로그 입력 | `/input` | Create and edit catalog items |
| 데이터 통합 | `/data` | Unified table view with advanced filtering |
| 시각화 | `/visualization` | Management dashboard with charts |
| 검색 · 추천 | `/user` | Sales search and recommendation tool |

## Data Model

- **CatalogItem** — Core entity (Product/Technology/Service)
- **UseCase** — Customer references per item
- **TechStackEntry** — 3-depth tech hierarchy (Domain → Category → Asset)
- **Industry** — Reference data
- **Organization** — Owning teams
- **User** — Auth users (Admin/Editor/Viewer)
- **Favorite** — Bookmarks
- **SavedFilter** — Saved search configurations

## Future Enhancements

- SSO integration (SAML/OIDC)
- File attachments
- Approval workflow
- Mobile app (shared API backend)
- Bulk import/export
- Advanced recommendation engine
