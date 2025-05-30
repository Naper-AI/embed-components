export interface CacheOptions {
  ttlMs?: number; // Time to live in milliseconds
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class DataCache {
  private static memoryCache = new Map<string, CacheEntry<unknown>>();
  private static dbName = 'DataCacheDB';
  private static storeName = 'cache';
  private static isIndexedDBAvailable = typeof indexedDB !== 'undefined';

  // In-memory get
  private static getMemory<T>(key: string): T | undefined {
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    if (entry) this.memoryCache.delete(key);
    return undefined;
  }

  // In-memory set
  private static setMemory<T>(key: string, data: T, ttlMs: number) {
    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  // Persistent get (IndexedDB or localStorage)
  private static async getPersistent<T>(key: string): Promise<T | undefined> {
    if (this.isIndexedDBAvailable) {
      return this.getIndexedDB<T>(key);
    } else {
      return this.getLocalStorage<T>(key);
    }
  }

  // Persistent set (IndexedDB or localStorage)
  private static async setPersistent<T>(key: string, data: T, ttlMs: number) {
    if (this.isIndexedDBAvailable) {
      await this.setIndexedDB(key, data, ttlMs);
    } else {
      this.setLocalStorage(key, data, ttlMs);
    }
  }

  // IndexedDB get
  private static getIndexedDB<T>(key: string): Promise<T | undefined> {
    return new Promise((resolve) => {
      const open = indexedDB.open(this.dbName, 1);
      open.onupgradeneeded = () => {
        open.result.createObjectStore(this.storeName);
      };
      open.onsuccess = () => {
        const db = open.result;
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => {
          const entry = req.result as CacheEntry<T> | undefined;
          if (entry && entry.expiresAt > Date.now()) {
            resolve(entry.data);
          } else {
            resolve(undefined);
          }
        };
        req.onerror = () => resolve(undefined);
      };
      open.onerror = () => resolve(undefined);
    });
  }

  // IndexedDB set
  private static setIndexedDB<T>(key: string, data: T, ttlMs: number): Promise<void> {
    return new Promise((resolve) => {
      const open = indexedDB.open(this.dbName, 1);
      open.onupgradeneeded = () => {
        open.result.createObjectStore(this.storeName);
      };
      open.onsuccess = () => {
        const db = open.result;
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const entry: CacheEntry<T> = {
          data,
          expiresAt: Date.now() + ttlMs,
        };
        store.put(entry, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      };
      open.onerror = () => resolve();
    });
  }

  // localStorage get
  private static getLocalStorage<T>(key: string): T | undefined {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return undefined;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (entry && entry.expiresAt > Date.now()) {
        return entry.data;
      }
      localStorage.removeItem(key);
      return undefined;
    } catch {
      return undefined;
    }
  }

  // localStorage set
  private static setLocalStorage<T>(key: string, data: T, ttlMs: number) {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  }

  // Public API: fetchOrCache
  static async fetchOrCache<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const ttlMs = options?.ttlMs ?? 1000 * 60 * 5; // Default 5 minutes

    const mem = this.getMemory<T>(key);
    if (mem !== undefined) {
      return mem instanceof Promise ? await mem : mem;
    };

    const promise = (async () => {
      const persistent = await this.getPersistent<T>(key);
      if (persistent !== undefined) {
        this.setMemory(key, persistent, ttlMs);
        return persistent;
      }

      const data = await fetcher();
      this.setMemory(key, data, ttlMs);
      this.setPersistent(key, data, ttlMs);
      return data;
    })();

    this.setMemory(key, promise, ttlMs);
    return promise;
  }
}

export default DataCache; 