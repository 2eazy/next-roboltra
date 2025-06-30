# Next.js Roboltra

A gamified task management system built with Next.js, NextAuth, and PostgreSQL.

## Tech Stack

- **Framework:** Next.js 15.3.4 (App Router)
- **Authentication:** NextAuth v5 (beta)
- **Database:** PostgreSQL with Drizzle ORM
- **Styling:** Tailwind CSS v3
- **Package Manager:** pnpm (monorepo)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker (for PostgreSQL)

### Setup

1. **Clone and install dependencies:**
```bash
pnpm install
```

2. **Start the database:**
```bash
docker compose up -d
```

3. **Run the development server:**
```bash
pnpm dev
```

4. **Access the app:**
- Homepage: http://localhost:3000
- Sign in: http://localhost:3000/auth/signin
- Dashboard: http://localhost:3000/dashboard

### Test Credentials

- Email: `test@example.com`
- Password: `password123`

## Project Structure

```
next-roboltra/
├── apps/
│   └── web/                 # Next.js application
├── packages/
│   ├── db/                  # Database schema and utilities
│   └── auth/                # Authentication helpers
└── pnpm-workspace.yaml      # Monorepo configuration
```

## Development

### Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm typecheck    # Run TypeScript checks
```

### Database

```bash
pnpm db:push      # Push schema changes
pnpm db:seed      # Seed test data
pnpm db:studio    # Open Drizzle Studio
```

## Features

- User authentication with NextAuth
- Protected routes
- PostgreSQL database with Drizzle ORM
- Tailwind CSS for styling
- TypeScript for type safety
- Monorepo structure for scalability