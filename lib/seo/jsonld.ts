import { Store, Category } from '../types';
import { SITE_NAME, SITE_BASE_URL } from './templates';

export function getSiteOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_BASE_URL,
    logo: `${SITE_BASE_URL}/logo.png`,
    description: 'An independent directory of online stores with verified facts and transparent disclosures.'
  };
}

export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_BASE_URL}/stores?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export function getBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function getItemListJsonLd(name: string, stores: Store[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: stores.length,
    itemListElement: stores.map((store, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: store.name,
      url: `${SITE_BASE_URL}/stores/${store.slug}`
    }))
  };
}

export function getStorePageJsonLd(store: Store, primaryCategory?: Category) {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Stores', url: `${SITE_BASE_URL}/stores` }
  ];

  if (primaryCategory) {
    breadcrumbItems.push({
      name: primaryCategory.name,
      url: `${SITE_BASE_URL}/categories/${primaryCategory.id}`
    });
  }

  breadcrumbItems.push({
    name: store.name,
    url: `${SITE_BASE_URL}/stores/${store.slug}`
  });

  return [
    getBreadcrumbJsonLd(breadcrumbItems),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: store.seoTitle || `${store.name} Store Profile`,
      description: store.seoDescription || store.shortDescription,
      url: `${SITE_BASE_URL}/stores/${store.slug}`,
      about: {
        '@type': 'Organization',
        name: store.name,
        url: store.canonicalUrl,
        ...(store.logoUrl ? { logo: store.logoUrl } : {})
      }
    }
  ];
}

export function getFaqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

