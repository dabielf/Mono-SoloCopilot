# SoloCopilot: Turborepo Monorepo with Next.js + Cloudflare Workers

## Stack overview and compatibility matrix

This guide covers the setup of the SoloCopilot monorepo (2025) with the following stack:
- **Frontend**: Next.js 15.3+ with App Router on Vercel
- **Backend**: Cloudflare Workers with Hono API framework
- **Authentication**: Clerk (shared between platforms)
- **Type-safe API**: Hono RPC for type-safe client-server communication
- **HTTP Client**: Ky for external APIs and flexibility
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Database**: Cloudflare D1 with Drizzle ORM (managed within API)
- **Package Manager**: pnpm 10.11+
- **AI Integration**: Google Gemini, OpenAI APIs for AI-powered features

**Compatibility Status**:
- ✅ Turborepo 2.0 + Next.js 15.3 + React 19
- ✅ Tailwind CSS v4 + shadcn/ui
- ✅ Hono + Hono RPC + Cloudflare Workers
- ✅ Clerk authentication cross-platform JWT sharing
- ✅ D1 + Drizzle ORM for type-safe database
- ✅ AI SDKs integration for ghostwriting features

## Current monorepo structure

```bash
mono-solo-copilot/
├── apps/
│   ├── solocopilot/          # Next.js frontend
│   ├── api/                  # Main Hono API (frandab-api)
│   └── workers/              # Specialized Cloudflare Workers (planned)
│       └── (future workers based on needs)
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── eslint-config/        # ESLint configuration
│   └── typescript-config/    # TypeScript configuration
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## Initial monorepo setup

### 1. Project structure overview

The monorepo is already set up with:
- **mono-solo-copilot**: Root package name
- **solocopilot**: Next.js app for the frontend
- **frandab-api**: Cloudflare Worker API with Hono
- **packages/ui**: Shared UI components

### 2. Root configuration files

**package.json**:
```json
{
  "name": "mono-solo-copilot",
  "private": true,
  "packageManager": "pnpm@10.11.1",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "deploy": "turbo run deploy",
    "check-types": "turbo run check-types",
    "clean": "turbo run clean",
    "deploy:api": "cd apps/api && wrangler deploy --env production",
    "deploy:workers": "echo 'No specialized workers yet'",
    "deploy:all-workers": "pnpm deploy:api"
  },
  "devDependencies": {
    "prettier": "^3.5.3",
    "turbo": "^2.5.4",
    "typescript": "5.8.2"
  },
  "engines": {
    "node": ">=18"
  }
}
```

**turbo.json**:
```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "globalDependencies": [".env*"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["GW_API_URL", "GW_USER_ID", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "deploy:workers": {
      "dependsOn": ["build"],
      "cache": false
    }
  }
}
```

**pnpm-workspace.yaml**:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## Next.js frontend (solocopilot) with Tailwind CSS v4

### 1. Current setup

The Next.js app is already configured with:
- App Router
- Tailwind CSS v4
- Clerk authentication
- Ky for HTTP requests
- shadcn/ui components

**apps/solocopilot/package.json** key dependencies:
```json
{
  "name": "solocopilot",
  "dependencies": {
    "@clerk/nextjs": "^6.21.0",
    "ky": "^1.8.1",
    "next": "15.3.3",
    "react": "^19.0.0",
    "tailwindcss": "^4"
  }
}
```

### 2. Tailwind CSS v4 configuration

Tailwind v4 is already set up with CSS-first configuration in `app/globals.css`.

### 3. Setting up Ky for API calls

**app/lib/ky.ts** (to be created):
```typescript
import ky from 'ky'
import { auth } from '@clerk/nextjs/server'

// Client-side ky instance for external APIs
export const kyClient = ky.create({
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
})

// Server-side ky instance with auth headers
export const kyServer = ky.create({
  timeout: 30000,
  hooks: {
    beforeRequest: [
      async (request) => {
        const { getToken } = await auth()
        const token = await getToken()
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
  },
})
```

## Cloudflare Workers backend (frandab-api) with Hono

### 1. Current API setup

The API is located at `apps/api` with:
- Hono framework
- Cloudflare D1 database
- Drizzle ORM
- AI integrations (Google Gemini, OpenAI)
- Ghostwriter features

**apps/api/wrangler.jsonc**:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "frandab-api",
  "main": "src/index.ts",
  "compatibility_date": "2025-02-04",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "frandab-api",
      "database_id": "f5dfe3e6-cc9b-402e-a0f3-bf99d7451616",
      "migrations_dir": "src/lib/server/db/migrations"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "65df389aa2b84452b8db0f1fac26b75f"
    }
  ]
}
```

### 2. Database configuration

The database is currently managed within the API app using Drizzle ORM:

**apps/api/drizzle.config.ts**:
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/lib/server/db/schema.ts", "./src/lib/server/db/schema-ghostwriter.ts"],
  out: "./src/lib/server/db/migrations",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    databaseId: process.env.CLOUDFLARE_DATABASE_ID || "",
    token: process.env.CLOUDFLARE_D1_TOKEN || "",
  },
  verbose: true,
  strict: true,
  dialect: "sqlite",
});
```

### 3. Current API structure

The API includes:
- User management routes
- Ghostwriter agents (persona extraction, psychological profiling, etc.)
- Email handling with React Email
- Webhook endpoints
- Contact management

## Implementing Hono RPC for type safety

### 1. Setting up Hono RPC in the API

**apps/api/src/index.ts** (enhanced with RPC):
```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { hc } from 'hono/client'
import { verifyToken } from '@clerk/backend'
import { createDb } from './lib/server/db'

// Import your route handlers
import { userRoutes } from './routes/users'
import { ghostwriterRoutes } from './routes/ghostwriter'
import { contactRoutes } from './routes/contacts'

type Env = {
  DB: D1Database
  KV: KVNamespace
  CLERK_SECRET_KEY: string
  // Add other environment variables
}

const app = new Hono<{ Bindings: Env }>()

// CORS configuration
app.use('*', cors({
  origin: [
    'https://your-production-domain.vercel.app',
    'http://localhost:3000',
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// Auth middleware
app.use('*', async (c, next) => {
  const authHeader = c.req.header('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (token) {
    try {
      const payload = await verifyToken(token, {
        secretKey: c.env.CLERK_SECRET_KEY,
      })
      c.set('user', payload)
    } catch (error) {
      // Token verification failed, continue without user
    }
  }
  
  await next()
})

// Mount routes
const routes = app
  .route('/users', userRoutes)
  .route('/ghostwriter', ghostwriterRoutes)
  .route('/contacts', contactRoutes)

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'frandab-api' }))

// Export type for RPC client
export type AppType = typeof routes

export default app
```

### 2. Creating type-safe route handlers

**apps/api/src/routes/users/index.ts**:
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users } from '../../lib/server/db/schema'

const userRoutes = new Hono<{ Bindings: Env }>()
  .get('/me', async (c) => {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const db = createDb(c.env.DB)
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, user.sub))
      .get()
    
    return c.json(dbUser)
  })
  .post(
    '/update',
    zValidator('json', z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
    })),
    async (c) => {
      const user = c.get('user')
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401)
      }
      
      const data = c.req.valid('json')
      const db = createDb(c.env.DB)
      
      // Update user logic
      const updated = await db
        .update(users)
        .set(data)
        .where(eq(users.clerkId, user.sub))
        .returning()
        .get()
      
      return c.json(updated)
    }
  )

export { userRoutes }
```

### 3. Creating the RPC client in Next.js

**apps/solocopilot/src/lib/api-client.ts**:
```typescript
import { hc } from 'hono/client'
import type { AppType } from '../../../api/src/index'
import { auth } from '@clerk/nextjs/server'

// Create the RPC client
export const api = hc<AppType>(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787')

// Helper function to get authenticated client
export async function getAuthenticatedClient() {
  const { getToken } = await auth()
  const token = await getToken()
  
  return hc<AppType>(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })
}
```

### 4. Using RPC in server components

**apps/solocopilot/src/app/dashboard/page.tsx**:
```typescript
import { getAuthenticatedClient } from '@/lib/api-client'

export default async function Dashboard() {
  const client = await getAuthenticatedClient()
  
  // Type-safe API calls
  const userResponse = await client.users.me.$get()
  const user = await userResponse.json()
  
  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
    </div>
  )
}
```

### 5. Using RPC in client components with hooks

**apps/solocopilot/src/hooks/use-api.ts**:
```typescript
'use client'

import { useAuth } from '@clerk/nextjs'
import { hc } from 'hono/client'
import type { AppType } from '../../../api/src/index'
import { useState, useEffect, useCallback } from 'react'

export function useApi() {
  const { getToken } = useAuth()
  
  const getClient = useCallback(async () => {
    const token = await getToken()
    return hc<AppType>(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787', {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
  }, [getToken])
  
  return { getClient }
}

// Example hook for user data
export function useUser() {
  const { getClient } = useApi()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchUser() {
      try {
        const client = await getClient()
        const response = await client.users.me.$get()
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()
  }, [getClient])
  
  return { user, loading }
}
```

## Future: Specialized Workers

When you're ready to add specialized workers, they will be added to `apps/workers/` directory. Each worker can have its own purpose and can be bound to the main API through service bindings.

### Example worker structure (future):
```bash
apps/workers/
├── document-processor/    # PDF/document processing
├── ai-pipeline/          # AI processing pipeline
├── notification-sender/  # Email/notification handling
└── analytics-collector/  # Analytics and tracking
```

### Service bindings configuration (future):

In `apps/api/wrangler.jsonc`, add service bindings:
```jsonc
{
  "services": [
    { "binding": "DOCUMENT_PROCESSOR", "service": "document-processor" },
    { "binding": "AI_PIPELINE", "service": "ai-pipeline" }
  ]
}
```

## Database management strategy

The database remains within the API app for now, which is appropriate for the current architecture. The database schemas are located at:
- `apps/api/src/lib/server/db/schema.ts` - Main schema
- `apps/api/src/lib/server/db/schema-ghostwriter.ts` - Ghostwriter-specific schema

### When to extract database to a package:
- When multiple workers need direct database access
- When you need to share types/schemas across multiple services
- When you want to run migrations from a centralized location

For now, keeping it within the API provides:
- Simpler deployment
- Direct access without service binding overhead
- Easier development workflow

## Deployment configuration

### 1. Vercel deployment (Next.js)

Configure in Vercel dashboard:
- Framework Preset: Next.js
- Root Directory: `apps/solocopilot`
- Build Command: `cd ../.. && pnpm turbo run build --filter=solocopilot`
- Install Command: `cd ../.. && pnpm install --frozen-lockfile`

Environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_API_URL` (your Cloudflare Worker URL)
- `GW_API_URL` (same as API URL)
- `GW_USER_ID` (your user ID)

### 2. Cloudflare deployment (API)

```bash
# Deploy API
cd apps/api
npx wrangler deploy --env production

# Set secrets
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put GOOGLE_GENERATIVE_AI_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put RESEND_API_KEY
# Add other secrets as needed
```

## Development workflow

```bash
# Start all services
pnpm dev

# Start specific services
pnpm dev --filter=solocopilot
pnpm dev --filter=frandab-api

# Type checking
pnpm check-types

# Build everything
pnpm build

# Deploy API
pnpm deploy:api

# Database operations (from apps/api)
cd apps/api
pnpm db:generate         # Generate migrations
pnpm db:migrate:local    # Apply migrations locally
pnpm db:migrate          # Apply migrations to production
pnpm db:studio           # Open Drizzle Studio
```

## Environment variables

**.env.local** (Next.js):
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:8787
GW_API_URL=http://localhost:8787
GW_USER_ID=your-user-id
```

**.dev.vars** (Cloudflare Workers):
```bash
CLERK_SECRET_KEY=sk_test_...
GOOGLE_GENERATIVE_AI_API_KEY=...
OPENAI_API_KEY=...
RESEND_API_KEY=...
```

## Key features of this setup

1. **Type Safety**: Hono RPC provides end-to-end type safety between frontend and backend
2. **Flexibility**: Can use both RPC client and Ky for different use cases
3. **Scalability**: Ready to add specialized workers when needed
4. **AI Integration**: Built-in support for AI features with ghostwriter agents
5. **Modern Stack**: Latest versions of all major dependencies

## Common tasks and commands

### Creating a new specialized worker (future):
```bash
# From apps directory
cd apps
mkdir -p workers/my-worker
cd workers/my-worker
npm create cloudflare@latest . -- --type=javascript
# Update package.json name to match pattern
```

### Adding service binding to main API:
```jsonc
// In apps/api/wrangler.jsonc, add:
{
  "services": [
    { "binding": "MY_WORKER", "service": "my-worker" }
  ]
}
```

### Using service binding in API:
```typescript
// In your API route handler
const result = await c.env.MY_WORKER.fetch(
  new Request('https://my-worker', {
    method: 'POST',
    body: JSON.stringify(data)
  })
)
```

## Production deployment checklist

1. **Environment Variables**:
   - Vercel: Add all `NEXT_PUBLIC_*` and `CLERK_*` variables
   - Cloudflare: Add secrets via wrangler or dashboard
   - Ensure `NEXT_PUBLIC_API_URL` points to your production API

2. **Database Migration**:
   ```bash
   cd apps/api
   pnpm db:migrate
   ```

3. **Clerk Configuration**:
   - Create JWT template with correct claims
   - Add production URLs to authorized parties
   - Update CORS origins in Worker to include production domains

4. **Type Safety**:
   - Run `pnpm check-types` before deploying
   - Ensure all packages are built
   - Export API types from your Hono app

5. **API Security**:
   - Verify all routes have proper authentication
   - Check CORS configuration
   - Test rate limiting if implemented

6. **Monitoring**:
   - Enable Cloudflare Analytics
   - Set up error tracking (Sentry, etc.)
   - Monitor API response times

This setup provides a production-ready, type-safe, and performant monorepo architecture combining the best of Next.js on Vercel and Cloudflare Workers with D1 database, shared authentication, and modern tooling.