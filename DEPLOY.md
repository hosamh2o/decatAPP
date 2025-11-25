# Deployment guide — Client on Vercel, Server on Render/Railway, Database on PlanetScale

This repo contains a Vite React client in `client/` and a Node Express + tRPC server under `server/_core`.

This document covers the recommended, minimal-friction path:
- Frontend: Vercel (static site)
- Database: PlanetScale (MySQL)
- Backend: Render or Railway (Node service)

Follow these steps in order.

---

## 1) Prepare repository
- Ensure your code is pushed to GitHub (you already pushed changes to `main`).
- We added `vercel.json` so Vercel will pick up the static build output at `dist/public`.

## 2) Create a PlanetScale database
1. Sign in to https://planetscale.com and create an organization/project.
2. Create a new database (name it `decatdb` or whatever you prefer).
3. Create a development branch (PlanetScale uses branching). For simple migration runs you can use the `main` branch if you understand PlanetScale deploy requests — otherwise use a development branch.
4. Create a password-based user/connection (Go to "Settings" → "Password" or "Connect" to get a connection string). Copy the connection string.

PlanetScale connection string example (MySQL URI format):
```
mysql://username:password@us-east-1.psdb.cloud/decatdb
```

> Note: PlanetScale has a branching/Deploy Request workflow and restricts some DDL operations on production branches. If you run into migration errors, either use the dev branch or use another managed MySQL (Render DB, AWS RDS) for easier migrations.

## 3) Set DATABASE_URL and run Drizzle migrations
Locally (PowerShell):
```
# Example: set DATABASE_URL in PowerShell then run migrations
# $env:DATABASE_URL = 'mysql://user:pass@host:3306/decatdb'
# or set the value appropriate for PlanetScale
# $env:DATABASE_URL = '<YOUR_PLANETSCALE_CONNECTION_STRING>'
# then run drizzle migrations (project has a script `db:push`)
npm run db:push
```

If `npm run db:push` fails against PlanetScale due to DDL restrictions, either:
- Run migrations against a non-production/dev branch, or
- Create the schema manually using the SQL files or run the migrations on an RDS instance and then promote schema to PlanetScale via deploy requests.

## 4) Deploy backend (Render / Railway recommended)
Example: Render
1. Create an account and connect your GitHub repo.
2. Create a new Web Service and point it to your repository branch `main`.
3. Set the build and start commands:
   - Build Command: `npm run build`
   - Start Command: `node dist/index.js`
4. Add environment variables under service settings:
   - `DATABASE_URL` = your PlanetScale connection string
   - `OAUTH_SERVER_URL` and any OAUTH_CLIENT_ID/SECRET if required
5. Deploy. Render will run the build, publish `dist/` and start the server.

Railway/Fly have similar flows — set the same build/start commands and env vars.

## 5) Deploy frontend to Vercel
1. Go to https://vercel.com/new and import your GitHub repo.
2. When prompted:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
3. Set environment variables that should be available to the client (only `VITE_` prefixed variables):
   - `VITE_APP_TITLE`, `VITE_APP_LOGO`, `VITE_ANALYTICS_ENDPOINT`, etc.
   - Do NOT put secrets (DB or OAuth client secrets) into VITE_ variables.
4. Deploy.

## 6) Wire client → server
- In the client code, configure the API base URL to point to your server (the Render/Railway URL). Set this value via an env var (for example `VITE_API_URL`) and deploy the client with that env var set in Vercel.

## 7) Post-deploy: verify
- Visit the frontend URL from Vercel.
- Check API calls reach the backend (inspect network tab). If CORS or host issues appear, ensure server middleware allows your Vercel domain.

## Troubleshooting notes
- PlanetScale + migrations: PlanetScale's branching model can make automated migrations tricky. Use a dev branch or alternate MySQL host for migrations if needed.
- If `npm run build` fails on Render because of environment differences, set `NODE_ENV=production` in the service env and ensure all build dependencies are installed.
- If your server needs files in `dist/` (we build the server bundle to `dist`), confirm the build step outputs `dist/index.js` (the top-level `build` script does this via esbuild for server code).

---

If you want, I can:
- add a short `README` section with the exact env var list for both Vercel and Render and push it, or
- Add a utility script that runs `npm run db:push` after validating `DATABASE_URL` is set.
