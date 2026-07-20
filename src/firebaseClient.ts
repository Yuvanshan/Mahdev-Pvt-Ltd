/**
 * Deprecated Firebase Client module.
 * Replaced by Vercel Serverless REST API Backend (server-db.ts).
 */
export async function getFirestoreClient() {
  return null;
}

export async function getImageStateDocRef() {
  return null;
}

export async function listenToAllCloudDbUpdates() {
  return () => {};
}

export async function getFirebaseStorage() {
  return null;
}

export async function uploadFileToFirebase(): Promise<string> {
  throw new Error("Firebase is deprecated. Use /api/upload instead.");
}
