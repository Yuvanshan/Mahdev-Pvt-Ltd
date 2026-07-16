import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, getDoc, setDoc, getDocs, collection, setLogLevel } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import fs from "fs";
import path from "path";

// Silence verbose firebase/firestore console/stream warnings
try {
  setLogLevel("error");
} catch (e) {
  console.warn("[Firebase] Could not set log level to error:", e);
}

const configPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = null;

if (fs.existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (err) {
    console.error("[Firebase config error]", err);
  }
}

let db: any = null;
let storage: any = null;

if (firebaseConfig && firebaseConfig.projectId) {
  try {
    const app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId || "(default)");
    storage = getStorage(app);
    console.log("[Firebase Init] Successfully initialized cloud Firestore and Storage with Database ID:", firebaseConfig.firestoreDatabaseId);
  } catch (error) {
    console.error("[Firebase Init ERROR] Failed to initialize Firestore/Storage:", error);
  }
} else {
  console.warn("[Firebase Init] firebase-applet-config.json not found or invalid. Falling back to local storage.");
}

const LOCAL_DB_PATH = path.join(process.cwd(), "server-db.json");

function getLocalDb() {
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const content = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      return JSON.parse(content);
    } catch (err) {
      console.error("[Local DB error]", err);
    }
  }
  return {};
}

export async function getCloudDb(): Promise<any> {
  if (!db) {
    console.log("[Storage] Firebase not configured. Falling back to local db.");
    return getLocalDb();
  }

  try {
    console.log("[Storage] Loading all data keys from Cloud Firestore...");
    const stateCol = collection(db, "app_state");
    const snapshot = await getDocs(stateCol);
    
    // If there is no data in cloud Firestore yet, perform a seamless migration of local seeds
    if (snapshot.empty) {
      console.log("[Storage] Cloud Firestore is empty. Migrating local data to cloud...");
      const localDb = getLocalDb();
      for (const [key, value] of Object.entries(localDb)) {
        await saveCloudKey(key, value);
      }
      return localDb;
    }

    const cloudData: any = {};
    snapshot.forEach((docSnapshot) => {
      const docData = docSnapshot.data();
      cloudData[docSnapshot.id] = docData.data;
    });
    console.log(`[Storage] Loaded ${Object.keys(cloudData).length} data keys from Cloud Firestore!`);
    return cloudData;
  } catch (error) {
    console.error("[Storage ERROR] Failed to fetch data from Firestore. Falling back to local:", error);
    return getLocalDb();
  }
}

export async function saveCloudKey(key: string, value: any): Promise<boolean> {
  // Always update local cache just in case we need it as a fallback
  try {
    const localDb = getLocalDb();
    localDb[key] = value;
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localDb, null, 2), "utf-8");
  } catch (localErr) {
    console.error("[Local DB update error]", localErr);
  }

  if (!db) {
    return false;
  }

  try {
    const docRef = doc(db, "app_state", key);
    await setDoc(docRef, { data: value, updatedAt: new Date().toISOString() });
    console.log(`[Storage] Key "${key}" successfully saved to Cloud Firestore!`);
    return true;
  } catch (error) {
    console.error(`[Storage ERROR] Failed to save key "${key}" to Firestore:`, error);
    return false;
  }
}

export async function uploadToFirebaseStorage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = "general"
): Promise<{ url: string; key: string }> {
  if (!storage) {
    throw new Error("Firebase Storage not initialized.");
  }

  const fileExtension = path.extname(fileName);
  const baseName = path.basename(fileName, fileExtension).replace(/[^a-zA-Z0-9]/g, "_");
  const uniqueId = Date.now() + "_" + Math.round(Math.random() * 1e6);
  const cloudKey = `${folder}/${baseName}_${uniqueId}${fileExtension}`;

  const storageRef = ref(storage, cloudKey);
  const metadata = { contentType: mimeType };

  console.log(`[Firebase Storage] Uploading file with key: ${cloudKey}...`);
  await uploadBytes(storageRef, fileBuffer, metadata);
  const downloadUrl = await getDownloadURL(storageRef);
  console.log(`[Firebase Storage] Successfully uploaded! URL: ${downloadUrl}`);
  return { url: downloadUrl, key: "firebase:" + cloudKey };
}

export async function deleteFromFirebaseStorage(fileKey: string): Promise<boolean> {
  if (!storage) return false;
  try {
    const relativeKey = fileKey.startsWith("firebase:") ? fileKey.substring(9) : fileKey;
    const storageRef = ref(storage, relativeKey);
    console.log(`[Firebase Storage] Deleting file with key: ${relativeKey}...`);
    await deleteObject(storageRef);
    console.log("[Firebase Storage] Successfully deleted file.");
    return true;
  } catch (error) {
    console.error("[Firebase Storage ERROR] Failed to delete file:", error);
    return false;
  }
}
