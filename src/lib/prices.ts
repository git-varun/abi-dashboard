type PriceCache = { value: number; timestamp: number };
const cache: Record<string, PriceCache> = {};
const TTL = 60_000;

const COINGECKO_IDS: Record<string, string> = {
    ETH: 'ethereum',
    MATIC: 'matic-network',
    BNB: 'binancecoin',
    OP: 'optimism',
    ARB: 'arbitrum',
};

export async function getNativePriceInUSD(symbol: string): Promise<number> {
    const id = COINGECKO_IDS[symbol] ?? 'ethereum';
    const cached = cache[id];
    if (cached && Date.now() - cached.timestamp < TTL) return cached.value;

    try {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
        const data = await res.json();
        const price = data[id]?.usd ?? 0;
        cache[id] = { value: price, timestamp: Date.now() };
        return price;
    } catch {
        return cached?.value ?? 0;
    }
}

export async function getNativePriceInINR(symbol: string): Promise<number> {
    const id = COINGECKO_IDS[symbol] ?? 'ethereum';
    const cacheKey = `${id}_inr`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < TTL) return cached.value;

    try {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=inr`);
        const data = await res.json();
        const price = data[id]?.inr ?? 0;
        cache[cacheKey] = { value: price, timestamp: Date.now() };
        return price;
    } catch {
        return cached?.value ?? 0;
    }
}
