# Security Policy

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could expose credentials, personal data, or emergency-response capabilities. Report it privately to the maintainers listed in the repository profile, and include reproduction steps, affected files, and impact.

## Secret handling

- Only `VITE_*` variables belong in the client bundle. They are publishable by design and protected by Row Level Security.
- Server secrets (`LOVABLE_API_KEY`, `ML_MODEL_URL`, service-role keys) belong in Supabase project secrets, never in `.env` or the repository.
- `.env` and `.env.*` are ignored; `.env.example` contains placeholders only.
- `supabase/.temp/` is local CLI metadata and must not be committed.

## Required rotation after the 2026-11-12 audit

The audit found that `.env` was tracked in earlier git history. Treat every credential that ever appeared in that file as compromised, even if it has since been removed from the working tree.

Rotate, in this order:

1. Supabase service-role key and any legacy JWT secret.
2. Supabase publishable/anon key (update `VITE_SUPABASE_PUBLISHABLE_KEY` after rotation).
3. Lovable AI gateway key (`LOVABLE_API_KEY`).
4. NASA FIRMS API key (`VITE_NASA_FIRMS_API_KEY`).
5. CARTO API key (`VITE_CARTO_API_KEY`).
6. Any personal access token or database URL that appeared in `.env` history.

After rotation:

```bash
supabase secrets set LOVABLE_API_KEY=...
supabase secrets set ML_MODEL_URL=...   # optional
```

Update the local `.env` with the new publishable values, then redeploy the edge functions and the client.

## Purging secrets from git history

Removing `.env` from the current tree does not remove it from history. If this repository is or will be public, purge the history with `git filter-repo` or BFG **after coordinating with every contributor**, because the rewrite changes commit hashes and requires a force-push.

Example (destructive; run only with explicit team approval and a fresh backup):

```bash
git filter-repo --path .env --invert-paths
```

Do not rewrite history as part of an ordinary feature PR.

## Current access-control notes

- `resqai-chat` verifies the caller's Supabase access token before spending AI credits.
- `predict-risk` and `fetch-disasters` are intentionally callable without a user session; add caching and rate limiting before high-traffic production use.
- `evac_notifications` currently allows anonymous inserts and must be tightened before production.
- RLS is enabled on the core tables, but there is no automated RLS test matrix yet.

## Supported versions

This project is under active development. Security fixes are applied to the `main` branch only.
