/**
 * Safe localStorage wrapper with in-memory fallback for private browsing and quota limits.
 */

const memoryStore = new Map();

function isStorageAvailable() {
  try {
    const testKey = '__nutrivibe_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  getItem(key, defaultValue = null) {
    try {
      if (typeof window !== 'undefined' && isStorageAvailable()) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
    } catch {
      return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
    }
  },

  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (typeof window !== 'undefined' && isStorageAvailable()) {
        window.localStorage.setItem(key, serialized);
      }
      memoryStore.set(key, value);
      return true;
    } catch {
      memoryStore.set(key, value);
      return false;
    }
  },

  removeItem(key) {
    try {
      if (typeof window !== 'undefined' && isStorageAvailable()) {
        window.localStorage.removeItem(key);
      }
      memoryStore.delete(key);
      return true;
    } catch {
      memoryStore.delete(key);
      return false;
    }
  },

  clear() {
    try {
      if (typeof window !== 'undefined' && isStorageAvailable()) {
        window.localStorage.clear();
      }
      memoryStore.clear();
      return true;
    } catch {
      memoryStore.clear();
      return false;
    }
  },
};
