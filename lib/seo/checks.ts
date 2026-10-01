import { Store, Category } from '../types';

export interface SeoIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  storeSlug?: string;
}

/**
 * Runs comprehensive site-wide SEO audit checks
 */
export function runSiteSeoAudit(stores: Store[], categories: Category[]): SeoIssue[] {
  const issues: SeoIssue[] = [];

  const titleMap = new Map<string, string[]>();
  const slugSet = new Set<string>();

  for (const store of stores) {
    // 1. Duplicate slug check
    if (slugSet.has(store.slug)) {
      issues.push({
        id: `duplicate-slug-${store.slug}`,
        type: 'error',
        title: `Duplicate slug detected: "${store.slug}"`,
        description: 'Two or more stores share the exact same URL slug.',
        storeSlug: store.slug
      });
    }
    slugSet.add(store.slug);

    // 2. Duplicate SEO Title check
    const titleKey = (store.seoTitle || '').trim().toLowerCase();
    if (titleKey) {
      const existing = titleMap.get(titleKey) || [];
      existing.push(store.slug);
      titleMap.set(titleKey, existing);
    }

    // 3. Missing or thin meta description
    if (!store.seoDescription || store.seoDescription.length < 50) {
      issues.push({
        id: `short-desc-${store.slug}`,
        type: 'warning',
        title: `Short or missing meta description on "${store.name}"`,
        description: `Description length is only ${store.seoDescription?.length || 0} characters (ideal: 120-160).`,
        storeSlug: store.slug
      });
    }

    // 4. Missing Logo Alt text
    if (!store.logoAlt) {
      issues.push({
        id: `missing-alt-${store.slug}`,
        type: 'warning',
        title: `Missing logo alt text on "${store.name}"`,
        description: 'Accessibility and image SEO requires descriptive alt text for store logo.',
        storeSlug: store.slug
      });
    }

    // 5. Indexability gate failure while marked as published
    if (store.status === 'published' && !store.indexable) {
      issues.push({
        id: `gate-failure-${store.slug}`,
        type: 'info',
        title: `Published page "${store.name}" is marked noindex`,
        description: `Failed quality gate: ${store.gateFailures.join('; ')}`,
        storeSlug: store.slug
      });
    }

    // 6. Stale review date (> 12 months)
    if (store.lastReviewedOn) {
      const reviewDate = new Date(store.lastReviewedOn);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (reviewDate < oneYearAgo) {
        issues.push({
          id: `stale-review-${store.slug}`,
          type: 'warning',
          title: `Verification overdue for "${store.name}"`,
          description: `Last checked on ${store.lastReviewedOn}. Re-check store details annually.`,
          storeSlug: store.slug
        });
      }
    }
  }

  // Record duplicate title issues
  for (const [title, slugs] of titleMap.entries()) {
    if (slugs.length > 1) {
      issues.push({
        id: `dup-title-${slugs.join('-')}`,
        type: 'warning',
        title: `Duplicate SEO Title detected: "${title}"`,
        description: `Shared by stores: ${slugs.join(', ')}`
      });
    }
  }

  // Category intros check
  for (const category of categories) {
    if (!category.intro || category.intro.trim().length < 30) {
      issues.push({
        id: `category-thin-${category.id}`,
        type: 'warning',
        title: `Category "${category.name}" has thin human intro`,
        description: 'Category pages require a descriptive human-written introduction for indexing.'
      });
    }
  }

  return issues;
}
