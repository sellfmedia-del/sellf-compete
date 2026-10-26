# SellfCompete cost review — 2026-10-26

**Status: cost parity and profitability are NOT yet verified. Do not enable the new paid scan implementation in production.** No paid provider scan or purchase was performed in this review. Production remains on `29cf7c4`.

## Findings and changes

| Cost driver | Production baseline | Initial feature branch | Revised branch |
| --- | --- | --- | --- |
| Arena Gemini generation | Usually one Pro call; up to three attempts | One Pro call; full review sample and up to 48,000 web characters | At most one Pro generation; 12,000 input tokens, 4,096 output tokens, 1,024 thinking budget |
| Audit Gemini generation | Discovery + final report; final can retry three times | Same retries; raw dataset increased from 20 to 700 rows | At most discovery + final report, no paid retries; explicit input/output/thinking limits |
| Arena Trendyol | One actor, limit 20, reviews without explicit sample bound | One actor, up to six targets, 50 reviews/product, enrichment enabled | One actor, limit 10 (actor schema minimum), 10 reviews/product, enrichment disabled |
| Audit Trendyol | One actor, limit 20, reviews without explicit sample bound | 30 reviews/product | One actor, limit 10, 10 reviews/product, enrichment disabled |
| Arena Amazon | Up to 30 items/start URL | One item/start URL | One item/start URL |
| Audit Amazon | Up to 30 items/start URL | Same | At most 10 items/start URL |
| Apify billing limit | No monetary run limit | No monetary run limit | Required configured `maxTotalChargeUsd`, timeout 90 seconds, restart disabled |
| Tavily | One advanced search/scan | Arena raw content, 8 results | One advanced search/scan, 5 snippet results, raw content and generated answer disabled, auto depth disabled |
| Previous snapshots | Sent back to Arena model | Not sent | Not sent; numeric deltas calculated locally |

Reading only the first N returned actor rows does **not** limit the actor's bill. Input limits and the provider-side monetary cap matter. Trendyol reviews and enrichment may be separate charge events; a headline per-product price is not an all-in quote. The current Amazon actor's name includes “free” but its listing advertises paid result pricing.

The smaller review sample and input/output limits may reduce qualitative coverage. Numeric totals and changes remain based on source metrics, independently of model input. Audit includes at most five review texts/product and the first 24,000 document characters; document truncation is disclosed in report warnings. Token counting rejects oversized prompts before generation rather than guessing tokens from characters. A truncated generation is rejected and is not retried.

## Configuration gate

The new engines refuse to call any paid provider until positive finite server-side values are supplied for:

- `COMPETE_ARENA_BUDGET_USD` and/or `COMPETE_AUDIT_BUDGET_USD`: reviewed allowable variable cost per attempt for each enabled feature.
- `COMPETE_APIFY_MAX_RUN_USD`: allowable actor run charge, required only for direct marketplace scans.
- `COMPETE_TAVILY_CREDIT_USD`: verified account credit price; do not assume the free allowance will cover commercial usage.

Before the first provider call, the engine compares the sum of the actor cap, two Tavily credits and maximum model allowances against the scan cap. It rejects the scan if that sum exceeds the cap. Each scan object permits one actor, one search, and only the expected model stages. The budget gate is deliberately unset; no arbitrary business spending allowance was approved or installed. Test fixture values are not release budgets.

For cost reservation only, the code uses Gemini 2.5 Pro Standard prices of $1.25/M input and $10/M output at prompts below 200k tokens, checked against the official pricing page on this date. It conservatively adds the thinking budget to the output allowance, even when thinking is counted within the output limit. Maximum model reservations are $0.06620/Arena attempt and $0.14148/Audit attempt. Add the configured actor cap (if any) and two account-priced Tavily credits. These are conservative **variable-provider reservations**, not measured all-in costs or profit estimates. Provider tariff changes require reviewing the constants and configuration before enabling/releasing scans.

Each attempt logs a correlation ID, UTC timestamp, configured ceiling, provider attempts, and returned model/search usage. No source text, customer document, API credential or model prompt is logged. Missing usage is recorded as unknown, never zero. Logs do not replace provider invoices; Apify billed amounts and failed/ambiguous runs must be reconciled from provider records.

## Required evidence before production

1. Read the account's actual Apify/Tavily/Google usage and billing records, including failures. Match historical scans to provider charges. There are no historical per-scan cost records in this repository, so equal cost cannot be proved from source code alone.
2. Verify the live Paddle catalog and settlement amounts. The site advertises $22/month for 5 credits and $1.90/additional credit. Those are displayed gross prices, not verified net settlement. Account fees, tax treatment, refunds, discounts and FX can change the revenue actually retained.
3. Calculate a cap that is no higher than the verified legacy cost allowance and leaves positive contribution after provider costs, expected failures/refunded scans, free-trial acquisition costs, payment costs and allocated hosting/storage. Do not derive an allowance solely from the $22 subscription: additional credits can have a lower unit price.
4. In isolated staging, compare old and new on the same target/rival sets. Establish a bounded test budget first. Measure total billed cost, latency and evidence quality for baseline, update, max rivals, long document, provider failure and repeated-request cases. Use the same pricing tier; do not compare one free allowance with a paid-tier result.
5. Only set the environment budgets after that evidence supports non-increase and margin. No new actor, scheduled/background scan, platform fan-out or platform-specific paid integration is enabled by adding a selection to the UI.

Per-attempt caps are not an account-wide or monthly spending limit. Repeated failed scans can still incur supplier costs while the customer receives a credit refund. Trial abuse, repeated requests, durable recovery, and global spending alerts/limits need to be accounted for before commercial rollout; this change does not silently change customer refund entitlements. No production environment variables, database records or deployment aliases were changed by this review.

## Official references

- Gemini pricing: https://ai.google.dev/gemini-api/docs/pricing
- Token counting: https://ai.google.dev/gemini-api/docs/tokens
- Apify run parameters and monetary limit: https://docs.apify.com/api/v2/actor-run-sync-get-dataset-items-post
- Trendyol input schema and charge listing: https://apify.com/fatihtahta/trendyol-scraper/input-schema and https://apify.com/fatihtahta/trendyol-scraper/pricing
- Existing Amazon actor: https://apify.com/junglee/free-amazon-product-scraper
- Tavily search/credits: https://docs.tavily.com/documentation/api-reference/endpoint/search and https://docs.tavily.com/documentation/api-credits
