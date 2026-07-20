import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { getCloudDb, saveCloudKey } from "./server-db";

export interface StorageSettings {
  provider: "local" | "r2" | "supabase";
  // R2 Config
  r2Endpoint: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
  r2PublicCdnUrl: string;
  // Supabase Config
  supabaseUrl: string;
  supabaseServiceKey: string;
  supabaseBucketName: string;
  supabasePublicUrl: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string; // mime-type
  size: number; // bytes
  folder: string; // e.g. "logos", "portfolio", "documents", "general"
  uploadedAt: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  version: number;
}

const STORAGE_SETTINGS_KEY = "mahdev_storage_settings";
const MEDIA_LIBRARY_KEY = "mahdev_media_library";

const DEFAULT_STORAGE_SETTINGS: StorageSettings = {
  provider: "local",
  r2Endpoint: "",
  r2AccessKeyId: "",
  r2SecretAccessKey: "",
  r2BucketName: "",
  r2PublicCdnUrl: "",
  supabaseUrl: "",
  supabaseServiceKey: "",
  supabaseBucketName: "",
  supabasePublicUrl: "",
};

// Safe local directory resolution for serverless environments
function ensureDirectory(dirPath: string): string {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  } catch {
    const tmpDir = path.join("/tmp", path.basename(dirPath));
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {
      // Ignored if /tmp is constrained
    }
    return tmpDir;
  }
}

const BACKUP_DIR = ensureDirectory(path.join(process.cwd(), "backups"));
const UPLOADS_DIR = ensureDirectory(path.join(process.cwd(), "uploads"));

/**
 * Fetch storage settings from cloud DB
 */
export async function getStorageSettings(): Promise<StorageSettings> {
  try {
    const db = await getCloudDb();
    const settings = db[STORAGE_SETTINGS_KEY];
    if (settings) {
      return { ...DEFAULT_STORAGE_SETTINGS, ...settings };
    }
  } catch (error) {
    console.error("[Storage Settings] Error reading from DB:", error);
  }
  return DEFAULT_STORAGE_SETTINGS;
}

/**
 * Save storage settings to cloud DB
 */
export async function saveStorageSettings(settings: StorageSettings): Promise<boolean> {
  try {
    await saveCloudKey(STORAGE_SETTINGS_KEY, settings);
    return true;
  } catch (error) {
    console.error("[Storage Settings] Error saving to DB:", error);
    return false;
  }
}

/**
 * Lazy initialize S3 Client based on current settings
 */
function createS3Client(settings: StorageSettings): S3Client | null {
  if (settings.provider === "r2") {
    if (!settings.r2Endpoint || !settings.r2AccessKeyId || !settings.r2SecretAccessKey) {
      console.warn("[Storage S3] Cloudflare R2 configured but missing credentials.");
      return null;
    }
    let endpoint = settings.r2Endpoint;
    if (!endpoint.startsWith("http")) {
      endpoint = `https://${endpoint}`;
    }
    return new S3Client({
      endpoint,
      region: "auto",
      credentials: {
        accessKeyId: settings.r2AccessKeyId,
        secretAccessKey: settings.r2SecretAccessKey,
      },
    });
  } else if (settings.provider === "supabase") {
    if (!settings.supabaseUrl || !settings.supabaseServiceKey) {
      console.warn("[Storage S3] Supabase storage configured but missing credentials.");
      return null;
    }
    let ref = "";
    try {
      const urlObj = new URL(settings.supabaseUrl);
      ref = urlObj.hostname.split(".")[0];
    } catch {
      ref = settings.supabaseUrl;
    }

    const endpoint = `https://${ref}.supabase.co/storage/v1/s3`;
    return new S3Client({
      endpoint,
      region: "ap-southeast-1",
      credentials: {
        accessKeyId: ref,
        secretAccessKey: settings.supabaseServiceKey,
      },
      forcePathStyle: true,
    });
  }
  return null;
}

/**
 * Upload file to active storage (Cloud or Local/Base64 fallback)
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = "general"
): Promise<{ url: string; key: string }> {
  const settings = await getStorageSettings();
  const fileExtension = path.extname(fileName);
  const baseName = path.basename(fileName, fileExtension).replace(/[^a-zA-Z0-9]/g, "_");
  const uniqueId = Date.now() + "_" + Math.round(Math.random() * 1e6);
  const cloudKey = `${folder}/${baseName}_${uniqueId}${fileExtension}`;

  if (settings.provider === "r2" || settings.provider === "supabase") {
    const s3 = createS3Client(settings);
    if (s3) {
      try {
        const bucketName =
          settings.provider === "r2" ? settings.r2BucketName : settings.supabaseBucketName;
        
        console.log(`[Storage Cloud] Uploading to bucket "${bucketName}" with key "${cloudKey}"...`);

        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: cloudKey,
            Body: fileBuffer,
            ContentType: mimeType,
          })
        );

        let publicUrl = "";
        if (settings.provider === "r2") {
          const cdn = settings.r2PublicCdnUrl || `https://${settings.r2BucketName}.r2.dev`;
          publicUrl = `${cdn.replace(/\/$/, "")}/${cloudKey}`;
        } else {
          const baseUrl = settings.supabasePublicUrl || `${settings.supabaseUrl}/storage/v1/object/public/${settings.supabaseBucketName}`;
          publicUrl = `${baseUrl.replace(/\/$/, "")}/${cloudKey}`;
        }

        console.log(`[Storage Cloud] Successfully uploaded to cloud storage: ${publicUrl}`);
        return { url: publicUrl, key: cloudKey };
      } catch (error) {
        console.error("[Storage Cloud ERROR] S3 upload failed, falling back to local/data-URL:", error);
      }
    }
  }

  // Local storage fallback with file system check
  try {
    const localDestDir = ensureDirectory(path.join(UPLOADS_DIR, folder));
    const localFileName = `${baseName}_${uniqueId}${fileExtension}`;
    const localFilePath = path.join(localDestDir, localFileName);
    fs.writeFileSync(localFilePath, fileBuffer);

    const localUrl = `/uploads/${folder}/${localFileName}`;
    return { url: localUrl, key: `local:${folder}/${localFileName}` };
  } catch (err) {
    console.warn("[Storage Local Fallback] File system write failed, producing Data URL...", err);
    const base64Data = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType || "application/octet-stream"};base64,${base64Data}`;
    return { url: dataUrl, key: `data:${cloudKey}` };
  }
}

/**
 * Delete file from active storage
 */
export async function deleteFile(fileKey: string): Promise<boolean> {
  if (!fileKey) return false;

  if (fileKey.startsWith("local:")) {
    const relativePath = fileKey.substring(6);
    const localFilePath = path.join(UPLOADS_DIR, relativePath);
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        console.log(`[Storage Local] Deleted local file: ${localFilePath}`);
        return true;
      }
    } catch (err) {
      console.error("[Storage Local ERROR] Failed to delete local file:", err);
    }
    return false;
  }

  if (fileKey.startsWith("data:")) {
    return true;
  }

  const settings = await getStorageSettings();
  const s3 = createS3Client(settings);
  if (s3) {
    try {
      const bucketName =
        settings.provider === "r2" ? settings.r2BucketName : settings.supabaseBucketName;
      console.log(`[Storage Cloud] Deleting key "${fileKey}" from bucket "${bucketName}"...`);
      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
        })
      );
      console.log("[Storage Cloud] Successfully deleted file from cloud.");
      return true;
    } catch (error) {
      console.error("[Storage Cloud ERROR] S3 deletion failed:", error);
    }
  }
  return false;
}

/**
 * Get all Media Library Items
 */
export async function getMediaLibrary(): Promise<MediaItem[]> {
  try {
    const db = await getCloudDb();
    const media = db[MEDIA_LIBRARY_KEY];
    if (Array.isArray(media)) {
      return media;
    }
  } catch (error) {
    console.error("[Media Library] Error reading from DB:", error);
  }
  return [];
}

/**
 * Save all Media Library Items
 */
export async function saveMediaLibrary(media: MediaItem[]): Promise<boolean> {
  try {
    await saveCloudKey(MEDIA_LIBRARY_KEY, media);
    return true;
  } catch (error) {
    console.error("[Media Library] Error saving to DB:", error);
    return false;
  }
}

/**
 * Create full system database backup
 */
export async function createBackup(): Promise<string> {
  const db = await getCloudDb();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `mahdev-backup-${timestamp}.json`;
  
  const backupData = {
    backupName: backupFileName,
    createdAt: new Date().toISOString(),
    version: "2.0",
    data: db,
  };

  try {
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), "utf-8");
    console.log(`[Backup System] Created local backup file: ${backupFilePath}`);
  } catch (err) {
    console.warn("[Backup System] Local backup file write warning:", err);
  }

  const settings = await getStorageSettings();
  if (settings.provider !== "local") {
    try {
      const s3 = createS3Client(settings);
      if (s3) {
        const bucketName =
          settings.provider === "r2" ? settings.r2BucketName : settings.supabaseBucketName;
        const cloudKey = `backups/${backupFileName}`;
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: cloudKey,
            Body: JSON.stringify(backupData, null, 2),
            ContentType: "application/json",
          })
        );
        console.log(`[Backup Cloud] Successfully synced backup to cloud.`);
      }
    } catch (err) {
      console.error("[Backup Cloud ERROR] Failed to sync backup to cloud:", err);
    }
  }

  return backupFileName;
}

/**
 * Get list of all available backups
 */
export function getBackupsList(): Array<{ name: string; size: number; createdAt: string }> {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    const files = fs.readdirSync(BACKUP_DIR);
    return files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        let createdAt = stats.birthtime.toISOString();
        const match = file.match(/backup-(.+)\.json/);
        if (match && match[1]) {
          createdAt = match[1].replace(/-/g, ":").substring(0, 19);
        }
        return {
          name: file,
          size: stats.size,
          createdAt,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (err) {
    console.error("[Backup System] Failed to list backups:", err);
    return [];
  }
}

/**
 * Restore system database from a JSON backup content
 */
export async function restoreFromBackupData(backupJson: any): Promise<boolean> {
  if (!backupJson || typeof backupJson !== "object" || !backupJson.data) {
    throw new Error("Invalid backup JSON format.");
  }

  const dataToRestore = backupJson.data;
  console.log(`[Backup System] Starting restore. Restoring ${Object.keys(dataToRestore).length} collections/keys...`);

  for (const [key, value] of Object.entries(dataToRestore)) {
    await saveCloudKey(key, value);
  }

  console.log("[Backup System] Restore completed successfully!");
  return true;
}
