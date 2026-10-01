# Affiliate Store Directory — Complete Build Spec (Next.js + Firebase)

**Version:** 2 (replaces the earlier Postgres/Prisma spec) · **Date:** 1 October 2026
**Site name:** Discountly
**Legend:** ✅ verified against a live source on 2026-10-01 · ⚠️ not verified, check before relying on it · `{Placeholder}` = replace with your own value.

---

## 1. Product description

### 1.1 What it is
A public directory of online stores. **You (the admin)** add each store, its official website, and your affiliate link through a private admin panel. Visitors browse by category and click through to the store using your affiliate link, with a clear disclosure.

### 1.2 Who it is for
Shoppers who want a short, honest, hand-checked page about an online store before they visit it.

### 1.3 Starter site copy (edit into your own voice)
> These are **starter drafts for your own site pages**, not store content. Replace anything that isn't true for your site. Do not publish claims you can't back up (for example "hand-checked" only if you actually check).

| Where | Starter text |
|---|---|
| Site name | Discountly |
| Tagline | "Online stores, explained clearly." |
| Home H1 | "A directory of online stores, with the details that matter." |
| Home intro | "Discountly lists online stores with a short description, the categories they sell in, and details we have verified ourselves. When you click through, we may earn a commission at no extra cost to you." |
| Home meta description (≈150 chars) | "Browse online stores by category. Each listing links to the official store and discloses our affiliate relationship." |
| Affiliate disclosure (short, shown beside every button) | "Affiliate link: we may earn a commission if you buy, at no extra cost to you." |
| Footer line | "Discountly is reader-supported. Some links are affiliate links. [How we choose stores]" |

### 1.4 Required trust pages
`/about`, `/how-we-choose-stores`, `/affiliate-disclosure`, `/privacy`, `/contact`. Write these yourself; they help users and are expected by ad/affiliate networks.

---

## 2. Decisions at a glance

| Topic | Decision | Notes |
|---|---|---|
| Framework | **Next.js 16.x**, App Router, TypeScript | nextjs.org lists 16.3.1 as latest stable ✅. Pin with `npm view next version` and commit the lockfile |
| Database | **Cloud Firestore**, accessed **only from the server** with the Firebase Admin SDK | Client access is denied by rules (§6.3) |
| Auth | **Firebase Auth**, one admin account (custom claim `admin: true`) + email allowlist | No public sign-up |
| Admin panel | Inside the same Next.js app under `/admin` (noindex, session-cookie protected) | You add stores, affiliate links and details here |
| Hosting | Firebase App Hosting (needs the **Blaze** plan ✅) or Vercel | Blaze still includes free allowances ✅ |
| Content source | Store's own public metadata + official Google APIs + **your own writing** | No AI text; no Google SERP scraping |
| Ranking safety | Pages stay `noindex` until they pass the quality gate (§8.4) | Protects the domain from "thin affiliate" treatment |
| Styling | Tailwind CSS + shadcn/ui (Radix), strict grayscale | §4 |
| Tests | Vitest + Playwright | §12 |

---

## 3. Research summary (carried over, still valid)

### 3.1 `public-apis/public-apis` ✅
Community catalog of free APIs (MIT, ≈483k stars). It is a README list, **not** a hosted API or package. Auth/CORS columns are unverified and some entries are dead. Verified stale examples: **Clearbit Logo** (shut down Dec 2025) and the old **Mozilla http-observatory v1** (replaced by MDN HTTP Observatory v2). Its "Shopping" category lists marketplace/price-scraping APIs, which this product does not use (no price claims).

### 3.2 `beyondtahir/beyondseo` ✅
MIT, v2.5.0, beta, Python 3.10+ CLI and agent skill with its own crawler (respects robots.txt, no CAPTCHA bypass). Small single-maintainer project. **Not a runtime dependency.** Use it after launch to crawl your own live site (`python3 scripts/run.py crawl https://yourdomain.com --out ./audit`) and read `report.md`/`issues.json`. Its 206-source backlink list has unverified DR values: treat it as a research list only.

### 3.3 API shortlist

| API | Use | Cost / limits | Decision |
|---|---|---|---|
| **Store's own HTML** (your native extractor) | Title, meta description, Open Graph, canonical, favicon | Free, no third party | **Use** |
| **Google Search Console API** | Real Google queries/clicks/impressions for your pages; URL Inspection (2,000 queries/day, 600/min per property ✅) | Free | **Use** (post-launch) |
| **Google Knowledge Graph Search API** | Entity lookup for well-known brands; keep the attribution/licence returned | Free key, 100,000 read calls/day ✅ | **Use** (suggestion only) |
| **PageSpeed Insights API** | Performance checks on your own pages | Free key | **Use** |
| **Web Risk API** | Check store/affiliate domains before publishing | Safe Browsing v4 is **non-commercial only**; commercial use → Web Risk ✅. Pricing ⚠️ | **Use** |
| **Icon Horse** | Favicon fallback | Free up to 1,000 icons/month ✅ | **Use (fallback)** |
| **MDN HTTP Observatory v2** | Security-header grade of your own site | No key, one scan/host/cooldown ✅ | Optional |
| **IndexNow** | Notify Bing/others of new URLs (Google doesn't use it ⚠️) | Free | **Use** |
| Places API (New) | Physical stores only | Free caps per SKU: 10k Essentials / 5k Pro / 1k Enterprise per month ✅ | Optional |
| Google Trends API | Interest over time | Invite-only alpha ✅ | Optional (apply) |
| Custom Search JSON API | — | Closed to new customers; ends 1 Jan 2027 ✅ | **Reject** |
| Google Indexing API | — | Meant for job/livestream pages only | **Reject** |
| SERP scrapers (Serpstack, Zenserp, autocomplete scraping) | — | Against Google's terms | **Reject** |
| Clearbit Logo | — | Dead ✅ | **Reject** |

---

## 4. Theme and design system

### 4.1 Principles
Premium, matte, monochrome. Dark cinematic landing hero; light, highly readable admin and public pages. No colour accents, no neon, no colourful gradients, no fake metrics, no decorative motion.

### 4.2 Design tokens (`app/globals.css`)

```css
:root {
  /* grayscale only */
  --black:      #0A0A0A;
  --charcoal:   #141414;
  --surface-d:  #1B1B1B;   /* cards on dark */
  --border-d:   #2C2C2C;
  --gray-700:   #404040;
  --gray-500:   #737373;
  --gray-400:   #8F8F8F;
  --gray-300:   #BDBDBD;
  --gray-200:   #DDDDDD;
  --off-white:  #F6F6F4;
  --white:      #FFFFFF;

  --bg:         var(--off-white);
  --surface:    var(--white);
  --border:     #E4E4E1;
  --text:       #111111;
  --text-muted: #5C5C5C;   /* AA on off-white */
  --focus:      #111111;

  --radius: 8px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.06);
  --shadow-md: 0 8px 24px rgba(0,0,0,.08);
}
.hero { background: var(--black); color: #EDEDED; }          /* landing hero only */
:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```
On dark sections, switch focus outline to `#FFFFFF`.

### 4.3 Typography
**Inter** via `next/font/google` (self-hosted at build), `display: swap`. Scale: 14 / 16 / 18 / 24 / 32 / 48 / 64. Headings 600 weight, tracking −0.02em, line-height 1.1–1.2; body 1.6. One H1 per page.

### 4.4 Components (shadcn/ui, restyled)
- **Buttons:** primary = black fill/white text; secondary = white fill, 1px border; ghost for tertiary. Min height 44px.
- **Cards:** white, 1px border, 8px radius, `--shadow-sm`; hover → `--shadow-md` (no movement under reduced motion).
- **Status badges** (never colour alone, always text + shape): `Draft` (outlined), `Published` (solid black), `Archived` (gray fill), `Needs review` (dashed outline with "!" icon).
- **Affiliate button:** label "Visit {Store}" + small text "Affiliate link" with an info icon; `rel="sponsored nofollow noopener noreferrer"`.
- **Tables (admin):** sticky header, row height 48px, keyboard-navigable rows.
- **Forms:** visible labels, inline errors tied with `aria-describedby`, `aria-live="polite"` for job/status messages.
- **Layout:** 12-col grid, max width 1120px, spacing scale 4/8/12/16/24/32/48/64, generous whitespace.

### 4.5 Accessibility checklist
WCAG AA contrast, full keyboard navigation, skip-to-content link, focus rings, labelled landmarks, alt text on all meaningful images, reduced-motion support, no autoplay, touch targets ≥ 44px.

---

## 5. Content writing system ("from Google", not AI)

### 5.1 What "from Google" can honestly mean
You cannot copy text out of Google's search results (scraping is against Google's terms and was ruled out). Content is built from sources in this priority order:

1. **The store's own website** (your fetched metadata + the pages you read yourself): the most reliable source for what the store sells.
2. **Official Google APIs:** Knowledge Graph (entity description + type, with licence/attribution), Search Console (real queries about *your* pages), PageSpeed (facts about page performance).
3. **Primary sources you open yourself:** shipping, returns and contact pages of the store.
4. **Your own words.** Google's spam policies target "thin affiliation": pages that repeat merchant text with nothing original. Original, useful content is what makes a page worth indexing.

No text is generated by a language model. The database has no `AI` source value.

### 5.2 Source tags (stored per field)
`OWNER_SITE` · `GOOGLE_KG` · `GOOGLE_PLACES` · `WIKIDATA` · `USER` · `TEMPLATE`
and a state: `needs_review` | `confirmed`.

### 5.3 Per-store writing workflow (≈15–25 minutes per store)

1. **Add store** (name, website URL, affiliate URL). Click **Suggest** to fetch metadata (optional).
2. **Read the store's site yourself.** Open the homepage, a category page, and its shipping/returns policy.
3. **Check safety:** the admin runs Web Risk on both hosts. Don't publish if flagged.
4. **Write the page** using the template below. Paraphrase; do not paste the store's meta description as your body copy.
5. **Confirm facts** one by one (tick "verified", paste the policy URL, set "checked on" date).
6. **Pick categories** and one primary keyword (§9).
7. **Review the SEO checks panel**; fix every red item. Publish.

### 5.4 Page template (what you write)

| Field | Target | What to write | Don't |
|---|---|---|---|
| Short description | 110–160 chars | One sentence: what the store sells and (if verified) where it ships. Becomes the card text and the meta-description base | Use "best", "cheapest", "top-rated", prices, discounts |
| Overview (long description, para 1) | 60–100 words | What the store sells, in your own words, based on its site | Paste the store's own text |
| Who it suits | 40–80 words | The kind of shopper or need it fits, based on the range you saw | Make quality claims you haven't tested |
| What we checked | 3–6 bullets | Concrete things you verified, each with a date, e.g. "Checkout page uses HTTPS (checked {date})" | List things you didn't check |
| Shipping & returns | 1–3 sentences | Only what the policy page states; link the policy URL; show "Last checked {date}" | Guess delivery times or return windows |
| Editor's note | 1–3 sentences | Any caveat a shopper should know | Invent complaints or praise |
| Disclosure line | fixed | "We may earn a commission if you buy through our link, at no extra cost to you." | Hide or shrink it |

**Minimum for indexing:** ≥ 150 words of your own text across Overview + Who it suits + What we checked (adjustable in the gate, §8.4).

### 5.5 Worked skeleton (fill with real, verified details)

```
H1:  {Store Name}
Short: {Store Name} is an online store selling {what it sells}. {Ships to {region} — only if verified}.

## Overview
{2–4 sentences in your own words about the product range, based on the store's site.}

## Who it suits
{2–3 sentences.}

## What we checked
- {Fact} — checked {YYYY-MM-DD}
- {Fact} — checked {YYYY-MM-DD}

## Shipping and returns
{Policy summary in your words.} Source: {policy URL}. Last checked {YYYY-MM-DD}.

## Visit {Store Name}
[Visit {Store Name}] (affiliate link) — We may earn a commission if you buy through our link, at no extra cost to you.
```

### 5.6 Using Google data to improve content
- **Search Console → Search Analytics** (weekly): list `query` per `page`. If a page shows impressions for "{store} shipping to {country}", add a verified shipping section answering exactly that.
- **Knowledge Graph:** if it returns a description, show it only as a labelled suggestion with its source/licence; it never replaces your writing.
- **PageSpeed:** fix real issues (large images, layout shift) on your own templates.

### 5.8 Editor safeguards (enforced in the admin panel)
- Unconfirmed facts show a "Needs review" badge and are **hidden from the public page**.
- Publish is blocked if the short description contains price/discount/superlative patterns (`%`, `$`, "cheapest", "best price", "guaranteed", "free shipping" without a confirmed source). Show a warning; admin can override with a note.
- Warn if the long description is > 80% similar to the fetched `og:description`/meta description.

---

## 6. Architecture (Firebase)

### 6.1 Folder layout

```
/app
  (marketing)/page.tsx                    home
  (public)/stores/page.tsx                directory (paginated)
  (public)/stores/[slug]/page.tsx         store page (SSR)
  (public)/categories/[slug]/page.tsx     category page (human intro + list)
  (public)/{about,how-we-choose-stores,affiliate-disclosure,privacy,contact}/page.tsx
  go/[slug]/route.ts                      outbound redirect + counter
  admin/                                  noindex, requires session cookie
    login/  page.tsx (stores list)  stores/new  stores/[id]  categories  seo  settings
  api/admin/session/route.ts              exchange ID token -> session cookie
  sitemap.ts  robots.ts  not-found.tsx  error.tsx
/lib
  firebase/admin.ts  firebase/client.ts (auth only)
  auth/requireAdmin.ts
  security/{ssrf,fetch-safe,robots}.ts
  metadata/{extract,sanitize}.ts
  seo/{templates,jsonld,checks,indexability}.ts
  google/{kg,webrisk,psi,gsc}.ts   indexnow.ts   rate-limit.ts
/firestore.rules  /firestore.indexes.json  /scripts/set-admin.ts
/tests/{unit,e2e}
```

### 6.2 Firestore data model

**Rule of separation:** the affiliate URL lives in a different collection from the public store document, so it is never included in data sent to the browser.

```ts
// stores/{slug}   — document ID = slug (guarantees uniqueness)
type Store = {
  name: string;
  canonicalUrl: string;          // the store's real website (https)
  shortDescription: string;
  overview: string;              // human text
  whoItSuits: string;
  checks: { text: string; checkedOn: string }[];   // "What we checked"
  shippingReturns?: { text: string; policyUrl: string; checkedOn: string }; // only if confirmed
  editorNote?: string;
  countryCode?: string;          // only if confirmed
  categoryIds: string[];
  logoUrl?: string; logoAlt?: string; ogImageUrl?: string;
  seoTitle: string; seoDescription: string;
  primaryKeyword?: string;
  status: 'draft' | 'published' | 'archived';
  indexable: boolean;            // computed by the quality gate, never edited by hand
  gateFailures: string[];        // why it isn't indexable
  provenance: Record<string, { source: 'OWNER_SITE'|'GOOGLE_KG'|'GOOGLE_PLACES'|'WIKIDATA'|'USER'|'TEMPLATE';
                               state: 'needs_review'|'confirmed'; sourceUrl?: string; licence?: string }>;
  safety: { webRiskOk: boolean; checkedAt: string };
  publishedAt?: string; createdAt: string; updatedAt: string; lastReviewedOn?: string;
};

// storesPrivate/{slug}   — NEVER sent to the client
type StorePrivate = { affiliateUrl: string; network?: string; notes?: string; updatedAt: string };

// categories/{slug}
type Category = { name: string; intro: string /* human text */; order: number };

// redirects/{oldSlug}
type Redirect = { toSlug: string; createdAt: string };

// clickCounts/{slug_YYYYMMDD}   — daily counters, no personal data
type ClickCount = { slug: string; day: string; count: number };

// fetchLogs/{autoId}  — no secrets, hosts only
type FetchLog = { host: string; ok: boolean; reason?: string; robotsAllowed?: boolean; at: string };

// settings/site
type Settings = { siteName: string; siteUrl: string; minWords: number /* default 150 */ };
```

**Slug change:** run a transaction: create new `stores/{new}` and `storesPrivate/{new}`, write `redirects/{old}`, delete old docs. Reject if `{new}` exists.

### 6.3 Security rules (`firestore.rules`)
All access goes through the Admin SDK on the server, which bypasses rules. Lock the client out completely:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

### 6.4 Admin authentication flow
1. `/admin/login`: client SDK signs in (email+password or Google). Enable MFA if you can ⚠️ check current Firebase MFA availability.
2. Client sends the **ID token** to `POST /api/admin/session`.
3. Server: `verifyIdToken(token)` → require `claims.admin === true` **and** email in `ADMIN_EMAILS` → `createSessionCookie(token, { expiresIn: 5 days })` → set cookie `httpOnly; secure; sameSite=strict; path=/`.
4. Every admin page/action calls `requireAdmin()` → `verifySessionCookie(cookie, true)` (checks revocation).
5. Grant the claim once with a script: `setCustomUserClaims(uid, { admin: true })` (`scripts/set-admin.ts`).
6. Use the Node.js runtime for anything importing `firebase-admin` (not Edge).
7. All mutations are Server Actions/route handlers: Zod-validate, `requireAdmin()`, same-origin check, rate-limit.

### 6.5 Caching and costs
- Spark gives **50,000 reads and 20,000 writes per day** ✅; reads beyond the free allowance on Blaze are billed ✅. Index-entry reads can count too ✅.
- Cache public store/category/directory data with Next.js caching and **revalidate on admin writes** (use tags or paths; check the Next 16 caching docs for the exact API ⚠️).
- Click counting: one `FieldValue.increment(1)` write per click on `clickCounts/{slug_day}`. For very high traffic, shard counters (not needed at launch).
- Directory search: for a small catalogue, fetch the published list (cached) and filter on the server. Add Typesense/Algolia only if the catalogue grows large.

### 6.6 Composite indexes (`firestore.indexes.json`)
- `stores`: `status ASC, indexable ASC, updatedAt DESC` (sitemap)
- `stores`: `status ASC, categoryIds ARRAY_CONTAINS, name ASC` (category pages)
- `stores`: `status ASC, publishedAt DESC` (directory/new)

---

## 7. Admin panel spec

| Screen | Contents |
|---|---|
| **Stores list** | Table: name, status badge, SEO badge (gate pass/fail), categories, last reviewed. Search, filter by status/category, bulk archive. Empty/loading/error states |
| **Add store** | Name, website URL, affiliate URL. Validation + normalisation. **Suggest from website** button (optional) |
| **Edit store** | Left: editable fields with source badge + "needs review/confirmed" toggle per fact. Right: SEO preview (Google snippet + social card), indexability checklist, Web Risk status, character counters |
| **Categories** | Name, slug, human-written intro (required to be shown in sitemap) |
| **SEO** | Site-wide checks (duplicate titles/slugs, missing alt, broken images, thin pages), Search Console queries per page, URL Inspection results, IndexNow ping log |
| **Settings** | Site name/URL, min-words threshold, API key status (present/missing only, never show keys) |

Affiliate URL field behaviour: validated (https, no credentials), query string preserved, host shown in the UI, **never fetched**, never logged in full.

---

## 8. SEO specification

### 8.1 Site-wide metadata defaults
- `metadataBase = https://{yourdomain}`; `<html lang="en">`; viewport; theme-color `#0A0A0A`.
- Title template: `%s | Discountly`; default title: `Discountly: Online store directory`.
- Open Graph: `type: website`, `siteName`, `locale`, default image (your own 1200×630 grayscale card with the site name).
- Twitter: `summary_large_image`.
- **Do not add the `keywords` meta tag.** Google has said for years that it ignores it; it only reveals your targets to competitors.
- Icons: favicon, Apple touch icon, manifest.

### 8.2 Page-type templates (deterministic, editable)

| Page | Title (≈50–60 chars) | Meta description (≈120–160 chars) | H1 |
|---|---|---|---|
| Home | `Discountly: Online store directory` | "Browse online stores by category. Each listing links to the official store and discloses our affiliate relationship." | Home H1 (§1.3) |
| Directory | `All online stores` (+ ` – page {n}` for n>1) | "Browse every store in our directory, with categories and details we have checked." | "All online stores" |
| Category | `{Category} online stores` | First sentence of the human intro, trimmed | "{Category} online stores" |
| Store | `{Store}: store details & official link` | `shortDescription` (trimmed to 155) | `{Store}` |
| Static pages | Human-written | Human-written | Human-written |

Notes: Google may rewrite titles/descriptions; that's normal. Keep each unique. Pagination pages get a self-referencing canonical and unique titles.

### 8.3 On-page structure
- One H1 per page; H2s for Overview / Who it suits / What we checked / Shipping and returns.
- Primary keyword appears naturally in: title, H1, first paragraph, one H2, meta description, image alt, slug. Never stuff.
- Images: `next/image`, width/height set, alt like `"{Store} logo"`.
- Breadcrumbs (visible + JSON-LD): Home › Stores › {Category} › {Store}.
- Internal links: store → its categories → related stores (same category) → directory.
- External links: affiliate button via `/go/{slug}` with `rel="sponsored nofollow noopener noreferrer"` ✅ (Google asks that affiliate links be qualified with `sponsored`). Plain, non-affiliate mention of the store's own site (if shown) uses `rel="nofollow noopener noreferrer"`.
- Affiliate disclosure visible above or beside the first affiliate button, plus the footer.

### 8.4 Indexability quality gate
`indexable` is computed on every save by `lib/seo/indexability.ts`. A store is indexable only if **all** pass:

1. `status = 'published'`
2. ≥ `minWords` (default 150) words of human text (`USER`) across overview + whoItSuits + checks
3. Not near-duplicate of the fetched merchant description
4. ≥ 1 category assigned
5. At least one confirmed fact with a source URL and date
6. Logo/image valid (https, reachable) with alt text
7. `safety.webRiskOk = true`
8. Unique `seoTitle` and `seoDescription`
9. `lastReviewedOn` within the last 12 months (re-review reminder)

If it fails: the page still renders (if published) but with `robots: noindex, follow`, is omitted from `sitemap.xml`, and the admin shows `gateFailures`.

### 8.5 Robots, sitemap, redirects
- `app/robots.ts`: allow `/`; disallow `/admin`, `/api`, `/go/`; `sitemap: https://{domain}/sitemap.xml`.
- `app/sitemap.ts`: home, static pages, directory pages, categories (with a human intro and ≥ 1 indexable store), and stores where `published && indexable`; `lastModified = updatedAt`. Split into multiple sitemaps beyond 50,000 URLs (not needed at launch).
- `/stores/{oldSlug}` → lookup `redirects/{oldSlug}` → **301** to the new URL.
- `/go/*` responses: `X-Robots-Tag: noindex`, 302 (or 307) redirect, `Cache-Control: no-store`.
- Admin and `/go` are `noindex`; also add `X-Robots-Tag` header on `/admin`.

### 8.6 Structured data (only what the page really shows)
- Sitewide: `Organization` (your brand) and `WebSite`.
- Directory/category: `BreadcrumbList` + `ItemList` of the stores shown.
- Store page: `BreadcrumbList` + `WebPage`; `Organization` describing the store only with confirmed facts (`name`, `url` = store's website, `logo`).
- **Never** emit `Review`, `AggregateRating`, `Offer`, price, `Product`, or FAQ markup unless that content is genuinely on the page and real. Validate with a Zod schema in tests and Google's Rich Results Test manually.

### 8.7 Admin SEO checks (run on save and nightly)
Missing/short/long title or description · duplicate title/description/slug · missing alt · broken/non-HTTPS image · affiliate URL missing or identical to the canonical URL · disclosure not rendered · thin content (gate) · stale review date · orphan page (no internal links) · slug in sitemap but `noindex` (mismatch).

### 8.8 Post-launch Google routine
1. Verify a **Domain property** in Search Console; submit the sitemap.
2. Weekly: Search Analytics export (`query`, `page`, `country`) into the admin SEO screen; update content using real queries.
3. URL Inspection API on new store pages (2,000/day ✅).
4. IndexNow ping on publish/update.
5. Monthly: PageSpeed on one page per template; optional `beyondseo` crawl of the live site.

---

## 9. Keyword plan (hypotheses to validate, not facts)

I can't give you search volumes, and "ranking keywords" are only known after Google shows your pages. Method:

1. **Before launch:** write one primary keyword per page type using the patterns below; check them by hand in Google's search box (manual typing is fine) and, if you have a Google Ads account, in Keyword Planner ⚠️ (access rules not verified).
2. **After launch:** replace guesses with real queries from Search Console.

| Page type | Pattern | Example (replace) |
|---|---|---|
| Home | `{niche} online stores` | "online stores directory" |
| Category | `{category} online stores [in {country}]` | "{category} online stores in {country}" |
| Store | `{store name}` + verified intent words | "{store name} shipping policy" (only if you confirmed and cite it) |
| Guide (later) | question the store page can't answer | "how to check an online store is legitimate" |

Tracking table to fill in the admin SEO screen: `page | primary keyword | impressions | clicks | avg position | action`.

Realistic expectation: a new domain usually takes **months** to earn traffic; competitive "deals/coupon" terms are dominated by established sites. Prefer specific niches and regions, and add pages slowly with real content.

---

## 10. Secure metadata fetching (SSRF defence)

Runs server-side inside the "Suggest from website" action.

**URL rules:** `https` only; no credentials in URL; lowercase host; punycode IDN; strip fragment; strip tracking params (`utm_*`, `gclid`, `fbclid`) from the *canonical* URL; the affiliate URL is validated but **not fetched**.

**Pipeline:**
```
validate → rate-limit (admin + per host) → DNS resolve (A + AAAA)
→ block if ANY resolved address is in a blocked range
→ connect to the pinned IP (SNI/Host = original name; prevents DNS rebinding)
→ fetch /robots.txt (size-capped); if our bot is disallowed → stop, log robotsAllowed=false
→ GET page: 8s timeout, 2 MB cap, ≤ 3 redirects
    on each redirect: re-validate scheme, re-resolve DNS, re-check ranges, re-check robots
→ accept text/html or application/xhtml+xml only
→ parse statically (cheerio/parse5); never execute scripts
→ extract, sanitise (strip tags/control chars, cap lengths), validate image URLs
→ save as suggestions with source OWNER_SITE and state needs_review
```
**Blocked:** `0.0.0.0/8`, `10/8`, `100.64/10`, `127/8`, `169.254/16` (incl. `169.254.169.254`), `172.16/12`, `192.0.0/24`, `192.168/16`, `198.18/15`, `224/4`, `240/4`, `::1`, `fc00::/7`, `fe80::/10`, IPv4-mapped IPv6 (unwrap and re-check), `localhost`, `*.local`, `*.internal`, `metadata.google.internal`.
**Also:** bot User-Agent with contact URL; no cookies; no CAPTCHA/anti-bot bypass (fail gracefully → manual entry); cache results 24h per host; never log secrets, full affiliate URLs, or raw IPs.

---

## 11. Environment variables (`.env.example`)

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Firebase (client — public identifiers, used only for sign-in)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Firebase Admin (server only — never expose)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=          # keep newlines escaped; prefer platform secret storage / ADC on Firebase hosting

ADMIN_EMAILS=you@yourdomain.com   # comma-separated allowlist (in addition to the admin claim)
SESSION_COOKIE_NAME=__admin_session

# Google APIs (restrict each key to its API)
GOOGLE_API_KEY_KG=
GOOGLE_API_KEY_PSI=
GOOGLE_WEBRISK_API_KEY=
GSC_SERVICE_ACCOUNT_JSON=      # add this service account as a user on your Search Console property
GSC_PROPERTY=sc-domain:yourdomain.com
GOOGLE_PLACES_API_KEY=         # optional

# Optional
INDEXNOW_KEY=                  # also host /{key}.txt at the site root
ICONHORSE_ENABLED=true
FETCH_USER_AGENT=DiscountlyBot/1.0 (+https://yourdomain.com/bot)
```

---

## 12. Tests

**Unit (Vitest):** URL normalisation · every SSRF block (127.x, 10.x, 169.254.169.254, `[::1]`, IPv4-mapped IPv6, decimal/octal/hex IPs, localhost, DNS to private IP, **redirect to private IP**, loops, >3 redirects) · size/time limits · content-type allowlist · robots disallow · extractor on fixture HTML incl. hostile markup · provenance rules (no unknown source; facts can't be `confirmed` without a human action) · risky-claim detector · indexability gate · slug transaction & 301 · JSON-LD never emits Review/Offer · `requireAdmin()` rejects missing/expired/non-admin sessions · affiliate URL never present in public props/HTML.

**E2E (Playwright, Firebase emulators):** admin login → add store → suggest (local fixture server) → write content → fail gate (too short) → pass gate → publish → appears in directory and sitemap → click `/go/{slug}` → redirects to affiliate URL, increments counter, link has `rel="sponsored nofollow noopener noreferrer"` → unreachable site → manual entry works → non-admin gets 403 on every admin route.

**CI:** `lint`, `tsc --noEmit`, `vitest run`, `playwright test` (with `firebase emulators:exec`).

---

## 13. Build order

1. Scaffold Next.js 16 + Tailwind + shadcn/ui; commit lockfile.
2. Firebase project, Admin SDK, emulators, rules, indexes, `set-admin` script.
3. Admin session flow (`requireAdmin`) + tests.
4. `lib/security/*` with the full test matrix before any UI uses it.
5. Admin screens: list, add, edit (with provenance badges, SEO preview, gate checklist).
6. Public pages: home, directory, category, store, static pages, `/go/[slug]`.
7. SEO layer: metadata templates, sitemap, robots, JSON-LD, redirects, gate, admin checks.
8. Google integrations (KG, Web Risk, PSI, GSC) behind flags; each degrades gracefully without a key.
9. Theme polish + accessibility pass.
10. README (setup, env, emulators, deploy, tests) and **sample seed data clearly labelled "SAMPLE"** (use `example.com`-style hosts, never real stores).

**Deploy:** Firebase App Hosting (Blaze plan ✅) or Vercel; set secrets in the platform; deploy rules/indexes with `firebase deploy --only firestore`; add a scheduled job for nightly SEO checks.

---

## 14. Launch plan

| When | Action |
|---|---|
| Day 0 | Domain + HTTPS, deploy, Search Console + Bing Webmaster verification, write About / How we choose / Disclosure / Privacy / Contact |
| Week 1 | 15–30 stores, each with original text and verified facts; 3–5 category intros |
| Week 2 | Submit sitemap; inspect URLs; fix gate failures |
| Weeks 3–6 | Read Search Console; for "Crawled – currently not indexed" pages, improve the content instead of adding pages |
| Month 2+ | Add guides only where you have real expertise; earn links by being useful, not by paying for or swapping links |

---

## 15. Final checklist and limitations

**Done when:**
- [ ] Admin-only login with claim + allowlist; client Firestore access fully denied
- [ ] Affiliate URLs stored privately and used only by `/go/[slug]`
- [ ] No AI text anywhere; provenance on every field
- [ ] Quality gate keeps thin pages out of Google and the sitemap
- [ ] Sitemap, robots, canonical, OG/Twitter, JSON-LD, 301s, disclosure, `rel="sponsored"`
- [ ] SSRF tests pass; Web Risk check on publish
- [ ] Search Console, PageSpeed, Knowledge Graph integrations working or cleanly disabled
- [ ] Lint, type check, unit and E2E tests green; README complete

**Limitations to keep in mind:**
- Rankings can't be guaranteed.
- Knowledge Graph returns data only for well-known entities; Places covers physical locations only.
- The official Google Trends API is invite-only; keyword volumes need Google Ads access or a third-party tool.
- Safe Browsing is non-commercial; Web Risk pricing needs checking ⚠️.
- Some stores block bots; use manual entry.
- Re-read each API's terms (caching, attribution) before storing its data.

---

## 16. Sources checked (1 Oct 2026)

- public-apis: https://github.com/public-apis/public-apis · beyondseo: https://github.com/beyondtahir/beyondseo
- Next.js: https://nextjs.org
- Firebase pricing/quotas and App Hosting (Blaze): https://firebase.google.com/pricing · https://firebase.google.com/docs/app-hosting
- Knowledge Graph limits: https://developers.google.com/knowledge-graph/reference/rest/v1/usage-limits
- Safe Browsing (non-commercial) / Web Risk: https://developers.google.com/safe-browsing/v4/usage-limits
- Search Console limits / URL Inspection API: https://developers.google.com/webmaster-tools/limits · https://developers.google.com/search/blog/2022/01/url-inspection-api
- Custom Search JSON API closure: https://developers.google.com/custom-search/v1/overview
- Google Trends API alpha: https://developers.google.com/search/apis/trends
- Places API billing: https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
- Clearbit Logo sunset: https://developers.hubspot.com/changelog/upcoming-sunset-of-clearbits-free-logo-api
- Icon Horse: https://icon.horse · MDN HTTP Observatory: https://developer.mozilla.org/en-US/observatory/docs/faq
- Google spam policies (thin affiliation, scaled content, link qualification): https://developers.google.com/search/docs/essentials/spam-policies
