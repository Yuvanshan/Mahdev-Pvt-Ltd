import { useEffect, useState } from 'react';

export type ImageStateDoc = {
  version: number;
  updatedAt: string;
  website: {
    brandLogo?: string;
    decorationBanner?: string;
    photographyBanner?: string;
    itBanner?: string;
    travelsBanner?: string;
    weddingDecorationBanner?: string;
  };
};

const DEFAULT_DOC: ImageStateDoc = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  website: {},
};

function normalizeUrl(url: unknown) {
  if (typeof url !== 'string') return undefined;
  const v = url.trim();
  if (!v) return undefined;
  return v;
}

export function useRealtimeImageState() {
  const [data, setData] = useState<ImageStateDoc>(DEFAULT_DOC);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timerId: NodeJS.Timeout | null = null;

    async function fetchImageState() {
      try {
        const response = await fetch('/api/get-all-data', {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const db = await response.json();
        if (cancelled) return;

        const value = db?.mahdev_image_state_v1;

        if (value) {
          const next: ImageStateDoc = {
            version: typeof value?.version === 'number' ? value.version : 1,
            updatedAt: typeof value?.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
            website: value?.website ?? {},
          };

          setData({
            ...next,
            website: {
              brandLogo: normalizeUrl(next.website.brandLogo),
              decorationBanner: normalizeUrl(next.website.decorationBanner),
              photographyBanner: normalizeUrl(next.website.photographyBanner),
              itBanner: normalizeUrl(next.website.itBanner),
              travelsBanner: normalizeUrl(next.website.travelsBanner),
              weddingDecorationBanner: normalizeUrl(next.website.weddingDecorationBanner),
            },
          });
        }
        setStatus('ready');
        setError(null);
      } catch (e: any) {
        if (cancelled) return;
        setStatus('ready'); // Graceful fallback to default
      }
    }

    fetchImageState();
    // Poll state periodically every 15s to keep UI updated
    timerId = setInterval(fetchImageState, 15000);

    return () => {
      cancelled = true;
      if (timerId) clearInterval(timerId);
    };
  }, []);

  return { imageState: data, status, error };
}
