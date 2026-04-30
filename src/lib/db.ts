import { openDB } from 'idb';

const DB_NAME = 'ABIPRO_DB';
const STORE_NAME = 'history';
const DB_VERSION = 1;

export async function initDB() {
    if (typeof indexedDB === 'undefined') throw new Error('IndexedDB not available (SSR)');
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('by-timestamp', 'timestamp');
                store.createIndex('by-address', 'address');
            }
        },
    });
}

export type HistoryItem = {
    id?: number;
    type: 'transaction' | 'contract_visit';
    address: string;
    name: string;
    abi?: string;
    hash?: string;
    chainId: number;
    isProxy?: boolean;
    implementationAddress?: string;
    status?: 'pending' | 'success' | 'failed';
    error?: string;
    timestamp: number;
    pinned?: boolean;
};

export async function addToHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const all = await store.getAll();

    if (item.type === 'contract_visit') {
        const existing = all.find(i =>
            i.type === 'contract_visit' && i.address?.toLowerCase() === item.address?.toLowerCase()
        );
        if (existing) {
            // preserve pinned state across re-visits
            (item as any).pinned = existing.pinned ?? false;
            await store.delete(existing.id);
        }
    } else if (item.hash) {
        const existing = all.find(i => i.type === 'transaction' && i.hash === item.hash);
        if (existing) await store.delete(existing.id);
    }

    await store.add({ ...item, timestamp: Date.now() });
    await tx.done;
    window.dispatchEvent(new Event('history-updated'));
}

export async function getAllHistory(): Promise<HistoryItem[]> {
    const db = await initDB();
    return db.getAllFromIndex(STORE_NAME, 'by-timestamp');
}

export async function deleteHistoryItem(id: number) {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
    window.dispatchEvent(new Event('history-updated'));
}

export async function updateHistoryName(id: number, newName: string) {
    const db = await initDB();
    const item = await db.get(STORE_NAME, id);
    if (item) await db.put(STORE_NAME, { ...item, name: newName });
    window.dispatchEvent(new Event('history-updated'));
}

export async function togglePin(address: string) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const all = await store.getAll();
    const item = all.find(i => i.type === 'contract_visit' && i.address?.toLowerCase() === address.toLowerCase());
    if (item) await store.put({ ...item, pinned: !item.pinned });
    await tx.done;
    window.dispatchEvent(new Event('history-updated'));
}

export async function getPinnedContracts(): Promise<HistoryItem[]> {
    const db = await initDB();
    const all = await db.getAllFromIndex(STORE_NAME, 'by-timestamp');
    return all.filter(i => i.type === 'contract_visit' && i.pinned);
}
