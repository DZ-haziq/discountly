import { Store, Category } from '../types';
import { truncateText } from '../utils';

export const SITE_NAME = 'Discountly';
export const SITE_TAGLINE = 'Online stores, explained clearly.';
export const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://discountly.com';

export function getHomeMetadata() {
  return {
    title: `${SITE_NAME}: Online store directory`,
    description: 'Browse online stores by category. Each listing links to the official store and discloses our affiliate relationship.',
    h1: 'A directory of online stores, with the details that matter.',
    canonical: SITE_BASE_URL
  };
}

export function getDirectoryMetadata(page = 1) {
  const pageSuffix = page > 1 ? ` – page ${page}` : '';
  return {
    title: `All online stores${pageSuffix}`,
    description: 'Browse every store in our directory, with categories and details we have checked.',
    h1: 'All online stores',
    canonical: page > 1 ? `${SITE_BASE_URL}/stores?page=${page}` : `${SITE_BASE_URL}/stores`
  };
}

export function getCategoryMetadata(category: Category, page = 1) {
  const pageSuffix = page > 1 ? ` – page ${page}` : '';
  const cleanIntro = category.intro ? category.intro.split('.')[0] + '.' : `Browse verified ${category.name.toLowerCase()} stores.`;
  return {
    title: `${category.name} online stores${pageSuffix}`,
    description: truncateText(cleanIntro, 155),
    h1: `${category.name} online stores`,
    canonical: page > 1 ? `${SITE_BASE_URL}/categories/${category.id}?page=${page}` : `${SITE_BASE_URL}/categories/${category.id}`
  };
}

export function getStoreMetadata(store: Store) {
  return {
    title: store.seoTitle || `${store.name}: store details & official link`,
    description: store.seoDescription || truncateText(store.shortDescription, 155),
    h1: store.name,
    canonical: `${SITE_BASE_URL}/stores/${store.slug}`,
    noindex: !store.indexable
  };
}
