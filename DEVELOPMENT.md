# DecatAPP - Local Development Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set at minimum:
- `VITE_OAUTH_PORTAL_URL`: Your OAuth server URL (required for login/signup)
- `VITE_APP_ID`: Your app ID (required for OAuth)
- `DATABASE_URL`: Your Postgres/Supabase database connection string

### 3. Run Development Server
```powershell
# PowerShell
$env:NODE_ENV = 'development'; npx tsx watch server/_core/index.ts
```

Or with npm:
```bash
npm run dev
```

The server will start on `http://localhost:3000/`

## Project Structure

```
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main app routes
│   └── index.html         # Entry point
├── server/                # Node.js/Express backend
│   ├── _core/
│   │   ├── index.ts       # Server entry point
│   │   ├── vite.ts        # Vite middleware setup
│   │   ├── oauth.ts       # OAuth handler
│   │   ├── context.ts     # tRPC context
│   │   └── trpc.ts        # tRPC router
│   ├── routers.ts         # API routes
│   ├── db.ts              # Database queries
│   └── storage.ts         # File/S3 operations
├── drizzle/               # Database migrations and schema
│   └── schema.ts          # Drizzle ORM schema
├── shared/                # Shared types and constants
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server (with Vite HMR)
- `npm run build` - Build client and server for production
- `npm start` - Run production server
- `npm run check` - TypeScript type checking
- `npm run test` - Run tests with Vitest
- `npm run format` - Format code with Prettier
- `npm run db:push` - Apply database migrations

## Authentication (OAuth)

The app uses OAuth for user authentication. Before running:

1. Set up an OAuth server or use an existing one
2. Configure `VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID` in `.env.local`
3. Set `OAUTH_SERVER_URL` for the backend

**Without OAuth configured**: The login buttons will redirect to `/?oauth_missing=1` as a fallback. Configure OAuth to enable real authentication.

## Database Setup

The project uses Postgres (via Drizzle ORM) and is preconfigured for Supabase:

1. Create a Supabase project (or local Postgres database)
2. Get your connection string
3. Set `DATABASE_URL` in `.env.local`
4. Run migrations:
   ```bash
   npm run db:push
   ```

## Common Issues & Solutions

### "Buttons don't work" or "No response on click"
1. Ensure dev server is running: `$env:NODE_ENV = 'development'; npx tsx watch server/_core/index.ts`
2. Check browser Console (DevTools → Console) for errors
3. Verify OAuth env vars are set (`VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`)
4. Hard reload the browser (Ctrl+Shift+R)

### "Missing OAuth configuration" appears
- This is expected if `VITE_OAUTH_PORTAL_URL` or `VITE_APP_ID` are not set
- Configure them in `.env.local` and restart the dev server

### "Database connection failed"
1. Check `DATABASE_URL` in `.env.local`
2. Ensure Postgres/Supabase is running and accessible
3. Verify credentials in the connection string

### Type errors after changes
- Run `npm run check` to verify TypeScript
- Restart dev server if TypeScript had errors

## Deployment

See `DEPLOY.md` for production deployment instructions to Vercel, Railway/Render, and Supabase.

## Key Technologies

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, tRPC, TypeScript
- **Database**: Postgres, Drizzle ORM
- **Authentication**: OAuth
- **Testing**: Vitest
- **Build**: Vite + esbuild
- **Deployment**: Vercel (frontend), Railway/Render (backend), Supabase (database)
