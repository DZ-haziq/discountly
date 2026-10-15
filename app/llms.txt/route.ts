import { listStores, listCategories } from '@/lib/firebase/db';
import { SITE_BASE_URL, SITE_NAME } from '@/lib/seo/templates';
import { isEligibleForPublicListing } from '@/lib/eligibility';

export const revalidate = 300;

export async function GET() {
  let stores: Awaited<ReturnType<typeof listStores>> = [];
  let categories: Awaited<ReturnType<typeof listCategories>> = [];

  try {
    [stores, categories] = await Promise.all([
      listStores({ status: 'published' }),
      listCategories(),
    ]);
  } catch (err) {
    console.error('[llms.txt] Error fetching data:', err);
  }

  const eligibleStores = stores.filter(isEligibleForPublicListing);
  const eligibleCategories = categories.filter(cat =>
    eligibleStores.some(s => Array.isArray(s.categoryIds) && s.categoryIds.includes(cat.id))
  );

  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_NAME} is an independent directory of online stores with verified merchant facts, direct coupons, and transparent affiliate disclosures.`,
    `> Notice: This file (/llms.txt) is an optional summary for large language models and search agents. Its presence is voluntary and has no guaranteed effect on indexing, crawling, or ranking.`,
    '',
    '## Main Pages',
    `- Home: ${SITE_BASE_URL}`,
    `- All Stores: ${SITE_BASE_URL}/stores`,
    `- Categories: ${SITE_BASE_URL}/categories`,
    `- About: ${SITE_BASE_URL}/about`,
    `- Editorial Policy: ${SITE_BASE_URL}/how-we-choose-stores`,
    `- Affiliate Disclosure: ${SITE_BASE_URL}/affiliate-disclosure`,
    '',
    '## Categories',
  ];

  for (const cat of eligibleCategories) {
    lines.push(`- ${cat.name}: ${SITE_BASE_URL}/categories/${cat.id}`);
  }

  lines.push('', '## Stores');
  for (const store of eligibleStores) {
    const desc = store.shortDescription ? ` — ${store.shortDescription}` : '';
    lines.push(`- ${store.name}: ${SITE_BASE_URL}/stores/${store.slug}${desc}`);
  }

  lines.push('');

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    },
  });
}
