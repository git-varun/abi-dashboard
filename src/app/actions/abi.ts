"use server";

import { createPublicClient, http, Address } from 'viem';

// Universal Etherscan V2 Endpoint
const ETHERSCAN_V2_URL = 'https://api.etherscan.io/v2/api';

const PROXY_SLOTS = [
    '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', // EIP-1967
    '0xa3f1a04773087391372a04C2bab4745156567206b04d51be', // Beacon
    '0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3', // Legacy OZ
];

/**
 * Robustly identify the implementation address using Alchemy storage probing.
 */
async function getImplementationFromStorage(address: string, chainId: number): Promise<string | null> {
    const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;

    // Mapping for Alchemy Subdomains
    const networkMap: Record<number, string> = {
        1: 'eth-mainnet',
        11155111: 'eth-sepolia',
        137: 'polygon-mainnet',
        10: 'opt-mainnet',
        42161: 'arb-mainnet',
        8453: 'base-mainnet'
    };

    const subdomain = networkMap[chainId] || 'eth-mainnet';
    const rpcUrl = `https://${subdomain}.g.alchemy.com/v2/${ALCHEMY_KEY}`;

    const client = createPublicClient({ transport: http(rpcUrl) });

    try {
        const storageResults = await Promise.all(
            PROXY_SLOTS.map(slot => client.getStorageAt({
                address: address as Address,
                slot: slot as `0x${string}`
            }))
        );

        for (const storage of storageResults) {
            if (storage && storage !== '0x' + '0'.repeat(64)) {
                const impl = `0x${storage.slice(-40)}`;
                if (/^0x[0-9a-fA-F]{40}$/.test(impl)) return impl;
            }
        }
    } catch (e) { return null; }
    return null;
}

export async function fetchUniversalAbi(address: string, chainId: number) {
    const API_KEY = process.env.ETHERSCAN_API_KEY || '';

    // Helper to build V2 URL with required chainid param
    const buildUrl = (params: Record<string, string>) => {
        const qp = new URLSearchParams({
            ...params,
            apikey: API_KEY,
            chainid: String(chainId)
        });
        return `${ETHERSCAN_V2_URL}?${qp.toString()}`;
    };

    try {
        // 1) Step 1: Parallel Fetch - Metadata and Alchemy Storage Probe
        const [metaRes, probedImpl] = await Promise.all([
            fetch(buildUrl({ module: 'contract', action: 'getsourcecode', address })).then(r => r.json()),
            getImplementationFromStorage(address, chainId)
        ]);

        const meta = metaRes.result?.[0] || {};
        let targetAddress = address;

        // 2) Detect Proxy: Alchemy Storage Probe takes priority over Metadata
        if (probedImpl) {
            targetAddress = probedImpl;
        } else {
            const keys = ['Implementation', 'ImplementationAddress', 'ProxyImplementation'];
            for (const key of keys) {
                if (meta[key] && /^0x[0-9a-fA-F]{40}$/.test(meta[key])) {
                    targetAddress = meta[key];
                    break;
                }
            }
        }

        // 3) Step 2: Fetch ABI for the finalized target (Proxy or Implementation)
        const abiRes = await fetch(buildUrl({ module: 'contract', action: 'getabi', address: targetAddress }));
        const abiData = await abiRes.json();

        if (abiData.status === '1' || abiData.status === 1) {
            return {
                success: true,
                abi: typeof abiData.result === 'string' ? abiData.result : JSON.stringify(abiData.result),
                contractName: meta.ContractName || 'Unknown',
                implementationAddress: targetAddress !== address ? targetAddress : undefined,
                isProxy: targetAddress !== address,
            };
        }

        return { success: false, error: 'Contract not verified' };
    } catch (err) {
        return { success: false, error: 'Network or Provider Error' };
    }
}