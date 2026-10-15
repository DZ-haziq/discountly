import { MetadataRoute } from 'next';
import { listStores, listCategories } from '@/lib/firebase/db';
import { SITE_BASE_URL } from '@/lib/seo/templates';
import { isEligibleForPublicListing } from '@/lib/eligibility';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static trust pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${SITE_BASE_URL}/stores`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${SITE_BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${SITE_BASE_URL}/how-we-choose-stores`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${SITE_BASE_URL}/affiliate-disclosure`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${SITE_BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3
    },
    {
      url: `${SITE_BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4
    }
  ];

  try {
    const stores = await listStores({ status: 'published' });
    const categories = await listCategories();

    // Task F20: Store pages — ONLY eligible stores with active coupons and affiliate URL
    const eligibleStores = stores.filter(isEligibleForPublicListing);
    const storeRoutes: MetadataRoute.Sitemap = eligibleStores.map(store => ({
      url: `${SITE_BASE_URL}/stores/${store.slug}`,
      lastModified: new Date(store.updatedAt || store.createdAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8
    }));

    // Task F20 & A2: Categories — ONLY non-empty categories with real lastModified
    const categoryRoutes: MetadataRoute.Sitemap = categories
      .filter(cat => eligibleStores.some(s => Array.isArray(s.categoryIds) && s.categoryIds.includes(cat.id)))
      .map(category => {
        const catStores = eligibleStores.filter(s => Array.isArray(s.categoryIds) && s.categoryIds.includes(category.id));
        const latestDate = catStores.reduce((latest, s) => {
          const d = new Date(s.updatedAt || s.createdAt || 0);
          return d > latest ? d : latest;
        }, new Date(0));

        return {
          url: `${SITE_BASE_URL}/categories/${category.id}`,
          lastModified: latestDate.getTime() > 0 ? latestDate : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7
        };
      });

    return [...staticRoutes, ...categoryRoutes, ...storeRoutes];
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic routes from Firestore during prerender:', err);
    return staticRoutes;
  }
}

