# Arena reliability and eight-platform release

Target: `sellfmedia-del/sellf-compete`, Vercel `sellf-compete`, Supabase `yfighbxyrofdymnlizjf` in organization `dtisbtqfptqxwdlxpboy`. Do not apply this migration to SellfTask.

## Scope

- Shared Google Merchant Center, Website, Trendyol, Hepsiburada, Etsy, Amazon, B2B and physical-store options in Audit and Arena.
- Normalize current Trendyol nested product records and separate review records, and Amazon numeric observations. Do not infer missing prices, reviews or ratings with AI.
- URL/product identity matching, measurement timestamps, currency-aware numeric deltas, review population/sample/display counts, partial-source warnings and preserved history. Legacy AI output cannot act as a verified baseline.
- Reserve credits with conditional updates before collection, compensate failed operations, and enforce Arena entitlement on the server. A process killed during collection/refund still requires manual reconciliation; this release does not introduce a durable job queue.
- Authenticated, one-time trial activation; email verification callback; trial-to-paid state clearing.
- Branded inline Paddle checkout and credit-limit dialog. Webhook entitlement comes from signed catalog line items. Payment crediting/audit insertion is atomic and deduplicated by transaction ID; status events respect their event time.
- Abort account deletion if subscription cancellation fails.
- Bound provider attempts, model input/output/thinking, actor charges and research evidence. Refuse paid scans until reviewed spending budgets are configured; see [cost-review.md](cost-review.md). Cost parity and profitability remain unverified.

## Validation

`npm test` covers normalization, identity, missing values, changes, credit concurrency/refund, entitlement, ownership, API-to-storage behavior, eight platform dispatch, payment policy and preview guards. Provider calls are mocked.

Typecheck: `npx tsc --noEmit --incremental false`.

Production build: `npm run build` with the required build environment. In the inspection container Google Fonts requires `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`; no project configuration was changed for that container issue.

Standalone SQL validation uses a disposable PostgreSQL-compatible PGlite database, not production:

```sh
npm install --prefix /tmp/compete-sql-check --ignore-scripts @electric-sql/pglite
PGLITE_PATH=/tmp/compete-sql-check/node_modules/@electric-sql/pglite node tests/sql-validation.cjs
```

The SQL harness verifies anonymous/cross-account rejection, own-account decrement, exhausted balance, trigger permissions, duplicate payments, trial upgrade, stale event ordering and credit-only purchases preserving canceled status.

## Preview and remaining verification

`/review` composes the actual input/selector, change display, review coverage and credit dialog components with clearly labeled demonstration measurements. It is unavailable on production. Preview endpoints block new scans, saves, trial activation, account deletion, webhook processing and checkout against the known production database. The UI review page does not require a SellfCompete account. This does not convert the entire legacy application or its browser-side Supabase calls to a sandbox.

No real marketplace scan or Paddle purchase was run. Validate direct-provider response mapping and latency, and the complete sandbox checkout/webhook flow, against an isolated Supabase test project before release. Google Merchant Center is public Shopping research in this release, not an authenticated account connection. Website, Hepsiburada, Etsy, B2B and physical-store modes use web research; verified numeric tracking requires a supported direct source. Marketplace account imports and the expanded B2B/profit-calculator/extension modules are later phases.

## Production gate

The migration is prepared but has not been applied to production. Before release:

Complete the billing comparison and unit economics in `docs/cost-review.md` first. Missing budget settings deliberately disable the new scan engines; configuring an arbitrary cap is not proof of equal cost or profit. Do not release the branch before this gate is satisfied.

1. Reconfirm target project and organization. Export existing function definitions, permissions and schema metadata for the affected functions/tables; take an appropriate database backup.
2. Present and approve `supabase/migrations/20261026140124_secure_compete_credit_rpc.sql`. It restricts the existing credit function and trigger, adds nullable payment reference/event-time columns plus an index, and adds service-role-only payment/status functions. It does not rewrite historical rows or delete data.
3. Apply and validate the migration in staging, then to the approved production project before releasing this webhook implementation. Run Supabase advisors and the ownership/idempotency scenarios with disposable staging accounts.
4. Obtain explicit production approval and release the tested branch. Verify the production domains, auth, profile reads, a controlled successful scan, failure refund and billing lifecycle.

Rollback: restore the previous deployment/commit `29cf7c4c8119b7e0c700cb7568892c754af8b987`. Keep the restrictive credit/trigger permissions and additive columns/functions: the original authenticated credit caller remains compatible. Do not drop payment history or remove the deduplication index. A rollback to the previous webhook restores its known limitations and should be temporary.
