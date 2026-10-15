'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, StorePrivate, Category } from '@/lib/types';
import { saveStoreAction, deleteStoreAction } from '@/app/admin/actions';
import { slugify, getTodayDateString } from '@/lib/utils';
import { Save, Trash2, Wand2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

interface StoreFormProps {
  initialStore?: Store;
  initialPrivate?: StorePrivate;
  categories: Category[];
  isEdit?: boolean;
}

export function StoreForm({ initialStore, initialPrivate, categories, isEdit = false }: StoreFormProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Core fields
  const [name, setName] = useState(initialStore?.name || '');
  const [slug, setSlug] = useState(initialStore?.slug || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialStore?.canonicalUrl || '');
  const [affiliateUrl, setAffiliateUrl] = useState(initialPrivate?.affiliateUrl || '');
  const [network, setNetwork] = useState(initialPrivate?.network || '');
  const [discountPercent, setDiscountPercent] = useState(initialStore?.discountPercent || '');
  const [referralCode, setReferralCode] = useState(initialStore?.referralCode || '');
  const [status, setStatus] = useState<Store['status']>(initialStore?.status || 'published');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialStore?.categoryIds || []);

  // Auto-extracted visuals (can also be set manually)
  const [logoUrl, setLogoUrl] = useState(initialStore?.logoUrl || '');
  const [bannerImageUrl, setBannerImageUrl] = useState(initialStore?.bannerImageUrl || '');
  const [shortDescription, setShortDescription] = useState(initialStore?.shortDescription || '');

  // Task E17 & E18: Optional content fields
  const [longDescription, setLongDescription] = useState(initialStore?.longDescription || '');
  const [whoItsFor, setWhoItsFor] = useState(initialStore?.whoItsFor || initialStore?.whoItSuits || '');
  const [shipping, setShipping] = useState(initialStore?.shipping || '');
  const [returnsPolicy, setReturnsPolicy] = useState(initialStore?.returns || '');
  const [warranty, setWarranty] = useState(initialStore?.warranty || '');
  const [prosText, setProsText] = useState((initialStore?.pros || []).join('\n'));
  const [consText, setConsText] = useState((initialStore?.cons || []).join('\n'));
  const [faqsText, setFaqsText] = useState((initialStore?.faqs || []).map(f => `${f.question} | ${f.answer}`).join('\n'));
  const [lastChecked, setLastChecked] = useState(initialStore?.lastChecked || '');

  function handleNameChange(val: string) {
    setName(val);
    if (!isEdit) setSlug(slugify(val));
  }

  async function handleAutoExtract() {
    if (!canonicalUrl) { setError('Enter the store website URL first.'); return; }
    setExtracting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: canonicalUrl, storeName: name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Extraction failed');

      const meta = data.metadata;
      if (meta) {
        // Auto-fill name if empty
        if (!name && meta.title) {
          const cleanName = meta.title.split(/[-|–:]/)[0].trim();
          setName(cleanName);
          setSlug(slugify(cleanName));
        }
        // Auto-fill logo from og image or favicon
        if (!logoUrl && (meta.favicon || meta.ogImage)) {
          setLogoUrl(meta.favicon || meta.ogImage);
        }
        // Auto-fill banner from og image
        if (!bannerImageUrl && meta.ogImage) {
          setBannerImageUrl(meta.ogImage);
        }
        // Auto-fill description
        if (!shortDescription && meta.description) {
          setShortDescription(meta.description.slice(0, 160));
        }
      }
      setSuccess('Extracted logo and images from website ✓');
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedCategories.length === 0) { setError('Select at least one category.'); return; }
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const now = new Date().toISOString();
      const finalSlug = slugify(slug || name);

      const storePayload: Store = {
        name,
        slug: finalSlug,
        canonicalUrl,
        shortDescription: shortDescription || name,
        overview: shortDescription || name,
        whoItSuits: whoItsFor || '',
        longDescription: longDescription || undefined,
        whoItsFor: whoItsFor || undefined,
        shipping: shipping || undefined,
        returns: returnsPolicy || undefined,
        warranty: warranty || undefined,
        pros: prosText.split('\n').map(s => s.trim()).filter(Boolean),
        cons: consText.split('\n').map(s => s.trim()).filter(Boolean),
        faqs: faqsText.split('\n').map(line => {
          const [question, ...rest] = line.split('|');
          return { question: (question || '').trim(), answer: rest.join('|').trim() };
        }).filter(f => f.question && f.answer),
        lastChecked: lastChecked || undefined,
        checks: [],
        categoryIds: selectedCategories,
        logoUrl: logoUrl || undefined,
        bannerImageUrl: bannerImageUrl || undefined,
        discountPercent: discountPercent || undefined,
        referralCode: referralCode || undefined,
        seoTitle: `${name}: Discount Codes & Official Store`,
        seoDescription: shortDescription || `${name} — discount codes, referral links, and verified store details.`,
        status,
        indexable: true,
        gateFailures: [],
        provenance: { canonicalUrl: { source: 'USER', state: 'confirmed' } },
        safety: initialStore?.safety || { webRiskOk: true, checkedAt: now },
        createdAt: initialStore?.createdAt || now,
        updatedAt: now,
        publishedAt: status === 'published' ? (initialStore?.publishedAt || now) : undefined,
        lastReviewedOn: getTodayDateString()
      };

      const privatePayload: StorePrivate = {
        slug: finalSlug,
        affiliateUrl: affiliateUrl || canonicalUrl,
        network: network || undefined,
        updatedAt: now
      };

      const result = await saveStoreAction(storePayload, privatePayload, isEdit ? initialStore?.slug : undefined);
      if (!result.success) throw new Error(result.error || 'Failed to save');

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialStore?.slug || !confirm(`Delete "${name}"?`)) return;
    await deleteStoreAction(initialStore.slug);
    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /><span>{success}</span>
        </div>
      )}

      {/* Store Identity */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Store Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Store Name *</label>
            <input type="text" required value={name} onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Nike" className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">URL Slug</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
              placeholder="nike" className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white font-mono text-xs" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text)] mb-1">Store Website (official URL) *</label>
          <div className="flex gap-2">
            <input type="url" required value={canonicalUrl} onChange={e => setCanonicalUrl(e.target.value)}
              placeholder="https://nike.com" className="flex-1 px-3 py-2 text-sm rounded border border-[var(--border)] bg-white" />
            <button type="button" onClick={handleAutoExtract} disabled={extracting || !canonicalUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[var(--off-white)] border border-[var(--border)] text-xs font-medium hover:bg-[var(--gray-200)] disabled:opacity-50 whitespace-nowrap">
              <Wand2 className="w-3.5 h-3.5" />
              {extracting ? 'Extracting...' : 'Auto Extract'}
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Auto extract will fetch logo and product images from the store website.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text)] mb-1">Affiliate / Referral Link *</label>
          <input type="url" required value={affiliateUrl} onChange={e => setAffiliateUrl(e.target.value)}
            placeholder="https://nike.com/?ref=discountly" className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white font-mono text-xs" />
        </div>
      </div>

      {/* Discount & Referral */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Discount & Referral</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Discount Percentage</label>
            <input type="text" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)}
              placeholder="e.g. 20% OFF" className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Referral / Coupon Code</label>
            <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20" className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white font-mono uppercase tracking-wider" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text)] mb-1">Short Description (optional)</label>
          <input type="text" value={shortDescription} onChange={e => setShortDescription(e.target.value)}
            placeholder="One line about the store" className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white" />
        </div>
      </div>

      {/* Visuals */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Images (auto-extracted or manual)</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Logo URL</label>
            <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://..." className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white" />
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="logo preview" className="mt-2 h-12 w-12 rounded object-cover border border-[var(--border)]" />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Product / Banner Image URL</label>
            <input type="url" value={bannerImageUrl} onChange={e => setBannerImageUrl(e.target.value)}
              placeholder="https://..." className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white" />
            {bannerImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerImageUrl} alt="banner preview" className="mt-2 h-16 w-full rounded object-cover border border-[var(--border)]" />
            )}
          </div>
        </div>
      </div>

      {/* Categories & Status */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Categories & Status</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as Store['status'])}
              className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Network (optional)</label>
            <input type="text" value={network} onChange={e => setNetwork(e.target.value)}
              placeholder="ShareASale, Impact..." className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text)] mb-2">Categories *</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const selected = selectedCategories.includes(cat.id);
              return (
                <button key={cat.id} type="button"
                  onClick={() => setSelectedCategories(prev => selected ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selected ? 'bg-[var(--black)] text-white border-[var(--black)]' : 'bg-white text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--black)]'}`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Task E17 & E18: Optional Content & Policies */}
        <div className="border-t border-[var(--border)] pt-5 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text)]">Editorial Content &amp; Policy Details (Optional)</h3>

          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              Long Description (Overview body — only renders Overview section on store page when set)
            </label>
            <textarea
              rows={4}
              value={longDescription}
              onChange={e => setLongDescription(e.target.value)}
              placeholder="In-depth overview of the store, product lines, and merchant background..."
              className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Who It&apos;s For</label>
              <input
                type="text"
                value={whoItsFor}
                onChange={e => setWhoItsFor(e.target.value)}
                placeholder="Outdoor enthusiasts, photographers..."
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Last Checked Date</label>
              <input
                type="date"
                value={lastChecked}
                onChange={e => setLastChecked(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Shipping Summary</label>
              <textarea
                rows={2}
                value={shipping}
                onChange={e => setShipping(e.target.value)}
                placeholder="Free US shipping on orders over $50..."
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Returns Policy</label>
              <textarea
                rows={2}
                value={returnsPolicy}
                onChange={e => setReturnsPolicy(e.target.value)}
                placeholder="30-day hassle-free returns..."
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Warranty Details</label>
              <textarea
                rows={2}
                value={warranty}
                onChange={e => setWarranty(e.target.value)}
                placeholder="1-year manufacturer warranty..."
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Pros (one per line)</label>
              <textarea
                rows={3}
                value={prosText}
                onChange={e => setProsText(e.target.value)}
                placeholder="Fast shipping&#10;Durable materials&#10;Direct warranty"
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Cons (one per line)</label>
              <textarea
                rows={3}
                value={consText}
                onChange={e => setConsText(e.target.value)}
                placeholder="Higher price point&#10;Limited international shipping"
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              FAQs (one per line: Question | Answer)
            </label>
            <textarea
              rows={3}
              value={faqsText}
              onChange={e => setFaqsText(e.target.value)}
              placeholder="Does this store offer student discounts? | Yes, 10% off with UniDays&#10;Where are products made? | Designed in California, manufactured overseas."
              className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[var(--black)] text-white text-sm font-medium hover:bg-[var(--charcoal)] transition-colors shadow-sm disabled:opacity-60">
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : isEdit ? 'Update Store' : 'Add Store'}</span>
        </button>

        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        )}

        {isEdit && initialStore?.canonicalUrl && (
          <a href={`/stores/${initialStore.slug}`} target="_blank"
            className="inline-flex items-center gap-1 px-3 py-2.5 rounded border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public</span>
          </a>
        )}
      </div>
    </form>
  );
}
