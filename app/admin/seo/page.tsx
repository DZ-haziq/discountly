import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import SeoUI from './SeoUI';

export default async function AdminSeoPage() {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) redirect('/admin/login');
  return <SeoUI />;
}
