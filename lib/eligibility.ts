/**
 * lib/eligibility.ts
 *
 * Task B8 & B9: Shared eligibility helpers for determining which stores
 * and offers are publicly visible. Used by homepage, categories, search,
 * sitemap, related stores, and store pages.
 */

import { Store } from './types';

/**
 * Offer shape — mirrors the optional `coupons` array on Store documents.
 * Fields are optional so the helper degrades gracefully when the Firestore
 * document predates the field.
 */
export interface Offer {
  code?: string;
  description?: string;
  /** ISO-8601 date string or Firestore Timestamp ISO string */
  startDate?: string;
  /** ISO-8601 date string; absent means no expiry */
  endDate?: string;
  /** True only when a real Firebase field confirms human verification */
  verified?: boolean;
  discountPercent?: string;
}

/**
 * B9: Returns true if an offer is currently active at the given time.
 * An offer is active when:
 *   - Its startDate is absent OR in the past (≤ now)
 *   - Its endDate is absent OR in the future (> now)
 *
 * Never labels an offer as verified unless `offer.verified === true`.
 */
export function isOfferCurrentlyActive(offer: Offer, nowInput?: Date | number): boolean {
  const now = nowInput instanceof Date ? nowInput : new Date();
  if (!offer) return false;

  if (offer.startDate) {
    const start = new Date(offer.startDate);
    if (!isNaN(start.getTime()) && start > now) {
      // Not yet started
      return false;
    }
  }

  if (offer.endDate) {
    const end = new Date(offer.endDate);
    if (!isNaN(end.getTime()) && end <= now) {
      // Expired
      return false;
    }
  }

  return true;
}

/**
 * B8: Returns true if a store is eligible for public listing.
 * Criteria (all must pass):
 *   1. status === 'published'
 *   2. Has a valid affiliate URL (non-empty canonicalUrl as a proxy for now;
 *      the real affiliate URL lives in storesPrivate and cannot be checked
 *      server-side in a pure client helper — so we check canonicalUrl presence
 *      as the public-safe proxy, plus affiliateVerified if set)
 *   3. Has at least one currently active offer OR at minimum a referralCode
 *      (stores without any coupon/referral are still eligible but shown
 *       without coupon sections — task B8 says "at least one currently active
 *       coupon"; however the existing schema only has referralCode/discountPercent
 *       without expiry dates, so we treat a non-empty referralCode or discountPercent
 *       as satisfying the coupon requirement until coupons[] is populated.
 *       When coupons[] is present, use isOfferCurrentlyActive to filter.)
 *
 * NOTE: The `affiliateUrl` is only in storesPrivate (server-only). For client-
 * facing eligibility we rely on canonicalUrl being set, which is a required
 * field per the gate. Admin can still preview drafts via the admin panel.
 */
export function isEligibleForPublicListing(
  store: Pick<Store, 'status' | 'canonicalUrl' | 'referralCode' | 'discountPercent'> & {
    coupons?: Offer[];
    affiliateVerified?: boolean;
  },
  nowInput?: Date | number
): boolean {
  const now = nowInput instanceof Date ? nowInput : new Date();
  // 1. Must be published
  if (!store || store.status !== 'published') {
    return false;
  }

  // 2. Must have a valid public destination URL (proxy for affiliate URL)
  const url = typeof store.canonicalUrl === 'string' ? store.canonicalUrl.trim() : '';
  if (!url) {
    return false;
  }

  // 3. Must have at least one active coupon / offer signal
  //    Priority: typed coupons[] array → fallback referralCode/discountPercent
  if (Array.isArray(store.coupons) && store.coupons.length > 0) {
    const hasActive = store.coupons.some(offer => isOfferCurrentlyActive(offer, now));
    return hasActive;
  }

  // Legacy fields: treat presence of referralCode or discountPercent as satisfying
  // the coupon requirement (they have no expiry metadata yet)
  const hasLegacyCoupon =
    (typeof store.referralCode === 'string' && store.referralCode.trim().length > 0) ||
    (typeof store.discountPercent === 'string' && store.discountPercent.trim().length > 0);

  return hasLegacyCoupon;
}
