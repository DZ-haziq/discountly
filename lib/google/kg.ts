import { KnowledgeGraphResult } from '../types';

/**
 * Queries Google Knowledge Graph Search API for entity metadata.
 * Returns suggestion with source GOOGLE_KG and license attribution.
 */
export async function queryKnowledgeGraph(query: string): Promise<KnowledgeGraphResult | null> {
  const apiKey = process.env.GOOGLE_API_KEY_KG;
  if (!apiKey) {
    return null;
  }

  try {
    const url = new URL('https://kgsearch.googleapis.com/v1/entities:search');
    url.searchParams.set('query', query);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('limit', '1');
    url.searchParams.set('indent', 'false');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const item = data.itemListElement?.[0]?.result;
    if (!item) return null;

    return {
      name: item.name,
      description: item.description,
      detailedDescription: item.detailedDescription ? {
        articleBody: item.detailedDescription.articleBody,
        url: item.detailedDescription.url,
        license: item.detailedDescription.license
      } : undefined,
      types: item['@type']
    };
  } catch {
    return null;
  }
}
