# JSONDeveloper

Free, fast, browser-based developer tools — JSON, API, regex, SQL, web, and DevOps utilities. Most tools run entirely client-side; the few that need a backend (API Client, Website Security Audit) go through a small, SSRF-protected proxy rather than a general-purpose server.

Live at [jsondeveloper.com](https://jsondeveloper.com).

## Monorepo structure

Turborepo + pnpm workspaces.

```
apps/
  web/     Next.js 16 (App Router) frontend — all tool UIs, SEO content, blog/guides.
           Statically exported (output: "export") and deployed to Cloudflare Workers.
  proxy/   Cloudflare Worker (no framework) — api.jsondeveloper.com in production.
           Handles /api/request (the API Client's outbound proxy) and
           /api/security-audit (the Website Security Audit backend), both with
           their own SSRF validation, rate limiting, and resource limits.
  api/     Express.js + TypeScript backend. Exists in this repo but is deployed
           and operated separately — it is not part of this repo's build/deploy
           pipeline (see Deployment below).
packages/
  config/            Shared product config (name, description, URLs) from env vars.
  ui/                Shared React component library.
  types/             Shared TypeScript types.
  validators/        Shared Zod schemas.
  eslint-config/      Shared ESLint config.
  typescript-config/  Shared tsconfig bases.
```

Each app/package is 100% TypeScript.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui-style components
- **Backend:** Cloudflare Workers (`apps/proxy`), Express.js + TypeScript (`apps/api`)
- **Validation:** Zod
- **Testing:** Vitest
- **Monorepo:** Turborepo + pnpm
- **Deployment:** Cloudflare Workers (`wrangler`)

## Tools

Grouped by category; only tools marked `available: true` in `apps/web/lib/tools/registry.ts` are live. Everything else in the registry is a planned/"coming soon" entry already reserved in navigation.

- **JSON:** JSON Formatter, JSON Validator, JSON Minifier, JSON to TypeScript, JSON to Zod, JSON to Python, JSON to PHP, JSON to Java, OCR to JSON
- **API:** API Client, JWT Decoder, cURL Generator
- **Regex:** Regex Tester
- **Database:** SQL Formatter
- **Web:** Website Security Audit
- **Utilities:** Timestamp Converter, Code Diff
- **DevOps:** Cron Generator, Cron Parser, .htaccess Generator, Nginx Config Generator, Docker Compose Generator

## Getting started

Requires Node 18+ and pnpm.

```sh
pnpm install
cp .env.example .env   # fill in values, or keep the local-dev defaults
```

Run everything:

```sh
pnpm dev          # turbo run dev — web on :3001, proxy via `wrangler dev` (defaults to :8787)
```

If you run the proxy on a non-default port, update `NEXT_PUBLIC_API_URL` in `.env` to match.

Run a single app ([filtered](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)):

```sh
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=proxy
```

Other common commands (each also runnable scoped to one app via `--filter`):

```sh
pnpm build         # turbo run build
pnpm test          # turbo run test (vitest)
pnpm lint          # turbo run lint
pnpm check-types   # turbo run check-types
pnpm format        # prettier --write
```

## Deployment

`deploy.py` builds and deploys `apps/proxy` and `apps/web` to Cloudflare Workers, in that order:

```sh
python deploy.py
```

It runs, in sequence: `wrangler deploy` in `apps/proxy`, `pnpm run build` in `apps/web`, then `wrangler deploy` in `apps/web`. `apps/api` is **not** touched by this script — it's deployed and hosted separately.

## Security

`apps/proxy` enforces SSRF protection (blocking localhost, private/reserved IP ranges, link-local and cloud-metadata addresses, and DNS-rebinding via resolved-address re-checking) on every outbound request it makes on a user's behalf, plus per-feature rate limiting and request/response size and timeout limits. See `apps/proxy/src/ssrf.ts` and `apps/proxy/src/security-audit/ssrfGuard.ts`.

## Useful links

- [Turborepo docs](https://turborepo.dev/docs)
- [Next.js docs](https://nextjs.org/docs)
- [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
