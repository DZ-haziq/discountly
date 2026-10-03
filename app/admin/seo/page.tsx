import { assertAdminPage } from '@/lib/auth/requireAdmin';
import SeoUI from './SeoUI';

export default async function AdminSeoPage() {
  await assertAdminPage();
  return <SeoUI />;
}
