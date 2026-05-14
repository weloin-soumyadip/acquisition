# Acquisition service with Neon Local (dev) and Neon Cloud (prod)
This project supports two database modes:
- Development: Neon Local proxy in Docker with ephemeral branches
- Production: direct connection to Neon Cloud via `DATABASE_URL`
## Files added
- `Dockerfile`
- `docker-compose.yml` (dev default)
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `.env.development`
- `.env.production`
## 1) Development with Neon Local
### Prepare environment variables
Update `.env.development`:
- `NEON_API_KEY`
- `NEON_PROJECT_ID`
- optional `PARENT_BRANCH_ID` (if you want a specific parent branch)

Your app DB URL should stay:
`DATABASE_URL=postgres://neon:npg@neon-local:5432/acquisition?sslmode=require`

The app is configured to use Neon Local HTTP endpoint via:
- `NEON_USE_LOCAL=true`
- `NEON_LOCAL_PROXY_URL=http://neon-local:5432/sql`
### Start development stack
```bash
docker compose --env-file .env.development -f docker-compose.dev.yml up --build
```
or use default dev compose file:
```bash
docker compose --env-file .env.development up --build
```

This starts:
- `neon-local` on port `5432`
- `app` on port `3000`

Neon Local creates ephemeral branches by default, and deletes them on shutdown when `DELETE_BRANCH=true`.
### Development testing isolation
To create a separate ephemeral branch for tests, run compose under a different project name:
```bash
docker compose --project-name acquisition-test --env-file .env.development -f docker-compose.dev.yml up --build -d
```
Stop and remove:
```bash
docker compose --project-name acquisition-test -f docker-compose.dev.yml down
```
## 2) Production with Neon Cloud
### Prepare production env
Set `.env.production` with your real Neon Cloud URL:
`DATABASE_URL=postgres://...neon.tech/...`

In production:
- `NEON_USE_LOCAL=false`
- Neon Local is **not** used
### Start production stack
```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

The production compose file runs only the app container and connects to external Neon Cloud through `DATABASE_URL`.
## 3) How DATABASE_URL switches between environments
- Dev (`.env.development`): `DATABASE_URL=postgres://neon:npg@neon-local:5432/acquisition?sslmode=require`
- Prod (`.env.production`): `DATABASE_URL=postgres://<user>:<password>@<project>...neon.tech/<database>?sslmode=require`

Because compose uses different env files, the same app code switches DB target without hardcoded secrets.
