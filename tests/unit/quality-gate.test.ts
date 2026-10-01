import { describe, it, expect } from 'vitest';
import { evaluateIndexabilityGate } from '../../lib/seo/indexability';
import { Store } from '../../lib/types';

describe('SEO Indexability Quality Gate', () => {
  const validStore: Partial<Store> = {
    name: 'Sample Store',
    slug: 'sample-store',
    status: 'published',
    categoryIds: ['electronics-and-tech'],
    shortDescription: 'Official online retailer for consumer electronics and precision hardware.',
    overview: 'This store offers a comprehensive selection of premium electronics, computer components, and mobile accessories. Every product is sourced directly through certified distribution channels with complete warranty coverage and verified returns.',
    whoItSuits: 'Engineered specifically for hardware enthusiasts, system builders, and remote professionals seeking high reliability and direct support.',
    checks: [
      { text: 'Full 2-year manufacturer warranty on all items', checkedOn: '2026-09-01' },
      { text: '30-day money-back guarantee with tracked shipping', checkedOn: '2026-09-01' }
    ],
    shippingReturns: {
      text: 'Domestic ground shipping takes 3-5 business days. 30-day returns on unopened items.',
      policyUrl: 'https://sample.com/returns',
      checkedOn: '2026-09-01'
    },
    logoUrl: 'https://sample.com/logo.png',
    logoAlt: 'Sample Store Logo',
    seoTitle: 'Sample Store: Verified Details & Official Website',
    seoDescription: 'Explore verified facts, return policies, and warranty details for Sample Store before visiting.',
    safety: { webRiskOk: true, checkedAt: '2026-09-01T00:00:00Z' },
    lastReviewedOn: '2026-09-01'
  };

  it('passes a fully compliant store', () => {
    const result = evaluateIndexabilityGate(validStore, undefined, 50);
    expect(result.indexable).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('fails if status is not published', () => {
    const draftStore = { ...validStore, status: 'draft' as const };
    const result = evaluateIndexabilityGate(draftStore, undefined, 50);
    expect(result.indexable).toBe(false);
    expect(result.failures.some(f => f.includes('not set to "published"'))).toBe(true);
  });

  it('fails if human word count is below threshold', () => {
    const thinStore = {
      ...validStore,
      overview: 'Very short overview.',
      whoItSuits: 'Everyone.',
      checks: []
    };
    const result = evaluateIndexabilityGate(thinStore, undefined, 150);
    expect(result.indexable).toBe(false);
    expect(result.failures.some(f => f.includes('Insufficient human-written content'))).toBe(true);
  });

  it('blocks superlative or pricing claim spam in short description', () => {
    const spamStore = {
      ...validStore,
      shortDescription: 'We offer the cheapest prices with 50% off guaranteed on all electronics.'
    };
    const result = evaluateIndexabilityGate(spamStore, undefined, 50);
    expect(result.indexable).toBe(false);
    expect(result.failures.some(f => f.includes('forbidden pricing/superlative claim'))).toBe(true);
  });

  it('fails if logo is missing or uses insecure HTTP', () => {
    const insecureLogoStore = {
      ...validStore,
      logoUrl: 'http://sample.com/logo.png'
    };
    const result = evaluateIndexabilityGate(insecureLogoStore, undefined, 50);
    expect(result.indexable).toBe(false);
    expect(result.failures.some(f => f.includes('HTTPS'))).toBe(true);
  });
});
