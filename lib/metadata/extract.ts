import * as cheerio from 'cheerio';
import { sanitizeString, isValidHttpsImageUrl } from './sanitize';
import { ExtractedMetadata } from '../types';

/**
 * Extracts Open Graph, Twitter, and standard HTML metadata from static HTML
 */
export function extractMetadataFromHtml(html: string, pageUrl: string): ExtractedMetadata {
  const $ = cheerio.load(html);
  const parsedUrl = new URL(pageUrl);
  const hostname = parsedUrl.hostname;

  // Title extraction
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    $('h1').first().text() ||
    '';

  // Description extraction
  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    '';

  // OG specifics
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogDescription = $('meta[property="og:description"]').attr('content') || '';

  // OG Image resolution
  let ogImage =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    '';

  if (ogImage && !ogImage.startsWith('http')) {
    try {
      ogImage = new URL(ogImage, pageUrl).toString();
    } catch {
      ogImage = '';
    }
  }

  // Favicon / Touch Icon
  let favicon =
    $('link[rel="apple-touch-icon"]').attr('href') ||
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    '/favicon.ico';

  if (favicon && !favicon.startsWith('http')) {
    try {
      favicon = new URL(favicon, pageUrl).toString();
    } catch {
      favicon = `https://${hostname}/favicon.ico`;
    }
  }

  // Canonical
  let canonical = $('link[rel="canonical"]').attr('href') || '';
  if (canonical && !canonical.startsWith('http')) {
    try {
      canonical = new URL(canonical, pageUrl).toString();
    } catch {
      canonical = pageUrl;
    }
  }

  // Extract a small text sample for context
  const paragraphs: string[] = [];
  $('p, article, section').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 40 && text.length < 300) {
      paragraphs.push(text);
    }
  });
  const rawTextSample = paragraphs.slice(0, 3).join(' ');

  return {
    title: sanitizeString(title, 200),
    description: sanitizeString(description, 350),
    ogTitle: sanitizeString(ogTitle, 200),
    ogDescription: sanitizeString(ogDescription, 350),
    ogImage: isValidHttpsImageUrl(ogImage) ? ogImage : undefined,
    favicon: isValidHttpsImageUrl(favicon) ? favicon : undefined,
    canonical: canonical ? sanitizeString(canonical, 300) : undefined,
    hostname,
    rawTextSample: sanitizeString(rawTextSample, 600)
  };
}
