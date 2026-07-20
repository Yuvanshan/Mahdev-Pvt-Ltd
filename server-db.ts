/**
 * Mahdev Enterprise Server Database Engine
 * 100% Vercel Serverless Ready & Independent of Firebase
 */

import fs from "fs";
import path from "path";

const LOCAL_DB_PATH = path.join(process.cwd(), "server-db.json");
const TMP_DB_PATH = path.join("/tmp", "server-db.json");

// In-memory cache for ultra-fast serverless reads & writes
let inMemoryDbCache: Record<string, any> | null = null;

/**
 * Helper to get active DB path or fallback writable path
 */
function getWritableDbPath(): string {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      return LOCAL_DB_PATH;
    }
  } catch {
    // Read-only filesystem or restricted environment
  }
  return TMP_DB_PATH;
}

/**
 * Load raw DB object from disk or memory
 */
function readDbFromFile(): Record<string, any> {
  if (inMemoryDbCache && Object.keys(inMemoryDbCache).length > 0) {
    return inMemoryDbCache;
  }

  const pathsToTry = [LOCAL_DB_PATH, TMP_DB_PATH];

  for (const filePath of pathsToTry) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === "object") {
          inMemoryDbCache = parsed;
          return inMemoryDbCache!;
        }
      }
    } catch (err) {
      console.warn(`[Server DB] Could not read file ${filePath}:`, err);
    }
  }

  inMemoryDbCache = {};
  return inMemoryDbCache;
}

/**
 * Save raw DB object to disk and update memory cache
 */
function saveDbToFile(data: Record<string, any>): boolean {
  inMemoryDbCache = { ...data };
  const targetPath = getWritableDbPath();

  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(targetPath, jsonString, "utf-8");
    return true;
  } catch (err) {
    console.warn(`[Server DB] Direct file write to ${targetPath} failed, attempting /tmp fallback...`, err);
    try {
      fs.writeFileSync(TMP_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (tmpErr) {
      console.error("[Server DB ERROR] Failed to save DB to disk (kept in memory):", tmpErr);
      return false;
    }
  }
}

/**
 * Supabase DB integration if configured via environment variables or settings
 */
async function fetchFromSupabaseDb(): Promise<Record<string, any> | null> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/app_state?select=id,data`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) return null;

    const rows = (await res.json()) as Array<{ id: string; data: any }>;
    if (Array.isArray(rows) && rows.length > 0) {
      const dbObj: Record<string, any> = {};
      for (const row of rows) {
        dbObj[row.id] = row.data;
      }
      return dbObj;
    }
  } catch (err) {
    console.warn("[Server DB] Supabase fetch error:", err);
  }

  return null;
}

async function saveToSupabaseDb(key: string, value: any): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return false;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/app_state`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id: key,
        data: value,
        updated_at: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn(`[Server DB] Failed to save key "${key}" to Supabase:`, err);
    return false;
  }
}

/**
 * Primary public methods exported for the server
 */
export async function getCloudDb(): Promise<Record<string, any>> {
  // 1. Try Supabase if configured
  const supabaseData = await fetchFromSupabaseDb();
  if (supabaseData) {
    inMemoryDbCache = supabaseData;
    return supabaseData;
  }

  // 2. Local/Serverless File & Memory Store
  return readDbFromFile();
}

export async function saveCloudKey(key: string, value: any): Promise<boolean> {
  // 1. Update in-memory & file store
  const db = readDbFromFile();
  db[key] = value;
  saveDbToFile(db);

  // 2. Asynchronously save to Supabase if configured
  saveToSupabaseDb(key, value).catch(() => {});

  return true;
}

export async function replaceWholeDb(newDb: Record<string, any>): Promise<boolean> {
  saveDbToFile(newDb);
  return true;
}
