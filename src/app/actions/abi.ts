"use server";

import { createPublicClient, http, Address } from 'viem';
import { getAlchemySubdomain } from '@/lib/chain';

const ETHERSCAN_V2_URL = 'https://api.etherscan.io/v2/api';

// EIP-1967 proxy storage slots
const PROXY_SLOTS = [
    '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', // EIP-1967 implementation
    '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50', // EIP-1967 beacon (fixed)
    '0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3', // Legacy OpenZeppelin
];

async function getImplementationFromStorage(address: string, chainId: number): Promise<string | null> {
    const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
    if (!ALCHEMY_KEY) return null;

    const subdomain = getAlchemySubdomain(chainId);
    const rpcUrl = `https://${subdomain}.g.alchemy.com/v2/${ALCHEMY_KEY}`;
    const client = createPublicClient({ transport: http(rpcUrl) });

    try {
        const storageResults = await Promise.all(
            PROXY_SLOTS.map(slot => client.getStorageAt({ address: address as Address, slot: slot as `0x${string}` }))
        );
        for (const storage of storageResults) {
            if (storage && storage !== `0x${'0'.repeat(64)}`) {
                const impl = `0x${storage.slice(-40)}`;
                if (/^0x[0-9a-fA-F]{40}$/.test(impl) && impl !== '0x0000000000000000000000000000000000000000') {
                    return impl;
                }
            }
        }
    } catch { /* ignore */ }
    return null;
}

export async function fetchUniversalAbi(address: string, chainId: number) {
    const API_KEY = process.env.ETHERSCAN_API_KEY ?? '';

    const buildUrl = (params: Record<string, string>) => {
        const qp = new URLSearchParams({ ...params, apikey: API_KEY, chainid: String(chainId) });
        return `${ETHERSCAN_V2_URL}?${qp.toString()}`;
    };

    try {
        const [metaRes, probedImpl] = await Promise.all([
            fetch(buildUrl({ module: 'contract', action: 'getsourcecode', address })).then(r => r.json()),
            getImplementationFromStorage(address, chainId),
        ]);

        const meta = metaRes.result?.[0] ?? {};
        let targetAddress = address;

        if (probedImpl) {
            targetAddress = probedImpl;
        } else {
            for (const key of ['Implementation', 'ImplementationAddress', 'ProxyImplementation']) {
                if (meta[key] && /^0x[0-9a-fA-F]{40}$/.test(meta[key])) {
                    targetAddress = meta[key];
                    break;
                }
            }
        }

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

        return { success: false, error: 'Contract not verified on this network' };
    } catch {
        return { success: false, error: 'Network or provider error' };
    }
}
