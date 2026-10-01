import { describe, it, expect } from 'vitest';
import { getStorePageJsonLd, getItemListJsonLd } from '../../lib/seo/jsonld';
import { Store, Category } from '../../lib/types';

describe('Structured Data & JSON-LD Compliance', () => {
  const mockStore: Store = {
    name: 'Sample Tech',
    slug: 'sample-tech',
    canonicalUrl: 'https://sampletech.com',
    shortDescription: 'Official store for technical gear and hardware.',
    overview: 'High quality electronics and hardware catalog with warranties.',
    whoItSuits: 'Engineers and tech enthusiasts.',
    checks: [{ text: '2-year warranty', checkedOn: '2026-09-01' }],
    categoryIds: ['electronics-and-tech'],
    logoUrl: 'https://sampletech.com/logo.png',
    logoAlt: 'Sample Tech logo',
    seoTitle: 'Sample Tech: Store Details & Official Link',
    seoDescription: 'Verified store details for Sample Tech.',
    status: 'published',
    indexable: true,
    gateFailures: [],
    provenance: {},
    safety: { webRiskOk: true, checkedAt: '2026-09-01T00:00:00Z' },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z'
  };

  const mockCategory: Category = {
    id: 'electronics-and-tech',
    name: 'Electronics & Tech',
    intro: 'Hand-checked stores for electronics.',
    order: 1
  };

  it('generates compliant WebPage and BreadcrumbList schemas without review or offer spam', () => {
    const schemas = getStorePageJsonLd(mockStore, mockCategory);
    const serialized = JSON.stringify(schemas);

    expect(serialized).toContain('BreadcrumbList');
    expect(serialized).toContain('WebPage');
    expect(serialized).toContain('https://sampletech.com');

    // Strict Anti-Spam Check: Never fabricate Review, AggregateRating, Offer, or fake price schemas
    expect(serialized).not.toContain('"@type":"Review"');
    expect(serialized).not.toContain('"@type":"AggregateRating"');
    expect(serialized).not.toContain('"@type":"Offer"');
    expect(serialized).not.toContain('"@type":"Product"');
  });

  it('generates ItemList schema for directory and category listings', () => {
    const itemList = getItemListJsonLd('Verified Stores', [mockStore]);
    expect(itemList['@type']).toBe('ItemList');
    expect(itemList.numberOfItems).toBe(1);
    expect(itemList.itemListElement[0].name).toBe('Sample Tech');
  });
});
