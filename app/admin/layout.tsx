import { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: 'Discountly Admin',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <AdminNav />
      <div className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </div>
  );
}
