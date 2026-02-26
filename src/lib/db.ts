import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'ABIPRO_DB';
const STORE_NAME = 'history';

export async function initDB() {
    return openDB(DB_NAME, 1, {
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
    name: string; // The friendly name (e.g., "USDT" or "Mint NFT")
    abi?: string;
    hash?: string;
    chainId: number;
    timestamp: number;
};

export async function addToHistory(item: any) {
    const db = await openDB('ABIPRO_DB', 1);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const all = await store.getAll();

    if (item.type === 'contract_visit') {
        // For ABI/Contracts: Overwrite the previous ABI entry for this specific address
        const existingContract = all.find(i =>
            i.type === 'contract_visit' &&
            i.address.toLowerCase() === item.address.toLowerCase()
        );
        if (existingContract) await store.delete(existingContract.id);
    } else {
        // For Transactions: Overwrite only if the HASH is exactly the same (e.g., updating status)
        const existingTx = all.find(i =>
            i.type === 'transaction' &&
            i.hash === item.hash
        );
        if (existingTx) await store.delete(existingTx.id);
    }

    // Add the new entry (this ensures Transactions don't kill the ABI entry)
    await store.add({ ...item, timestamp: Date.now() });
    await tx.done;

    window.dispatchEvent(new Event('history-updated'));
}

export async function getAllHistory() {
    const db = await initDB();
    return db.getAllFromIndex(STORE_NAME, 'by-timestamp');
}

export async function deleteHistoryItem(id: number) {
    const db = await openDB('ABIPRO_DB', 1);
    await db.delete(STORE_NAME, id);
    window.dispatchEvent(new Event('history-updated'));
}

export async function updateHistoryName(id: number, newName: string) {
    const db = await openDB('ABIPRO_DB', 1);
    const item = await db.get(STORE_NAME, id);
    await db.put(STORE_NAME, { ...item, name: newName });
    window.dispatchEvent(new Event('history-updated'));
}