import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { safeFetchHtml } from '@/lib/security/fetch-safe';
import { extractMetadataFromHtml } from '@/lib/metadata/extract';
import { queryKnowledgeGraph } from '@/lib/google/kg';
import { logFetchResult } from '@/lib/firebase/db';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url, storeName } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Missing website URL' }, { status: 400 });
    }

    // 1. Fetch HTML safely via SSRF-shielded pipeline
    const fetchRes = await safeFetchHtml(url);

    // Log host attempt
    let host = '';
    try {
      host = new URL(url).hostname;
    } catch {}

    await logFetchResult({
      host,
      ok: fetchRes.ok,
      reason: fetchRes.error,
      robotsAllowed: fetchRes.robotsAllowed,
      at: new Date().toISOString()
    });

    if (!fetchRes.ok || !fetchRes.html) {
      return NextResponse.json({
        error: fetchRes.error || 'Failed to fetch webpage safely.',
        robotsAllowed: fetchRes.robotsAllowed
      }, { status: 422 });
    }

    // 2. Extract metadata statically with Cheerio
    const metadata = extractMetadataFromHtml(fetchRes.html, fetchRes.finalUrl || url);

    // 3. Optional Google Knowledge Graph lookup if storeName is provided
    let kgResult = null;
    const queryName = storeName || metadata.title?.split(/[-|–:]/)[0]?.trim();
    if (queryName) {
      kgResult = await queryKnowledgeGraph(queryName);
    }

    return NextResponse.json({
      success: true,
      metadata,
      knowledgeGraph: kgResult
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
