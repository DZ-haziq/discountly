import { MetadataRoute } from 'next';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*', '/api/*', '/go/*']
    },
    sitemap: `${SITE_BASE_URL}/sitemap.xml`
  };
}
