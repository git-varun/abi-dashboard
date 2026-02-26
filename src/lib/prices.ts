export async function getNativePriceInINR(symbol: string) {
    try {
        // Using a free API like CoinGecko
        const idMap: Record<string, string> = { ETH: 'ethereum', MATIC: 'matic-network', BNB: 'binancecoin' };
        const id = idMap[symbol] || 'ethereum';

        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=inr`);
        const data = await res.json();
        return data[id].inr;
    } catch {
        return 0; // Fallback
    }
}