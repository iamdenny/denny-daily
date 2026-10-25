# Denny Daily source map

Repository-level map, reviewed 2026-10-25. Generated output lives in `dist/`; modify source files instead.

| Area | Source | Responsibility |
| --- | --- | --- |
| Build and discovery | [scripts/build.mjs](../scripts/build.mjs), [scripts/discovery.mjs](../scripts/discovery.mjs) | Generate localized HTML, useful related links, public metadata and release artifacts. |
| Asset cache consistency | [scripts/version-modules.mjs](../scripts/version-modules.mjs), [scripts/version-styles.mjs](../scripts/version-styles.mjs) | Version module imports and stylesheet URLs together with the generated pages. |
| Product behavior | [src/app.js](../src/app.js), [src/logic.js](../src/logic.js), [src/packs.js](../src/packs.js), [src/flag-expansion.js](../src/flag-expansion.js), [src/review-packs.js](../src/review-packs.js), [content.json](../content.json) | A five-flag daily challenge with UTC boundaries, browser-local streaks, regional practice and five-flag review decks. The practice pool contains 192 countries; the daily challenge retains its separate 40-country pool. Loading reserves quiz space, progress is announced, and consented quiz milestones exclude answers. |
| Consent and measurement | [src/consent.js](../src/consent.js), [src/analytics.js](../src/analytics.js) | Read separate privacy choices and gate the production analytics loader. |
| Advertising | [src/adsterra.js](../src/adsterra.js), [src/ads.js](../src/ads.js), [src/service-promo.js](../src/service-promo.js) | Keep first-party promotions and provider-gated ad serving distinct. |
| Presentation | [src/style.css](../src/style.css) | Responsive layout, consent actions and printable output. |
| Localization | [src/i18n.js](../src/i18n.js), [src/messages.json](../src/messages.json) | Authoritative locale dictionaries and content fields; do not duplicate translated strings in docs. |
| Tests and audits | [tests/](../tests/), [scripts/check-seo.mjs](../scripts/check-seo.mjs) | Behavioral invariants, manifest integrity and generated SEO/link checks. |
| Operations | [scripts/indexnow.mjs](../scripts/indexnow.mjs), [scripts/search-health.mjs](../scripts/search-health.mjs), [.github/workflows/](../.github/workflows/) | Post-deploy submissions and scheduled public crawlability checks. |

Build-time content and metadata become static pages; browser modules add interaction. Consent state gates optional integrations. See [operations](operations.md) and [design](../DESIGN.md) for workflow and UX constraints.
