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

export const getHistory = (): HistoryItem[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('abi_pro_history') || '[]');
};

export const saveToHistory = (item: HistoryItem) => {
    const existing = JSON.parse(localStorage.getItem('abi_pro_history') || '[]');

    // Prevent duplicate contract visits for the same address
    const filtered = existing.filter((i: HistoryItem) =>
        !(i.type === 'contract_visit' && i.address.toLowerCase() === item.address.toLowerCase())
    );

    const updated = [item, ...filtered].slice(0, 30);
    localStorage.setItem('abi_pro_history', JSON.stringify(updated));
    window.dispatchEvent(new Event('history-updated'));
};