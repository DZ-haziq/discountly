import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import CategoriesUI from './CategoriesUI';

export default async function AdminCategoriesPage() {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) redirect('/admin/login');
  return <CategoriesUI />;
}
