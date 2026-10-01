/**
 * Sends IndexNow ping notification for Bing, Yandex, etc. when URLs are published or updated
 */
export async function pingIndexNow(urls: string[]): Promise<boolean> {
  const apiKey = process.env.INDEXNOW_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discountly.com';

  if (!apiKey || urls.length === 0) {
    return false;
  }

  try {
    const host = new URL(siteUrl).host;
    const body = {
      host,
      key: apiKey,
      keyLocation: `${siteUrl}/${apiKey}.txt`,
      urlList: urls
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(body)
    });

    return res.status === 200 || res.status === 202;
  } catch {
    return false;
  }
}
