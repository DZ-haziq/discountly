'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Store, StorePrivate, Category, ProvenanceSource, ProvenanceState } from '@/lib/types';
import { evaluateIndexabilityGate } from '@/lib/seo/indexability';
import { QualityGateCard } from './QualityGateCard';
import { SeoPreview } from './SeoPreview';
import { saveStoreAction, deleteStoreAction } from '@/app/admin/actions';
import { slugify, getTodayDateString, countWords } from '@/lib/utils';
import {
  Sparkles,
  Save,
  Trash2,
  Plus,
  X,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface StoreFormProps {
  initialStore?: Store;
  initialPrivate?: StorePrivate;
  categories: Category[];
  isEdit?: boolean;
}

export function StoreForm({
  initialStore,
  initialPrivate,
  categories,
  isEdit = false
}: StoreFormProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fetchedMetaDescription, setFetchedMetaDescription] = useState<string>('');
  const [kgSuggestion, setKgSuggestion] = useState<{
    description?: string;
    license?: string;
  } | null>(null);

  // Form State
  const [name, setName] = useState(initialStore?.name || '');
  const [slug, setSlug] = useState(initialStore?.slug || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialStore?.canonicalUrl || '');
  const [affiliateUrl, setAffiliateUrl] = useState(initialPrivate?.affiliateUrl || '');
  const [network, setNetwork] = useState(initialPrivate?.network || '');
  const [status, setStatus] = useState<Store['status']>(initialStore?.status || 'draft');
  const [countryCode, setCountryCode] = useState(initialStore?.countryCode || 'US');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialStore?.categoryIds || []);

  const [shortDescription, setShortDescription] = useState(initialStore?.shortDescription || '');
  const [overview, setOverview] = useState(initialStore?.overview || '');
  const [whoItSuits, setWhoItSuits] = useState(initialStore?.whoItSuits || '');

  const [checks, setChecks] = useState<{ text: string; checkedOn: string }[]>(
    initialStore?.checks && initialStore.checks.length > 0
      ? initialStore.checks
      : [{ text: 'HTTPS encryption verified on checkout page', checkedOn: getTodayDateString() }]
  );

  const [shippingText, setShippingText] = useState(initialStore?.shippingReturns?.text || '');
  const [shippingPolicyUrl, setShippingPolicyUrl] = useState(initialStore?.shippingReturns?.policyUrl || '');
  const [shippingCheckedOn, setShippingCheckedOn] = useState(initialStore?.shippingReturns?.checkedOn || getTodayDateString());

  const [editorNote, setEditorNote] = useState(initialStore?.editorNote || '');
  const [logoUrl, setLogoUrl] = useState(initialStore?.logoUrl || '');
  const [logoAlt, setLogoAlt] = useState(initialStore?.logoAlt || '');
  const [seoTitle, setSeoTitle] = useState(initialStore?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialStore?.seoDescription || '');
  const [lastReviewedOn, setLastReviewedOn] = useState(initialStore?.lastReviewedOn || getTodayDateString());

  // Provenance tracking
  const [provenance, setProvenance] = useState<Store['provenance']>(
    initialStore?.provenance || {
      overview: { source: 'USER', state: 'confirmed' }
    }
  );

  // Auto-fill slug if new store
  function handleNameChange(val: string) {
    setName(val);
    if (!isEdit && !slug) {
      setSlug(slugify(val));
    }
    if (!seoTitle) {
      setSeoTitle(`${val}: Store Details & Official Link`);
    }
    if (!logoAlt) {
      setLogoAlt(`${val} brand logo`);
    }
  }

  // Construct current store object for evaluation
  const currentStoreData: Partial<Store> = useMemo(() => {
    return {
      name,
      slug,
      canonicalUrl,
      shortDescription,
      overview,
      whoItSuits,
      checks: checks.filter(c => c.text.trim().length > 0),
      shippingReturns: shippingText ? {
        text: shippingText,
        policyUrl: shippingPolicyUrl,
        checkedOn: shippingCheckedOn
      } : undefined,
      editorNote: editorNote || undefined,
      countryCode,
      categoryIds: selectedCategories,
      logoUrl: logoUrl || undefined,
      logoAlt: logoAlt || undefined,
      seoTitle,
      seoDescription,
      status,
      lastReviewedOn,
      provenance,
      safety: initialStore?.safety || { webRiskOk: true, checkedAt: new Date().toISOString() }
    };
  }, [
    name, slug, canonicalUrl, shortDescription, overview, whoItSuits, checks,
    shippingText, shippingPolicyUrl, shippingCheckedOn, editorNote, countryCode,
    selectedCategories, logoUrl, logoAlt, seoTitle, seoDescription, status,
    lastReviewedOn, provenance, initialStore?.safety
  ]);

  // Live quality gate computation
  const gateResult = useMemo(() => {
    return evaluateIndexabilityGate(currentStoreData, fetchedMetaDescription);
  }, [currentStoreData, fetchedMetaDescription]);

  // Suggest from website handler
  async function handleSuggest() {
    if (!canonicalUrl) {
      setError('Please provide the Store Official Website URL first.');
      return;
    }

    setFetchingSuggestions(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: canonicalUrl, storeName: name })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch suggestions');
      }

      const meta = data.metadata;
      if (meta) {
        if (!name && meta.title) {
          const cleanName = meta.title.split(/[-|–:]/)[0].trim();
          setName(cleanName);
          setSlug(slugify(cleanName));
          setLogoAlt(`${cleanName} brand logo`);
        }

        if (meta.description) {
          setFetchedMetaDescription(meta.description);
          if (!shortDescription) {
            setShortDescription(meta.description.slice(0, 155));
          }
        }

        if (!logoUrl && (meta.ogImage || meta.favicon)) {
          setLogoUrl(meta.ogImage || meta.favicon);
        }

        if (!seoDescription && meta.description) {
          setSeoDescription(meta.description.slice(0, 155));
        }

        // Set provenance
        setProvenance(prev => ({
          ...prev,
          canonicalUrl: { source: 'OWNER_SITE', state: 'confirmed', sourceUrl: canonicalUrl },
          shortDescription: { source: 'OWNER_SITE', state: 'needs_review', sourceUrl: canonicalUrl }
        }));
      }

      if (data.knowledgeGraph) {
        setKgSuggestion({
          description: data.knowledgeGraph.detailedDescription?.articleBody || data.knowledgeGraph.description,
          license: data.knowledgeGraph.detailedDescription?.license
        });
      }

      setSuccessMessage('Successfully extracted metadata suggestions.');
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setFetchingSuggestions(false);
    }
  }

  // Save form handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const storePayload: Store = {
        name,
        slug: slugify(slug),
        canonicalUrl,
        shortDescription,
        overview,
        whoItSuits,
        checks: checks.filter(c => c.text.trim().length > 0),
        shippingReturns: shippingText ? {
          text: shippingText,
          policyUrl: shippingPolicyUrl,
          checkedOn: shippingCheckedOn
        } : undefined,
        editorNote: editorNote || undefined,
        countryCode,
        categoryIds: selectedCategories,
        logoUrl: logoUrl || undefined,
        logoAlt: logoAlt || `${name} logo`,
        seoTitle: seoTitle || `${name}: Store Details & Official Link`,
        seoDescription: seoDescription || shortDescription,
        status,
        indexable: gateResult.indexable,
        gateFailures: gateResult.failures,
        provenance,
        safety: initialStore?.safety || { webRiskOk: true, checkedAt: new Date().toISOString() },
        createdAt: initialStore?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: status === 'published' ? (initialStore?.publishedAt || new Date().toISOString()) : undefined,
        lastReviewedOn
      };

      const privatePayload: StorePrivate = {
        slug: slugify(slug),
        affiliateUrl: affiliateUrl || canonicalUrl,
        network: network || undefined,
        updatedAt: new Date().toISOString()
      };

      const result = await saveStoreAction(
        storePayload,
        privatePayload,
        isEdit ? initialStore?.slug : undefined
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to save store');
      }

      setSuccessMessage('Store saved successfully.');
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // Delete handler
  async function handleDelete() {
    if (!initialStore?.slug || !confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deleteStoreAction(initialStore.slug);
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Basic Details */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)] border-b border-[var(--border)] pb-2">
              1. Store Identity & URLs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Fellow Products"
                  className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="fellow-products"
                  className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)] font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  Official Website (HTTPS Canonical) *
                </label>
                <input
                  type="url"
                  required
                  value={canonicalUrl}
                  onChange={e => setCanonicalUrl(e.target.value)}
                  placeholder="https://fellowproducts.com"
                  className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  Affiliate URL (Private, never client-exposed) *
                </label>
                <input
                  type="url"
                  required
                  value={affiliateUrl}
                  onChange={e => setAffiliateUrl(e.target.value)}
                  placeholder="https://fellowproducts.com/?aff=discountly"
                  className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)] font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSuggest}
                disabled={fetchingSuggestions || !canonicalUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--off-white)] border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:bg-[var(--gray-200)] disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{fetchingSuggestions ? 'Fetching safely...' : 'Suggest from Website (SSRF Shielded)'}</span>
              </button>

              <span className="text-[11px] text-[var(--text-muted)]">
                Extracts metadata statically using Cheerio and queries Google KG entity data.
              </span>
            </div>

            {kgSuggestion && (
              <div className="p-3 bg-[var(--off-white)] border border-[var(--border)] rounded text-xs space-y-1">
                <span className="font-semibold text-[var(--text)]">Google Knowledge Graph Suggestion:</span>
                <p className="text-[var(--text-muted)]">{kgSuggestion.description}</p>
                {kgSuggestion.license && (
                  <span className="text-[10px] text-gray-500 block">Attribution: {kgSuggestion.license}</span>
                )}
              </div>
            )}
          </div>

          {/* 2. Categorization & Status */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)] border-b border-[var(--border)] pb-2">
              2. Categories & Publication Status
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  Publication Status *
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as Store['status'])}
                  className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Public)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  Primary Country / Region
                </label>
                <input
                  type="text"
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  placeholder="US, UK, Global"
                  className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  Affiliate Network
                </label>
                <input
                  type="text"
                  value={network}
                  onChange={e => setNetwork(e.target.value)}
                  placeholder="ShareASale, Impact, Direct"
                  className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-2">
                Select Categories (at least 1 required) *
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategories(prev =>
                          isSelected ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-[var(--black)] text-white border-[var(--black)]'
                          : 'bg-white text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--gray-700)]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Original Content Writing */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">
                3. Editorial Writing (No AI text)
              </h2>
              <span className="text-xs text-[var(--text-muted)]">
                Total Words: {countWords(`${overview} ${whoItSuits} ${checks.map(c => c.text).join(' ')}`)} / 150
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-[var(--text)]">
                  Short Description (110–160 chars) *
                </label>
                <span className={`text-[11px] ${shortDescription.length > 160 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                  {shortDescription.length} / 160 chars
                </span>
              </div>
              <input
                type="text"
                required
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="One concise sentence explaining what the store sells and where it ships."
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-[var(--text)]">
                  Overview (Long Description, 60–100 words in your own original words) *
                </label>
                <span className="text-[11px] text-gray-500">
                  {countWords(overview)} words
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={overview}
                onChange={e => setOverview(e.target.value)}
                placeholder="Describe the product catalog and brand history based on verified inspection..."
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)] leading-relaxed"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-[var(--text)]">
                  Who It Suits (40–80 words)
                </label>
                <span className="text-[11px] text-gray-500">
                  {countWords(whoItSuits)} words
                </span>
              </div>
              <textarea
                rows={3}
                value={whoItSuits}
                onChange={e => setWhoItSuits(e.target.value)}
                placeholder="The specific kind of shopper, hobbyist, or use-case this store fits best..."
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)] leading-relaxed"
              />
            </div>
          </div>

          {/* 4. Verified Facts & Policies */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">
                4. What We Checked (Verified Facts)
              </h2>
              <button
                type="button"
                onClick={() => setChecks([...checks, { text: '', checkedOn: getTodayDateString() }])}
                className="inline-flex items-center gap-1 text-xs font-medium text-black hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Fact</span>
              </button>
            </div>

            <div className="space-y-3">
              {checks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={check.text}
                    onChange={e => {
                      const updated = [...checks];
                      updated[idx].text = e.target.value;
                      setChecks(updated);
                    }}
                    placeholder="e.g. Official 2-year warranty on all electric gear"
                    className="flex-1 px-3 py-1.5 text-xs rounded border border-[var(--border)] bg-white"
                  />
                  <input
                    type="date"
                    value={check.checkedOn}
                    onChange={e => {
                      const updated = [...checks];
                      updated[idx].checkedOn = e.target.value;
                      setChecks(updated);
                    }}
                    className="w-32 px-2 py-1.5 text-xs rounded border border-[var(--border)] bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setChecks(checks.filter((_, i) => i !== idx))}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--border)] space-y-3">
              <h3 className="text-xs font-semibold text-[var(--text)]">
                Shipping & Returns Policy Summary
              </h3>
              <input
                type="text"
                value={shippingText}
                onChange={e => setShippingText(e.target.value)}
                placeholder="e.g. 30-day returns on unused gear; free ground delivery above $50."
                className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="url"
                  value={shippingPolicyUrl}
                  onChange={e => setShippingPolicyUrl(e.target.value)}
                  placeholder="https://store.com/pages/returns"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[var(--border)] bg-white font-mono"
                />
                <input
                  type="date"
                  value={shippingCheckedOn}
                  onChange={e => setShippingCheckedOn(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-[var(--border)] bg-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Editor&apos;s Note / Caveat (Optional)
              </label>
              <input
                type="text"
                value={editorNote}
                onChange={e => setEditorNote(e.target.value)}
                placeholder="e.g. Electrical voltage is 120V US standard; adapters needed for EU use."
                className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-white"
              />
            </div>
          </div>

          {/* 5. Visuals & SEO Metadata */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)] border-b border-[var(--border)] pb-2">
              5. Visuals & Custom Meta Tags
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  Logo Image URL (HTTPS) *
                </label>
                <input
                  type="url"
                  required
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  Logo Alt Text (Accessibility) *
                </label>
                <input
                  type="text"
                  required
                  value={logoAlt}
                  onChange={e => setLogoAlt(e.target.value)}
                  placeholder="Fellow Products coffee brand logo"
                  className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                SEO Title (50–60 chars) *
              </label>
              <input
                type="text"
                required
                value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)}
                placeholder="Fellow Products: Specialty Coffee Gear & Official Store"
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                SEO Meta Description (120–160 chars) *
              </label>
              <textarea
                rows={2}
                required
                value={seoDescription}
                onChange={e => setSeoDescription(e.target.value)}
                placeholder="Verified store overview for Fellow Products. Details on electric kettles, warranty extension, and official store link."
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Quality Gate & SEO Previews */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <QualityGateCard gateResult={gateResult} />

          <SeoPreview
            title={seoTitle}
            description={seoDescription}
            slug={slug}
            ogImage={logoUrl}
            storeName={name}
          />

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-sm space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded bg-[var(--black)] text-white text-sm font-medium hover:bg-[var(--charcoal)] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Store...' : 'Save Store Listing'}</span>
            </button>

            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-2 rounded border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Store</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
