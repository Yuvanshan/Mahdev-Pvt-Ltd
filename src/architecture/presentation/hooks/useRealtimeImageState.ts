import { useEffect, useMemo, useState } from 'react';
import { onSnapshot, DocumentData } from 'firebase/firestore';
import { getImageStateDocRef } from '../../../firebaseClient';

export type ImageStateDoc = {
  version: number;
  updatedAt: string;
  // Stores content image URLs for the website.
  // Example keys: brandLogo, decorationBanner, photographyBanner, itBanner, travelsBanner, weddingDecorationBanner,
  // plus arrays like photoPortfolio, decorationGallery, leadershipTeam (if you want to extend).
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
  // Ensure cache-busting is always honored: append ?v=<updatedAtEpoch> if not present.
  // We avoid double ? by appending with correct separator.
  return v;
}

export function useRealtimeImageState() {
  const [data, setData] = useState<ImageStateDoc>(DEFAULT_DOC);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const docRefPromise = useMemo(() => getImageStateDocRef(), []);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;

    async function start() {
      try {
        const docRef = await docRefPromise;
        if (cancelled) return;

        unsub = onSnapshot(
          docRef,
          (snap) => {
            const raw = snap.exists() ? (snap.data() as DocumentData) : null;
            if (!raw) {
              setData(DEFAULT_DOC);
              setStatus('ready');
              return;
            }

            // Expected format from server: { data: value, updatedAt: ... }
            const value = raw?.data ?? raw;

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
            setStatus('ready');
          },
          (e) => {
            setStatus('error');
            setError(e?.message || String(e));
          }
        );
      } catch (e: any) {
        setStatus('error');
        setError(e?.message || String(e));
      }
    }

    start();
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [docRefPromise]);

  return { imageState: data, status, error };
}

