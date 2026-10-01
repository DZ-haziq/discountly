'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import {
  saveStoreWithPrivateData,
  deleteStore,
  saveCategory,
  listStores,
  listCategories,
  updateSiteSettings,
  getStoreBySlug,
  getStorePrivate
} from '@/lib/firebase/db';
import { Store, StorePrivate, Category, Settings } from '@/lib/types';
import { pingIndexNow } from '@/lib/indexnow';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export async function saveStoreAction(
  storeData: Store,
  privateData: StorePrivate,
  oldSlug?: string
) {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  // Normalization
  if (!storeData.slug) {
    return { success: false, error: 'Store slug is required.' };
  }

  const result = await saveStoreWithPrivateData(storeData, privateData, oldSlug);

  if (result.success) {
    revalidatePath('/');
    revalidatePath('/stores');
    revalidatePath(`/stores/${storeData.slug}`);
    if (oldSlug && oldSlug !== storeData.slug) {
      revalidatePath(`/stores/${oldSlug}`);
    }
    revalidatePath('/admin');
    revalidatePath('/sitemap.xml');

    // Notify search engines if published and indexable
    if (storeData.status === 'published' && storeData.indexable) {
      pingIndexNow([`${SITE_BASE_URL}/stores/${storeData.slug}`]).catch(() => {});
    }
  }

  return result;
}

export async function deleteStoreAction(slug: string) {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  const success = await deleteStore(slug);
  if (success) {
    revalidatePath('/');
    revalidatePath('/stores');
    revalidatePath(`/stores/${slug}`);
    revalidatePath('/admin');
    revalidatePath('/sitemap.xml');
  }

  return { success };
}

export async function saveCategoryAction(category: Category) {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  const success = await saveCategory(category);
  if (success) {
    revalidatePath('/');
    revalidatePath('/stores');
    revalidatePath(`/categories/${category.id}`);
    revalidatePath('/admin/categories');
  }

  return { success };
}

export async function updateSettingsAction(settings: Partial<Settings>) {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  const success = await updateSiteSettings(settings);
  if (success) {
    revalidatePath('/admin/settings');
  }
  return { success };
}
