/**
 * Mahdev Enterprise Cloud Database Engine
 * Primary persistence: Vercel Blob Storage (BLOB_READ_WRITE_TOKEN)
 * Fallback: In-memory cache + local JSON file (dev mode only)
 */

import fs from "fs";
import path from "path";

const LOCAL_DB_PATH = path.join(process.cwd(), "server-db.json");
const TMP_DB_PATH = path.join("/tmp", "server-db.json");
const BLOB_DB_FILENAME = "mahdev-db.json";

// In-memory write-through cache with TTL
let inMemoryDbCache: Record<string, any> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10_000; // 10 seconds

function isCacheWarm(): boolean {
  return inMemoryDbCache !== null
    && Object.keys(inMemoryDbCache).length > 0
    && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}


// ───────────────────────────────────────────────────────────────
//  Local file helpers (dev fallback)
// ───────────────────────────────────────────────────────────────
function getWritableDbPath(): string {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) return LOCAL_DB_PATH;
  } catch { /* read-only */ }
  return TMP_DB_PATH;
}

function readDbFromFile(): Record<string, any> {
  if (inMemoryDbCache && Object.keys(inMemoryDbCache).length > 0) {
    return inMemoryDbCache;
  }
  for (const filePath of [LOCAL_DB_PATH, TMP_DB_PATH]) {
    try {
      if (fs.existsSync(filePath)) {
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (parsed && typeof parsed === "object") {
          inMemoryDbCache = parsed;
          return inMemoryDbCache!;
        }
      }
    } catch {}
  }
  inMemoryDbCache = {};
  return inMemoryDbCache;
}

function saveDbToFile(data: Record<string, any>): void {
  inMemoryDbCache = { ...data };
  const target = getWritableDbPath();
  try {
    fs.writeFileSync(target, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    try { fs.writeFileSync(TMP_DB_PATH, JSON.stringify(data, null, 2), "utf-8"); } catch {}
  }
}

// ───────────────────────────────────────────────────────────────
//  Vercel Blob helpers (primary cloud store)
// ───────────────────────────────────────────────────────────────
function getBlobToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN || null;
}

async function fetchFromVercelBlob(): Promise<Record<string, any> | null> {
  const token = getBlobToken();
  if (!token) return null;

  try {
    // List blobs to find our DB file
    const listRes = await fetch(
      `https://blob.vercel-storage.com?prefix=${BLOB_DB_FILENAME}&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!listRes.ok) return null;
    const listData = await listRes.json() as { blobs?: Array<{ url: string; pathname: string }> };
    const blobs = listData.blobs || [];

    if (blobs.length === 0) return null;

    const blobUrl = blobs[0].url;
    const dataRes = await fetch(blobUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!dataRes.ok) return null;

    const json = await dataRes.json() as Record<string, any>;
    console.log("[Cloud DB] Loaded DB from Vercel Blob.");
    return json;
  } catch (err) {
    console.warn("[Cloud DB] Vercel Blob fetch error:", err);
    return null;
  }
}

async function saveToVercelBlob(data: Record<string, any>): Promise<boolean> {
  const token = getBlobToken();
  if (!token) return false;

  try {
    const body = JSON.stringify(data);
    // PUT (upsert) the blob with a fixed pathname so it always overwrites the same file
    const res = await fetch(
      `https://blob.vercel-storage.com/${BLOB_DB_FILENAME}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-content-type": "application/json",
          "x-add-random-suffix": "0",      // keep fixed name
        },
        body,
      }
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("[Cloud DB] Vercel Blob PUT failed:", res.status, errText);
      return false;
    }
    console.log("[Cloud DB] Saved DB to Vercel Blob.");
    return true;
  } catch (err) {
    console.warn("[Cloud DB] Vercel Blob save error:", err);
    return false;
  }
}

// ───────────────────────────────────────────────────────────────
//  Supabase helpers (optional secondary cloud store)
// ───────────────────────────────────────────────────────────────
async function fetchFromSupabase(): Promise<Record<string, any> | null> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/app_state?select=id,data`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return null;
    const rows = await res.json() as Array<{ id: string; data: any }>;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const db: Record<string, any> = {};
    for (const row of rows) db[row.id] = row.data;
    console.log("[Cloud DB] Loaded DB from Supabase.");
    return db;
  } catch { return null; }
}

async function saveToSupabase(key: string, value: any): Promise<void> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !k) return;

  try {
    await fetch(`${url}/rest/v1/app_state`, {
      method: "POST",
      headers: {
        apikey: k,
        Authorization: `Bearer ${k}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ id: key, data: value, updated_at: new Date().toISOString() }),
    });
  } catch {}
}

// ───────────────────────────────────────────────────────────────
//  Public API
// ───────────────────────────────────────────────────────────────

/**
 * Read the entire database from cloud or local fallback.
 * Priority: Vercel Blob → Supabase → local file → in-memory
 */
export async function getCloudDb(): Promise<Record<string, any>> {
  // 1. Return warm cache if fresh (within TTL)
  if (isCacheWarm()) {
    return inMemoryDbCache!;
  }

  // 2. Vercel Blob (primary persistent cloud)
  const blobData = await fetchFromVercelBlob();
  if (blobData) {
    inMemoryDbCache = blobData;
    cacheTimestamp = Date.now();
    saveDbToFile(blobData);
    return blobData;
  }

  // 3. Supabase (secondary cloud)
  const supabaseData = await fetchFromSupabase();
  if (supabaseData) {
    inMemoryDbCache = supabaseData;
    cacheTimestamp = Date.now();
    saveToVercelBlob(supabaseData).catch(() => {});
    return supabaseData;
  }

  // 4. Local file (dev)
  const fileData = readDbFromFile();
  inMemoryDbCache = fileData;
  cacheTimestamp = Date.now();
  return fileData;
}

/**
 * Save a single key into the cloud database.
 */
export async function saveCloudKey(key: string, value: any): Promise<boolean> {
  const db = await getCloudDb();
  db[key] = value;
  inMemoryDbCache = { ...db };
  cacheTimestamp = Date.now(); // refresh cache TTL

  // Persist to local file (dev)
  saveDbToFile(db);

  // Persist to Vercel Blob
  const blobOk = await saveToVercelBlob(db);

  // Mirror key to Supabase if configured
  saveToSupabase(key, value).catch(() => {});

  return blobOk || true;
}

/**
 * Replace the entire database with new content.
 */
export async function replaceWholeDb(newDb: Record<string, any>): Promise<boolean> {
  inMemoryDbCache = { ...newDb };
  cacheTimestamp = Date.now();
  saveDbToFile(newDb);
  await saveToVercelBlob(newDb);
  return true;
}

/**
 * Invalidate the in-memory cache to force a fresh cloud read.
 */
export function invalidateCache(): void {
  inMemoryDbCache = null;
  cacheTimestamp = 0;
}
