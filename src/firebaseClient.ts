import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, collection, onSnapshot } from 'firebase/firestore';

// Minimal Firebase client initialization.
// Uses the same firebase-applet-config.json consumed by server.
// This enables real-time listeners in the browser.

const configUrl = '/firebase-applet-config.json';

type FirebaseConfig = Record<string, any>;

let app: any = null;
let db: any = null;
let configCache: FirebaseConfig | null = null;

async function loadConfig(): Promise<FirebaseConfig> {
  if (configCache) return configCache;
  const res = await fetch(configUrl, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load Firebase config from ${configUrl} (HTTP ${res.status})`);
  }
  configCache = (await res.json()) as FirebaseConfig;
  return configCache!;
}

export async function getFirestoreClient() {
  if (db) return db;

  const cfg = await loadConfig();

  if (!getApps().length) {
    app = initializeApp(cfg);
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  return db;
}

export async function getImageStateDocRef() {
  const database = await getFirestoreClient();
  // Schema: app_state/{key} where key is `mahdev_image_state_v1`
  return doc(database, 'app_state', 'mahdev_image_state_v1');
}

export async function listenToAllCloudDbUpdates(onUpdate: (key: string, value: any) => void) {
  const database = await getFirestoreClient();
  const colRef = collection(database, 'app_state');

  return onSnapshot(colRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added' || change.type === 'modified') {
        const docId = change.doc.id;
        const docData = change.doc.data();
        const value = docData.data ?? docData;
        onUpdate(docId, value);
      }
    });
  });
}

