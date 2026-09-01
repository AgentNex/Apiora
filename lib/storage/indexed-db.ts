import { Environment, RequestHistoryItem, SavedRequest } from '../api/types';

const DB_NAME = 'ApiForgeDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in browser'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // History Store
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id' });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          historyStore.createIndex('endpoint', 'endpoint', { unique: false });
          historyStore.createIndex('status', 'status', { unique: false });
        }

        // Saved Requests Store
        if (!db.objectStoreNames.contains('saved_requests')) {
          const savedStore = db.createObjectStore('saved_requests', { keyPath: 'id' });
          savedStore.createIndex('collection', 'collection', { unique: false });
          savedStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          savedStore.createIndex('name', 'name', { unique: false });
        }

        // Environments Store
        if (!db.objectStoreNames.contains('environments')) {
          const envStore = db.createObjectStore('environments', { keyPath: 'id' });
          envStore.createIndex('name', 'name', { unique: false });
        }

        // Key-Value Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return dbPromise;
}

// ---------------- HISTORY API ----------------

export async function addHistoryItem(item: RequestHistoryItem): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getHistoryItems(limit = 100): Promise<RequestHistoryItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('history', 'readonly');
    const store = tx.objectStore('history');
    const index = store.index('timestamp');
    const items: RequestHistoryItem[] = [];

    // Open cursor descending (newest first)
    const req = index.openCursor(null, 'prev');
    req.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && items.length < limit) {
        items.push(cursor.value);
        cursor.continue();
      } else {
        resolve(items);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearHistory(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ---------------- SAVED REQUESTS API ----------------

export async function saveRequestItem(item: SavedRequest): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('saved_requests', 'readwrite');
    const store = tx.objectStore('saved_requests');
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSavedRequests(): Promise<SavedRequest[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('saved_requests', 'readonly');
    const store = tx.objectStore('saved_requests');
    const req = store.getAll();
    req.onsuccess = () => {
      const items = (req.result as SavedRequest[]) || [];
      // Sort newest first
      items.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSavedRequest(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('saved_requests', 'readwrite');
    const store = tx.objectStore('saved_requests');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ---------------- ENVIRONMENTS API ----------------

const DEFAULT_ENVIRONMENTS: Environment[] = [
  {
    id: 'env-default',
    name: 'Development',
    variables: [
      { id: 'v1', key: 'BASE_URL', value: 'https://api.openai.com/v1', isSecret: false, enabled: true },
      { id: 'v2', key: 'MODEL_ID', value: 'gpt-4o', isSecret: false, enabled: true },
      { id: 'v3', key: 'API_KEY', value: '', isSecret: true, enabled: true }
    ]
  },
  {
    id: 'env-prod',
    name: 'Production',
    variables: [
      { id: 'v4', key: 'BASE_URL', value: 'https://api.anthropic.com/v1', isSecret: false, enabled: true },
      { id: 'v5', key: 'MODEL_ID', value: 'claude-3-5-sonnet-20241022', isSecret: false, enabled: true },
      { id: 'v6', key: 'API_KEY', value: '', isSecret: true, enabled: true }
    ]
  }
];

export async function getEnvironments(): Promise<Environment[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('environments', 'readonly');
    const store = tx.objectStore('environments');
    const req = store.getAll();
    req.onsuccess = async () => {
      let envs = req.result as Environment[];
      if (!envs || envs.length === 0) {
        // Initialize defaults
        await saveEnvironments(DEFAULT_ENVIRONMENTS);
        envs = DEFAULT_ENVIRONMENTS;
      }
      resolve(envs);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveEnvironments(environments: Environment[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('environments', 'readwrite');
    const store = tx.objectStore('environments');
    store.clear();
    for (const env of environments) {
      store.put(env);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------------- SETTINGS API ----------------

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.value !== undefined) {
          resolve(req.result.value);
        } else {
          resolve(defaultValue);
        }
      };
      req.onerror = () => resolve(defaultValue);
    });
  } catch {
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to set setting:', err);
  }
}
