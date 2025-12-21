/**
 * File System Access API utility for unlimited gallery storage
 * Only works in Chrome/Edge 86+
 * Falls back to localStorage in unsupported browsers
 */

/**
 * Check if File System Access API is supported
 * @returns {boolean}
 */
export const isFileSystemSupported = () => {
    return 'showDirectoryPicker' in window;
};

/**
 * Request directory access from user
 * @returns {Promise<FileSystemDirectoryHandle|null>}
 */
export const requestDirectoryAccess = async () => {
    try {
        const directoryHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'pictures'
        });
        console.log('[FileSystem] Directory access granted:', directoryHandle.name);
        return directoryHandle;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('[FileSystem] User cancelled folder selection');
        } else {
            console.error('[FileSystem] Error requesting directory access:', error);
        }
        return null;
    }
};


// IndexedDB for persisting directory handle
const DB_NAME = 'PhotoboothDB';
const STORE_NAME = 'fileSystem';
const HANDLE_KEY = 'directoryHandle';

/**
 * Open IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
};

/**
 * Save directory handle to IndexedDB for persistence across sessions
 * @param {FileSystemDirectoryHandle} handle
 */
export const saveDirectoryHandle = async (handle) => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise((resolve, reject) => {
            const request = store.put(handle, HANDLE_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log('[FileSystem] Directory handle saved to IndexedDB');
        db.close();
    } catch (error) {
        console.error('[FileSystem] Error saving directory handle:', error);
    }
};

/**
 * Get stored directory handle from IndexedDB
 * @returns {Promise<FileSystemDirectoryHandle|null>}
 */
export const getStoredDirectoryHandle = async () => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const handle = await new Promise((resolve, reject) => {
            const request = store.get(HANDLE_KEY);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        db.close();

        if (handle) {
            // Verify we still have permission
            const hasPermission = await verifyPermission(handle);
            if (hasPermission) {
                console.log('[FileSystem] Loaded directory handle from IndexedDB');
                return handle;
            } else {
                console.log('[FileSystem] Permission denied for stored handle');
                return null;
            }
        }

        return null;
    } catch (error) {
        console.error('[FileSystem] Error loading directory handle:', error);
        return null;
    }
};

/**
 * Save image to directory
 * @param {string} dataUrl - Base64 image data URL
 * @param {FileSystemDirectoryHandle} directoryHandle
 * @returns {Promise<boolean>}
 */
export const saveImageToDirectory = async (dataUrl, directoryHandle) => {
    try {
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `photobooth_${timestamp}.png`;

        // Create file
        const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();

        // Convert data URL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // Write blob to file
        await writable.write(blob);
        await writable.close();

        console.log('[FileSystem] Image saved:', filename);
        return true;
    } catch (error) {
        console.error('[FileSystem] Error saving image:', error);
        return false;
    }
};

/**
 * Load all images from directory
 * @param {FileSystemDirectoryHandle} directoryHandle
 * @returns {Promise<string[]>} Array of data URLs
 */
export const loadImagesFromDirectory = async (directoryHandle) => {
    try {
        const images = [];

        // Iterate through all files in directory
        for await (const entry of directoryHandle.values()) {
            if (entry.kind === 'file' && entry.name.startsWith('photobooth_') && entry.name.endsWith('.png')) {
                try {
                    const file = await entry.getFile();
                    const dataUrl = await fileToDataUrl(file);
                    images.push(dataUrl);
                } catch (error) {
                    console.error('[FileSystem] Error reading file:', entry.name, error);
                }
            }
        }

        // Sort by filename (timestamp) in descending order (newest first)
        images.sort().reverse();

        console.log(`[FileSystem] Loaded ${images.length} images from directory`);
        return images;
    } catch (error) {
        console.error('[FileSystem] Error loading images:', error);
        return [];
    }
};

/**
 * Convert File to data URL
 * @param {File} file
 * @returns {Promise<string>}
 */
const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Clear all images from directory
 * @param {FileSystemDirectoryHandle} directoryHandle
 * @returns {Promise<number>} Number of files deleted
 */
export const clearDirectory = async (directoryHandle) => {
    try {
        let deletedCount = 0;

        // Collect all photobooth files
        const filesToDelete = [];
        for await (const entry of directoryHandle.values()) {
            if (entry.kind === 'file' && entry.name.startsWith('photobooth_') && entry.name.endsWith('.png')) {
                filesToDelete.push(entry.name);
            }
        }

        // Delete all files
        for (const filename of filesToDelete) {
            try {
                await directoryHandle.removeEntry(filename);
                deletedCount++;
            } catch (error) {
                console.error('[FileSystem] Error deleting file:', filename, error);
            }
        }

        console.log(`[FileSystem] Deleted ${deletedCount} images from directory`);
        return deletedCount;
    } catch (error) {
        console.error('[FileSystem] Error clearing directory:', error);
        return 0;
    }
};

/**
 * Verify directory access permission
 * @param {FileSystemDirectoryHandle} directoryHandle
 * @returns {Promise<boolean>}
 */
export const verifyPermission = async (directoryHandle) => {
    try {
        const options = { mode: 'readwrite' };

        // Check if permission was already granted
        if ((await directoryHandle.queryPermission(options)) === 'granted') {
            return true;
        }

        // Request permission
        if ((await directoryHandle.requestPermission(options)) === 'granted') {
            return true;
        }

        return false;
    } catch (error) {
        console.error('[FileSystem] Error verifying permission:', error);
        return false;
    }
};
