import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import SettingsUI from './SettingsUI';

export default async function AdminSettingsPage() {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) redirect('/admin/login');
  return <SettingsUI />;
}
