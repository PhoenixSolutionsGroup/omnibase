# Local Setup

This is for running the full OmniBase stack **from this repo's own source** — local
Dockerfiles (`docker/auth`, `docker/permissions`, `apps/api/Dockerfile.dev`) instead of
published images, and the CLI straight from `packages/cli/src` instead of a published
npm install. If you just want to use OmniBase in your own project, see the
[self-host quickstart](https://docs.omnibase.tech/docs/guides/quickstart) instead.

## 1. Prerequisites

- [Bun](https://bun.sh)
- Docker Desktop (or a compatible engine) with Compose v2
- From the repo root: `bun install`

Go isn't required on your host — in `--mode dev` (below) `apps/api` builds and
hot-reloads (via `air`) inside its own container.

## 2. Link the CLI as `omnibase-l`

`packages/cli` isn't published or globally installed here, and its own `dev` script
(`bun src/index.ts`) already runs the CLI straight from TypeScript with no build step.
Wrap that in a small script on your `$PATH` named `omnibase-l` so it doesn't collide
with a real `omnibase` install:

```bash
# from the repo root
mkdir -p ~/.local/bin   # or any directory already on your $PATH
cat > ~/.local/bin/omnibase-l <<EOF
#!/usr/bin/env bash
exec bun "$(pwd)/packages/cli/src/index.ts" "\$@"
EOF
chmod +x ~/.local/bin/omnibase-l
```

Make sure `~/.local/bin` (or wherever you put it) is on your `$PATH`. Because this runs
live from `src/`, CLI changes take effect immediately — no rebuild, no relink.

Verify it works:

```bash
omnibase-l --version
```

## 3. Create `omnibase/.env.local`

The repo root already has `omnibase/omnibase.toml` — this repo is itself an OmniBase
project (`omnibase start` finds it by walking up for a directory literally named
`omnibase/`). `omnibase-l start` builds one effective env file from
`omnibase/.env.local` and uses it both as Docker Compose's `--env-file` **and** as the
environment for the `apps/dashboard` dev server it spawns — so this one file covers
both.

`omnibase/.env.local` is already gitignored (`.env.*` in the root `.gitignore`), so
it's safe to put real secrets in it.

Copy this in as a starting point:

```bash
# --- Core API ---
OMNIBASE_API_URL=http://localhost:8080
NEXT_PUBLIC_OMNIBASE_API_URL=http://localhost:8080

# --- PostgREST ---
OMNIBASE_POSTGREST_URL=http://localhost:8001
NEXT_PUBLIC_OMNIBASE_POSTGREST_URL=http://localhost:8001

# Static `{"role":"anon_user"}` JWT signed with the default dev JWT_SIGNING_KEY
# below. If you override JWT_SIGNING_KEY, you MUST regenerate this (see note
# under "Secrets" further down) or PostgREST will reject it.
OMNIBASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbl91c2VyIn0.it2eXd3QUMdEJ-BfHGE7phoVNhiJMYqwLF2qWVwiUZU
NEXT_PUBLIC_OMNIBASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbl91c2VyIn0.it2eXd3QUMdEJ-BfHGE7phoVNhiJMYqwLF2qWVwiUZU

# --- Auth / cookies ---
# The dashboard hosts /auth/* (login, callback, etc.), so it's the "website"
# as far as the auth service is concerned. omnibase start runs it on :8787.
WEBSITE_URL=http://localhost:8787
NEXT_PUBLIC_WEBSITE_URL=http://localhost:8787
ALLOWED_RETURN_URLS=http://localhost:8787
COOKIE_DOMAIN=localhost
OMNIBASE_COOKIE_DOMAIN=localhost

# --- Secrets (docker-compose.base.yml already has working dev defaults for
# these; uncomment to override) ---
# COOKIE_SECRET=
# CIPHER_SECRET=
# JWT_SIGNING_KEY=
# JWT_SECRET=
# API_SERVICE_KEY=

# --- Managed hosting control plane (external, not self-hosted by this repo) ---
# Defaults to the hosted api.omnibase.com if left unset. The dashboard's
# project/branch management pages need real access to this; the core BaaS
# stack (auth, rest-api, postgrest, etc.) does not.
# MANAGED_HOSTING_API_URL=
# NEXT_PUBLIC_MANAGED_HOSTING_API_URL=
# NEXT_PUBLIC_OMNIBASE_WORKER_URL=

# --- Optional: Stripe (leave blank unless testing billing) ---
# STRIPE_SECRET_KEY=
# STRIPE_PUBLISHABLE_KEY=
# STRIPE_WEBHOOK_SECRET=

# --- Optional: Google sign-in ---
# omnibase/omnibase.toml already declares a Google OIDC provider expecting
# these. Leave blank and Google sign-in just won't work; everything else
# (email/password auth, etc.) is unaffected.
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
```

## 4. Start everything

```bash
omnibase-l start --mode dev --build   # first run — builds local images
omnibase-l start --mode dev           # subsequent runs
```

`--mode dev` builds `auth`, `auth-migrate`, `permissions`, and `permissions-migrate`
from `docker/auth` and `docker/permissions`, and `rest-api` from
`apps/api/Dockerfile.dev` (hot-reloads via `air`) — all from this repo's source, not
pulled images.

This brings up:

| Service | URL |
|---|---|
| REST API | http://localhost:8080 |
| Auth | http://localhost:4433 (public), :4434 (admin) |
| Permissions | internal only |
| PostgREST | http://localhost:8001 |
| Postgres | localhost:5432 |
| PgBouncer | localhost:6432 |
| Adminer | http://localhost:8081 |
| Mailpit (SMTP inbox UI) | http://localhost:8025 |
| RustFS (S3-compatible) | http://localhost:9000 (API), :9001 (console) |
| Dashboard | http://localhost:8787 |
| Docs | http://localhost:8788 |
| Website | http://localhost:8789 |

The last three are spawned as `bun run dev` processes (one per `[[deployments]]` entry
in `omnibase/omnibase.toml`), not Docker containers — their logs stream to the same
terminal, prefixed with the deployment name.

Stop everything with:

```bash
omnibase-l stop
```

## 5. Verify

```bash
curl http://localhost:8080/health
```

Then open http://localhost:8787 — the dashboard should load without `OMNIBASE_API_URL`
or `OMNIBASE_ANON_KEY` undefined-env errors.
