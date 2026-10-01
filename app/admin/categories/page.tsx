'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { saveCategoryAction } from '@/app/admin/actions';
import { FolderTree, Plus, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [intro, setIntro] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/check-seo');
        // Load initial data
        const catRes = await fetch('/api/categories-data').catch(() => null);
      } catch {}
      // Set default categories
      setCategories([
        {
          id: 'electronics-and-tech',
          name: 'Electronics & Tech',
          intro: 'Hand-checked online stores specializing in consumer electronics, audio gear, and computer peripherals. We verify direct brand warranties and international shipping policies before listing.',
          order: 1
        },
        {
          id: 'home-and-kitchen',
          name: 'Home & Kitchen',
          intro: 'Curated specialty retailers offering cookware, appliances, and homeware. Each listing includes verified return windows and direct customer support channels.',
          order: 2
        },
        {
          id: 'outdoor-and-gear',
          name: 'Outdoor & Gear',
          intro: 'Independent and established outdoor equipment stores for camping, hiking, and travel. We confirm physical warehouse locations and official distribution channels.',
          order: 3
        },
        {
          id: 'software-and-tools',
          name: 'Software & Tools',
          intro: 'Directory of verified SaaS platforms, productivity utilities, and developer software with clear billing terms and trial policies.',
          order: 4
        }
      ]);
      setLoading(false);
    }
    load();
  }, []);

  function handleNameChange(val: string) {
    setName(val);
    if (!isEditing) {
      setId(slugify(val));
    }
  }

  function startEdit(cat: Category) {
    setIsEditing(true);
    setName(cat.name);
    setId(cat.id);
    setIntro(cat.intro);
    setOrder(cat.order);
  }

  function resetForm() {
    setIsEditing(false);
    setName('');
    setId('');
    setIntro('');
    setOrder(categories.length + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const categoryPayload: Category = {
        id: slugify(id),
        name,
        intro,
        order: Number(order)
      };

      const res = await saveCategoryAction(categoryPayload);
      if (!res.success) {
        throw new Error('Failed to save category');
      }

      setCategories(prev => {
        const filtered = prev.filter(c => c.id !== categoryPayload.id);
        return [...filtered, categoryPayload].sort((a, b) => a.order - b.order);
      });

      setSuccess(`Category "${name}" saved successfully.`);
      resetForm();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
          Category Taxonomy Management
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Each category requires a human-written introduction for SEO indexing and structured data hierarchy.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Category Form */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)] border-b border-[var(--border)] pb-2">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Sustainable Apparel"
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Category Slug (URL path) *
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="sustainable-apparel"
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)] font-mono text-xs disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Human Introduction (Required for Indexing) *
              </label>
              <textarea
                rows={4}
                required
                value={intro}
                onChange={e => setIntro(e.target.value)}
                placeholder="Hand-checked directory of online stores specializing in..."
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Display Order Priority
              </label>
              <input
                type="number"
                value={order}
                onChange={e => setOrder(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded bg-[var(--black)] text-white text-xs font-medium hover:bg-[var(--charcoal)] transition-colors shadow-sm"
              >
                {saving ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 rounded border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--off-white)]">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
              Active Directory Categories ({categories.length})
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {categories.map(cat => (
              <div key={cat.id} className="p-4 hover:bg-[var(--off-white)]/50 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[var(--text)]">{cat.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--off-white)] border border-[var(--border)] text-[var(--text-muted)]">
                      /categories/{cat.id}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {cat.intro}
                  </p>
                </div>

                <button
                  onClick={() => startEdit(cat)}
                  className="p-1.5 rounded hover:bg-[var(--gray-200)] text-[var(--text-muted)] hover:text-[var(--text)] shrink-0"
                  title="Edit Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
