export type ProvenanceSource = 
  | 'OWNER_SITE' 
  | 'GOOGLE_KG' 
  | 'GOOGLE_PLACES' 
  | 'WIKIDATA' 
  | 'USER' 
  | 'TEMPLATE';

export type ProvenanceState = 'needs_review' | 'confirmed';

export interface ProvenanceEntry {
  source: ProvenanceSource;
  state: ProvenanceState;
  sourceUrl?: string;
  licence?: string;
}

export interface StoreCheck {
  text: string;
  checkedOn: string; // YYYY-MM-DD
}

export interface ShippingReturnsPolicy {
  text: string;
  policyUrl: string;
  checkedOn: string; // YYYY-MM-DD
}

export type StoreStatus = 'draft' | 'published' | 'archived';

export interface Store {
  slug: string;
  name: string;
  canonicalUrl: string;          // the store's real website (https)
  shortDescription: string;      // 110-160 chars
  overview: string;              // human text (60-100 words)
  whoItSuits: string;            // 40-80 words
  checks: StoreCheck[];          // "What we checked"
  shippingReturns?: ShippingReturnsPolicy;
  editorNote?: string;
  countryCode?: string;          // e.g. "US", "UK", "Global"
  categoryIds: string[];
  logoUrl?: string;
  logoAlt?: string;
  ogImageUrl?: string;
  seoTitle: string;
  seoDescription: string;
  primaryKeyword?: string;
  status: StoreStatus;
  indexable: boolean;            // computed by the quality gate, never edited by hand
  gateFailures: string[];        // why it isn't indexable
  provenance: Record<string, ProvenanceEntry>;
  safety: {
    webRiskOk: boolean;
    checkedAt: string;
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastReviewedOn?: string;
}

// StoresPrivate — NEVER sent to the client (stored in storesPrivate/{slug})
export interface StorePrivate {
  slug: string;
  affiliateUrl: string;
  network?: string;
  notes?: string;
  updatedAt: string;
}

// categories/{slug}
export interface Category {
  id: string; // slug
  name: string;
  intro: string; // human text
  order: number;
}

// redirects/{oldSlug}
export interface Redirect {
  oldSlug: string;
  toSlug: string;
  createdAt: string;
}

// clickCounts/{slug_YYYYMMDD}
export interface ClickCount {
  slug: string;
  day: string; // YYYY-MM-DD
  count: number;
}

// fetchLogs/{autoId}
export interface FetchLog {
  id?: string;
  host: string;
  ok: boolean;
  reason?: string;
  robotsAllowed?: boolean;
  at: string;
}

// settings/site
export interface Settings {
  siteName: string;
  siteUrl: string;
  minWords: number; // default 150
  adminEmails: string[];
}

// Extracted Metadata suggestion
export interface ExtractedMetadata {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  favicon?: string;
  canonical?: string;
  hostname: string;
  country?: string;
  rawTextSample?: string;
}

// Google KG suggestion
export interface KnowledgeGraphResult {
  name: string;
  description?: string;
  detailedDescription?: {
    articleBody: string;
    url: string;
    license: string;
  };
  types?: string[];
}
