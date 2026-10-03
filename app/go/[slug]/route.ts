import { NextRequest, NextResponse, after } from 'next/server';
import { getStoreBySlug, getStorePrivate, getRedirect, incrementClickCount } from '@/lib/firebase/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Avoid handling or redirecting RSC background prefetch calls (which cause CORS issues in browser fetch)
  const isPrefetch = req.nextUrl.searchParams.has('_rsc') || 
                     req.headers.get('rsc') === '1' || 
                     req.headers.get('next-router-prefetch') !== null;
  if (isPrefetch) {
    return new Response(null, { status: 204 });
  }

  const resolvedParams = (await params) || {};
  const slug = resolvedParams.slug;

  if (!slug) {
    return NextResponse.redirect(new URL('/stores', req.url));
  }

  // 1. Check if slug was renamed/redirected
  const redirect = await getRedirect(slug);
  const targetSlug = redirect ? redirect.toSlug : slug;

  // 2. Fetch public store to check publication status
  const store = await getStoreBySlug(targetSlug);
  if (!store || store.status !== 'published') {
    return NextResponse.redirect(new URL(`/stores/${targetSlug}`, req.url));
  }

  // 3. Fetch private affiliate URL (never exposed to client bundles)
  const privateData = await getStorePrivate(targetSlug);
  let targetUrl = privateData?.affiliateUrl || store.canonicalUrl;

  if (!targetUrl) {
    return NextResponse.redirect(new URL(`/stores/${targetSlug}`, req.url));
  }

  // Ensure targetUrl is a valid absolute URL
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  // 4. Increment daily click counter — use after() so Vercel doesn't kill the function early
  after(() => incrementClickCount(targetSlug).catch(err => console.error('Click counter error:', err)));

  // 5. Build safe outbound redirect with anti-indexing headers
  const response = NextResponse.redirect(targetUrl, 302);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
