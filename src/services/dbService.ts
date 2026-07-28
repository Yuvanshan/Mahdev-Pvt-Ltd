import { db } from '@/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  limit, 
  DocumentData, 
  QuerySnapshot 
} from 'firebase/firestore';

/**
 * Service to handle Firestore operations targeting the 'mahdev-pvt-ldt' database instance.
 * All functions include robust error handling to gracefully handle the strict 
 * security rules (which currently deny all reads and writes).
 */

interface DBServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Adds a new document to the specified collection.
 * 
 * @param collectionName Name of the target Firestore collection (e.g. 'leads', 'bookings')
 * @param data Object containing the document fields
 * @returns Result object indicating success or failure status with error codes
 */
export async function addDocument(collectionName: string, data: Record<string, any>): Promise<DBServiceResult<{ id: string }>> {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, data);
    console.log(`[dbService] Document added successfully with ID: ${docRef.id} to collection '${collectionName}'`);
    return {
      success: true,
      data: { id: docRef.id }
    };
  } catch (error: any) {
    return handleFirestoreError('addDocument', collectionName, error);
  }
}

/**
 * Fetches documents from the specified collection with an optional limit.
 * 
 * @param collectionName Name of the target Firestore collection
 * @param queryLimit Optional maximum number of documents to retrieve
 * @returns Result object containing the fetched document list or error details
 */
export async function fetchDocuments(collectionName: string, queryLimit: number = 50): Promise<DBServiceResult<DocumentData[]>> {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, limit(queryLimit));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    
    const documents: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`[dbService] Successfully fetched ${documents.length} documents from collection '${collectionName}'`);
    return {
      success: true,
      data: documents
    };
  } catch (error: any) {
    return handleFirestoreError('fetchDocuments', collectionName, error);
  }
}

/**
 * Centralized Firestore error handler to catch permission constraints and log them clearly.
 */
function handleFirestoreError(operationName: string, collectionName: string, error: any): DBServiceResult {
  const errorCode = error?.code || 'unknown';
  const errorMessage = error?.message || String(error);

  if (errorCode === 'permission-denied') {
    console.warn(
      `[Firestore Security Rules Violation] operation: '${operationName}' on collection: '${collectionName}' was blocked. ` +
      `Reason: Security Rules for database 'mahdev-pvt-ldt' currently deny all read and write privileges. ` +
      `To resolve, update your Firestore Security Rules in the Firebase Console: https://console.firebase.google.com/u/0/project/for-her-33ea9/firestore/databases/mahdev-pvt-ldt/rules`
    );
  } else {
    console.error(`[dbService] Error during '${operationName}' on '${collectionName}':`, error);
  }

  return {
    success: false,
    error: errorMessage,
    code: errorCode
  };
}
