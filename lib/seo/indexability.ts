import { Store } from '../types';
import { countWords } from '../utils';

export interface GateEvaluationResult {
  indexable: boolean;
  failures: string[];
  wordCount: number;
  unconfirmedCount: number;
}

/**
 * Calculates string similarity using Jaccard index on word sets
 */
function calculateWordOverlap(textA: string, textB: string): number {
  if (!textA || !textB) return 0;

  const wordsA = new Set(
    textA
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
  );

  const wordsB = new Set(
    textB
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
  );

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Evaluates the 9-point SEO Indexability Quality Gate for a store
 */
export function evaluateIndexabilityGate(
  store: Partial<Store>,
  fetchedMerchantDescription?: string,
  minWords = 150
): GateEvaluationResult {
  const failures: string[] = [];

  // 1. Status must be 'published'
  if (store.status !== 'published') {
    failures.push('Store is not set to "published" status.');
  }

  // 2. Minimum human word count across Overview + Who it suits + Checks
  const overview = store.overview || '';
  const whoItSuits = store.whoItSuits || '';
  const checksText = (store.checks || []).map(c => c.text).join(' ');
  const totalHumanText = `${overview} ${whoItSuits} ${checksText}`.trim();
  const wordCount = countWords(totalHumanText);

  if (wordCount < minWords) {
    failures.push(
      `Insufficient human-written content: contains ${wordCount} words (minimum is ${minWords} words across Overview, Who it suits, and Checks).`
    );
  }

  // 3. Near-duplicate of merchant text check (< 80% overlap)
  if (fetchedMerchantDescription && overview) {
    const similarity = calculateWordOverlap(overview, fetchedMerchantDescription);
    if (similarity > 0.8) {
      failures.push(
        `Overview is too similar to the store's fetched meta description (${Math.round(similarity * 100)}% similarity). Please rewrite in original words.`
      );
    }
  }

  // 4. At least one category assigned
  if (!store.categoryIds || store.categoryIds.length === 0) {
    failures.push('At least 1 category must be selected.');
  }

  // 5. At least one confirmed fact with checked date
  const checks = store.checks || [];
  const hasValidCheck = checks.some(c => c.text && c.text.trim().length > 5 && c.checkedOn);
  const shippingConfirmed = store.shippingReturns && store.shippingReturns.text && store.shippingReturns.policyUrl;

  if (!hasValidCheck && !shippingConfirmed) {
    failures.push('At least one verified fact or shipping policy with date and source is required.');
  }

  // Count unconfirmed provenance entries
  let unconfirmedCount = 0;
  if (store.provenance) {
    for (const key of Object.keys(store.provenance)) {
      if (store.provenance[key]?.state === 'needs_review') {
        unconfirmedCount++;
      }
    }
  }

  // 6. Valid logo URL and alt text
  if (!store.logoUrl) {
    failures.push('Logo URL is missing.');
  } else if (!store.logoUrl.startsWith('https://')) {
    failures.push('Logo URL must use secure HTTPS protocol.');
  }
  if (!store.logoAlt || store.logoAlt.trim().length === 0) {
    failures.push('Logo alt text is required for accessibility.');
  }

  // 7. Web Risk safety
  if (store.safety && store.safety.webRiskOk === false) {
    failures.push('Domain failed Web Risk security screening.');
  }

  // 8. Unique SEO Title and Description
  if (!store.seoTitle || store.seoTitle.length < 15) {
    failures.push('SEO Title must be at least 15 characters long.');
  }
  if (!store.seoDescription || store.seoDescription.length < 50) {
    failures.push('SEO Meta Description must be at least 50 characters long.');
  }

  // Superlative / price / discount claim check in short description (Section 5.8)
  const shortDesc = store.shortDescription || '';
  const forbiddenPatterns = [
    /\b(cheapest|best price|lowest price|guaranteed low|100% off)\b/i,
    /(\$\d+|\d+%\s*off)/i
  ];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(shortDesc)) {
      failures.push('Short description contains forbidden pricing/superlative claim patterns (%, $, "best price", "cheapest").');
      break;
    }
  }

  // 9. Last reviewed date within the last 12 months
  if (store.lastReviewedOn) {
    const reviewDate = new Date(store.lastReviewedOn);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (reviewDate < oneYearAgo) {
      failures.push('Store information was last reviewed more than 12 months ago; re-verification is due.');
    }
  }

  return {
    indexable: failures.length === 0,
    failures,
    wordCount,
    unconfirmedCount
  };
}
