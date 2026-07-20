/**
 * Deprecated Server Firebase module.
 * Replaced by Vercel Serverless DB Engine (server-db.ts).
 */
export { getCloudDb, saveCloudKey } from "./server-db";

export async function uploadToFirebaseStorage(): Promise<{ url: string; key: string }> {
  throw new Error("Firebase storage is deprecated. Use server-storage uploadFile instead.");
}

export async function deleteFromFirebaseStorage(): Promise<boolean> {
  return false;
}
