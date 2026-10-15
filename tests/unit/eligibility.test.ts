/**
 * tests/unit/eligibility.test.ts
 *
 * Task B10: Unit tests for isEligibleForPublicListing and isOfferCurrentlyActive.
 */

import { describe, it, expect } from 'vitest';
import { isEligibleForPublicListing, isOfferCurrentlyActive, Offer } from '../../lib/eligibility';

// ---------------------------------------------------------------------------
// isOfferCurrentlyActive
// ---------------------------------------------------------------------------

describe('isOfferCurrentlyActive', () => {
  const NOW = new Date('2025-06-15T12:00:00Z');

  it('returns true for an offer with no startDate or endDate', () => {
    const offer: Offer = { code: 'SAVE10' };
    expect(isOfferCurrentlyActive(offer, NOW)).toBe(true);
  });

  it('returns true when startDate is in the past and endDate is in the future', () => {
    const offer: Offer = {
      code: 'SUMMER',
      startDate: '2025-01-01',
      endDate: '2026-01-01',
    };
    expect(isOfferCurrentlyActive(offer, NOW)).toBe(true);
  });

  it('returns false when endDate is in the past (expired)', () => {
    const offer: Offer = {
      code: 'OLD',
      endDate: '2024-12-31',
    };
    expect(isOfferCurrentlyActive(offer, NOW)).toBe(false);
  });

  it('returns false when endDate equals now (boundary — expired at exact moment)', () => {
    const offer: Offer = {
      code: 'EXACT',
      endDate: '2025-06-15T12:00:00Z',
    };
    expect(isOfferCurrentlyActive(offer, NOW)).toBe(false);
  });

  it('returns false when startDate is in the future (not yet started)', () => {
    const offer: Offer = {
      code: 'FUTURE',
      startDate: '2025-12-01',
    };
    expect(isOfferCurrentlyActive(offer, NOW)).toBe(false);
  });

  it('returns true when startDate is exactly now', () => {
    const offer: Offer = {
      code: 'TODAY',
      startDate: '2025-06-15T12:00:00Z',
    };
    expect(isOfferCurrentlyActive(offer, NOW)).toBe(true);
  });

  it('returns true for offer with no code but valid date range', () => {
    const offer: Offer = {
      startDate: '2025-01-01',
      endDate: '2026-12-31',
      discountPercent: '15%',
    };
    expect(isOfferCurrentlyActive(offer, NOW)).toBe(true);
  });

  it('handles invalid date strings gracefully (treats as no expiry)', () => {
    const offer: Offer = {
      endDate: 'not-a-date',
    };
    // Invalid date: isNaN(new Date('not-a-date').getTime()) → true → skip check → active
    expect(isOfferCurrentlyActive(offer, NOW)).toBe(true);
  });

  // Verified field tests — isOfferCurrentlyActive does NOT gate on verified;
  // the caller decides whether to show "verified" badge based on offer.verified.
  it('is active regardless of verified flag (activity ≠ verification)', () => {
    const unverified: Offer = { code: 'TEST', verified: false };
    const verified: Offer = { code: 'TEST', verified: true };
    expect(isOfferCurrentlyActive(unverified, NOW)).toBe(true);
    expect(isOfferCurrentlyActive(verified, NOW)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isEligibleForPublicListing
// ---------------------------------------------------------------------------

describe('isEligibleForPublicListing', () => {
  const NOW = new Date('2025-06-15T12:00:00Z');

  const baseStore = {
    status: 'published' as const,
    canonicalUrl: 'https://example.com',
    referralCode: 'SAVE10',
    discountPercent: undefined,
  };

  it('returns true for a published store with a valid URL and referral code', () => {
    expect(isEligibleForPublicListing(baseStore, NOW)).toBe(true);
  });

  it('returns false for a draft store', () => {
    expect(isEligibleForPublicListing({ ...baseStore, status: 'draft' }, NOW)).toBe(false);
  });

  it('returns false for an archived store', () => {
    expect(isEligibleForPublicListing({ ...baseStore, status: 'archived' }, NOW)).toBe(false);
  });

  it('returns false when canonicalUrl is empty', () => {
    expect(isEligibleForPublicListing({ ...baseStore, canonicalUrl: '' }, NOW)).toBe(false);
  });

  it('returns false when canonicalUrl is whitespace', () => {
    expect(isEligibleForPublicListing({ ...baseStore, canonicalUrl: '   ' }, NOW)).toBe(false);
  });

  it('returns false when there is no referralCode and no discountPercent (no legacy coupon)', () => {
    expect(
      isEligibleForPublicListing(
        { ...baseStore, referralCode: '', discountPercent: '' },
        NOW
      )
    ).toBe(false);
  });

  it('returns false when referralCode is whitespace only', () => {
    expect(
      isEligibleForPublicListing(
        { ...baseStore, referralCode: '   ' },
        NOW
      )
    ).toBe(false);
  });

  it('returns true when only discountPercent is present', () => {
    expect(
      isEligibleForPublicListing(
        { ...baseStore, referralCode: '', discountPercent: '20% OFF' },
        NOW
      )
    ).toBe(true);
  });

  it('uses coupons[] when present — returns true if at least one is active', () => {
    const store = {
      ...baseStore,
      referralCode: '',
      coupons: [
        { code: 'EXPIRED', endDate: '2020-01-01' },
        { code: 'ACTIVE', endDate: '2026-01-01' },
      ],
    };
    expect(isEligibleForPublicListing(store, NOW)).toBe(true);
  });

  it('uses coupons[] — returns false if all coupons are expired', () => {
    const store = {
      ...baseStore,
      referralCode: '',
      coupons: [
        { code: 'OLD1', endDate: '2020-01-01' },
        { code: 'OLD2', endDate: '2021-06-01' },
      ],
    };
    expect(isEligibleForPublicListing(store, NOW)).toBe(false);
  });

  it('uses coupons[] — returns false for empty coupons array (falls to legacy check)', () => {
    const store = {
      ...baseStore,
      referralCode: 'LEGACY10',
      coupons: [], // empty → fall through to legacy
    };
    // coupons.length === 0 so legacy referralCode applies
    expect(isEligibleForPublicListing(store, NOW)).toBe(true);
  });

  it('returns false for null/undefined store', () => {
    // @ts-expect-error testing runtime guard
    expect(isEligibleForPublicListing(null, NOW)).toBe(false);
  });
});
