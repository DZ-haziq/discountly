import { MetadataRoute } from 'next';
import { listStores, listCategories } from '@/lib/firebase/db';
import { SITE_BASE_URL } from '@/lib/seo/templates';

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

    // Store pages (ONLY if published AND indexable according to Quality Gate)
    const indexableStores = stores.filter(s => s.indexable);
    const storeRoutes: MetadataRoute.Sitemap = indexableStores.map(store => ({
      url: `${SITE_BASE_URL}/stores/${store.slug}`,
      lastModified: new Date(store.updatedAt || store.createdAt),
      changeFrequency: 'weekly',
      priority: 0.8
    }));

    // Categories (with human intro and at least 1 indexable store)
    const categoryRoutes: MetadataRoute.Sitemap = categories
      .filter(cat => {
        const hasStores = indexableStores.some(s => s.categoryIds.includes(cat.id));
        return hasStores && cat.intro && cat.intro.length > 20;
      })
      .map(category => ({
        url: `${SITE_BASE_URL}/categories/${category.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7
      }));

    return [...staticRoutes, ...categoryRoutes, ...storeRoutes];
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic routes from Firestore during prerender:', err);
    return staticRoutes;
  }
}

