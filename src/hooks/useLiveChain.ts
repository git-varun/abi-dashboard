"use client";

import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';
import { getNativePriceInUSD } from '@/lib/prices';

export type GasData = { slow: string; standard: string; fast: string };

export type LiveChainData = {
    blockNumber: bigint | null;
    gasData: GasData | null;
    ethPriceUsd: number | null;
    isNewBlock: boolean;
};

const client = createPublicClient({ chain: mainnet, transport: http() });

export function useLiveChain(): LiveChainData {
    const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
    const [gasData, setGasData] = useState<GasData | null>(null);
    const [ethPriceUsd, setEthPriceUsd] = useState<number | null>(null);
    const [isNewBlock, setIsNewBlock] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchChain = async () => {
            try {
                const [block, gasPrice] = await Promise.all([
                    client.getBlockNumber(),
                    client.getGasPrice(),
                ]);
                if (cancelled) return;

                setBlockNumber(prev => {
                    if (prev !== null && block > prev) setIsNewBlock(true);
                    return block;
                });

                const gwei = parseFloat(formatUnits(gasPrice, 9));
                setGasData({
                    slow: (gwei * 0.85).toFixed(1),
                    standard: gwei.toFixed(1),
                    fast: (gwei * 1.2).toFixed(1),
                });
            } catch { /* ignore */ }
        };

        const fetchPrice = async () => {
            const price = await getNativePriceInUSD('ETH');
            if (!cancelled && price) setEthPriceUsd(price);
        };

        fetchChain();
        fetchPrice();

        const chainInterval = setInterval(fetchChain, 12_000);
        const priceInterval = setInterval(fetchPrice, 60_000);

        return () => {
            cancelled = true;
            clearInterval(chainInterval);
            clearInterval(priceInterval);
        };
    }, []);

    // Reset isNewBlock flash after 1.5s
    useEffect(() => {
        if (!isNewBlock) return;
        const t = setTimeout(() => setIsNewBlock(false), 1500);
        return () => clearTimeout(t);
    }, [isNewBlock]);

    return { blockNumber, gasData, ethPriceUsd, isNewBlock };
}
