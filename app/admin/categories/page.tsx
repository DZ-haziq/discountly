import { assertAdminPage } from '@/lib/auth/requireAdmin';
import CategoriesUI from './CategoriesUI';

export default async function AdminCategoriesPage() {
  await assertAdminPage();
  return <CategoriesUI />;
}
