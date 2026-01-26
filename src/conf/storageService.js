const DB_NAME = 'LofiOS_MusicDB';
const STORE_NAME = 'tracks';
const DB_VERSION = 1;

// Initialize DB 
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Save track + audio blob
export const saveTrack = async (track, fileBlob) => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Store the actual file blob alongside metadata
    store.put({
      ...track,
      fileBlob
    });

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

// Get all stored tracks
export const getStoredTracks = async () => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const tracks = request.result.map(item => {
        const { fileBlob, ...meta } = item;
        return {
          ...meta,
          url: URL.createObjectURL(fileBlob)
        };
      });

      db.close();
      resolve(tracks);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

// Delete a stored track
export const deleteStoredTrack = async (id) => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.delete(id);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};
