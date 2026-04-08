'use client';

import { openDB } from 'idb';
import { DB_NAME, STORE_NAME, DB_VERSION } from './constants';

/**
 * Get or create the IndexedDB database
 */
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('createdAt', 'createdAt');
      }
    },
  });
}

/**
 * Save a packaged capture to IndexedDB
 * @param {string} name - Filename of the zip
 * @param {Blob} blob - The zip blob
 * @param {object} metadata - The metadata object
 * @returns {Promise<number>} The generated ID
 */
export async function saveCapture(name, blob, metadata) {
  const db = await getDB();

  // Calculate a summary for list display
  const firstGeo = metadata.captures?.[0]?.sensor_data?.geo;
  const summary = {
    latitude: firstGeo?.latitude ?? null,
    longitude: firstGeo?.longitude ?? null,
    accuracy: firstGeo?.accuracy ?? null,
  };

  const id = await db.add(STORE_NAME, {
    name,
    blob,
    sizeBytes: blob.size,
    summary,
    captureCount: metadata.captures?.length ?? 0,
    createdAt: Date.now(),
  });

  return id;
}

/**
 * Retrieve all saved captures (without blobs for listing)
 * @returns {Promise<Array>}
 */
export async function getAllCaptures() {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  // Sort newest first
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Get a single capture by ID (includes blob for download)
 * @param {number} id
 * @returns {Promise<object|undefined>}
 */
export async function getCapture(id) {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

/**
 * Delete a capture by ID
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteCapture(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

/**
 * Get total storage used by all captures
 * @returns {Promise<number>} Total bytes
 */
export async function getTotalStorageUsed() {
  const all = await getAllCaptures();
  return all.reduce((total, item) => total + (item.sizeBytes || 0), 0);
}

/**
 * Get count of all captures
 * @returns {Promise<number>}
 */
export async function getCaptureCount() {
  const db = await getDB();
  return db.count(STORE_NAME);
}

/**
 * Trigger a download of a blob as a file
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  
  // Cleanup after a short delay
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
