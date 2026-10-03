import { assertAdminPage } from '@/lib/auth/requireAdmin';
import SettingsUI from './SettingsUI';

export default async function AdminSettingsPage() {
  await assertAdminPage();
  return <SettingsUI />;
}
