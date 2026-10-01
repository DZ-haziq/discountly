import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { listCategories, listStores } from '@/lib/firebase/db';
import { SITE_BASE_URL } from '@/lib/seo/templates';
import { FolderTree, ArrowRight, Store } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Browse Store Categories | Discountly',
  description: 'Explore online stores categorized by electronics, home & kitchen, outdoor gear, and software. Verified return policies, warranties, and direct links.',
  alternates: {
    canonical: `${SITE_BASE_URL}/categories`
  }
};

export default async function CategoriesIndexPage() {
  const categories = await listCategories();
  const stores = await listStores({ status: 'published' });

  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Categories', url: `${SITE_BASE_URL}/categories` }
  ];

  return (
    <>
      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1 py-10 sm:py-14">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="max-w-3xl mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-3">
              Store Categories
            </h1>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              Find verified online retailers organized by specialty. Every store in each category is checked for official warranties, customer support, and return policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map(cat => {
              const matchingStores = stores.filter(s => s.categoryIds.includes(cat.id));
              return (
                <div
                  key={cat.id}
                  className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--black)] transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[var(--off-white)] border border-[var(--border)] flex items-center justify-center text-[var(--text)]">
                          <FolderTree className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--text)] group-hover:text-black">
                          {cat.name}
                        </h2>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--off-white)] border border-[var(--border)] text-[var(--text-muted)] font-medium">
                        {matchingStores.length} {matchingStores.length === 1 ? 'store' : 'stores'}
                      </span>
                    </div>

                    <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                      {cat.intro}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                    <Link
                      href={`/categories/${cat.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text)] hover:underline"
                    >
                      <span>Browse category</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href={`/stores?category=${cat.id}`}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    >
                      Filter stores
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
