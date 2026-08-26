const DB_NAME = 'LofiOS_WallpaperDB';
const STORE_NAME = 'wallpapers';
const DB_VERSION = 1;

const initDB = () => new Promise((resolve, reject) => {
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

export const saveWallpaperBlob = async (id, name, fileBlob) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put({ id, name, fileBlob });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
};

export const getCustomWallpapers = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();

        request.onsuccess = () => {
            const wallpapers = request.result.map(({ id, name, fileBlob }) => ({
                id,
                name,
                type: 'custom',
                thumbnail: URL.createObjectURL(fileBlob),
                full: URL.createObjectURL(fileBlob),
            }));
            db.close();
            resolve(wallpapers);
        };

        request.onerror = () => { db.close(); reject(request.error); };
    });
};

export const deleteWallpaperBlob = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
};