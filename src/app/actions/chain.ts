'use server';

import { CHAIN_ALCHEMY_SUBDOMAIN } from '@/lib/chain';

export type LatestBlock = {
    blockNumber: number;
    txCount: number;
    gasUsedRatio: number;
    timestamp: number;
};

export async function getLatestBlock(chainId: number): Promise<LatestBlock | null> {
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) return null;

    const subdomain = CHAIN_ALCHEMY_SUBDOMAIN[chainId] ?? 'eth-mainnet';
    const url = `https://${subdomain}.g.alchemy.com/v2/${apiKey}`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBlockByNumber', params: ['latest', false], id: 1 }),
            next: { revalidate: 12 },
        });
        if (!res.ok) return null;
        const json = await res.json();
        const block = json.result;
        if (!block) return null;

        const gasUsed = parseInt(block.gasUsed, 16);
        const gasLimit = parseInt(block.gasLimit, 16);

        return {
            blockNumber: parseInt(block.number, 16),
            txCount: Array.isArray(block.transactions) ? block.transactions.length : 0,
            gasUsedRatio: gasLimit > 0 ? gasUsed / gasLimit : 0,
            timestamp: parseInt(block.timestamp, 16),
        };
    } catch {
        return null;
    }
}
