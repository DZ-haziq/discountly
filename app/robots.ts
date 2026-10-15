import { MetadataRoute } from 'next';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api', '/api/*', '/go', '/go/*']
      },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended'
        ],
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api', '/api/*', '/go', '/go/*']
      }
    ],
    sitemap: `${SITE_BASE_URL}/sitemap.xml`
  };
}
