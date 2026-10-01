'use client';

import { useState } from 'react';
import { truncateText } from '@/lib/utils';
import { Globe, Share2 } from 'lucide-react';

interface SeoPreviewProps {
  title: string;
  description: string;
  slug: string;
  ogImage?: string;
  storeName: string;
}

export function SeoPreview({
  title,
  description,
  slug,
  ogImage,
  storeName
}: SeoPreviewProps) {
  const [tab, setTab] = useState<'google' | 'social'>('google');
  const siteUrl = 'https://discountly.com';
  const pageUrl = `${siteUrl}/stores/${slug || 'store-slug'}`;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
          Search & Social Preview
        </h3>
        <div className="flex rounded border border-[var(--border)] p-0.5 bg-[var(--off-white)] text-xs">
          <button
            type="button"
            onClick={() => setTab('google')}
            className={`px-2.5 py-0.5 rounded ${
              tab === 'google' ? 'bg-[var(--surface)] font-medium shadow-xs text-[var(--text)]' : 'text-[var(--text-muted)]'
            }`}
          >
            Google Snippet
          </button>
          <button
            type="button"
            onClick={() => setTab('social')}
            className={`px-2.5 py-0.5 rounded ${
              tab === 'social' ? 'bg-[var(--surface)] font-medium shadow-xs text-[var(--text)]' : 'text-[var(--text-muted)]'
            }`}
          >
            Social Card
          </button>
        </div>
      </div>

      {tab === 'google' ? (
        <div className="bg-white p-4 rounded border border-[var(--border)] font-sans text-left">
          <div className="flex items-center gap-1.5 text-xs text-[#202124] mb-1">
            <div className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
              D
            </div>
            <span className="font-medium">Discountly</span>
            <span className="text-[#5f6368]">› stores › {slug || 'store-slug'}</span>
          </div>

          <h4 className="text-[#1a0dab] hover:underline text-base font-normal leading-snug cursor-pointer mb-1">
            {title || `${storeName}: store details & official link | Discountly`}
          </h4>

          <p className="text-[#4d5156] text-xs leading-normal">
            {truncateText(
              description || 'Hand-checked online store details, verified return policies, and official store website link.',
              160
            )}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded border border-[var(--border)] overflow-hidden text-left">
          {ogImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ogImage}
              alt="OG Preview"
              className="w-full h-40 object-cover bg-gray-100"
            />
          ) : (
            <div className="w-full h-32 bg-[var(--charcoal)] flex flex-col items-center justify-center text-white p-4 text-center">
              <span className="text-lg font-bold tracking-tight">{storeName || 'Discountly'}</span>
              <span className="text-xs text-[var(--gray-400)]">Verified Online Store Directory</span>
            </div>
          )}
          <div className="p-3 bg-[var(--off-white)] border-t border-[var(--border)]">
            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">DISCOUNTLY.COM</span>
            <h4 className="text-xs font-semibold text-[var(--text)] truncate mt-0.5">
              {title || storeName}
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
