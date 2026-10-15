import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  const indexNowKey = process.env.INDEXNOW_KEY;

  if (indexNowKey && key === indexNowKey) {
    return new Response(indexNowKey, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  return new Response('Not Found', { status: 404 });
}
