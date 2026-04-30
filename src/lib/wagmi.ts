import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { SUPPORTED_CHAINS, getAlchemySubdomain } from './chain';

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!ALCHEMY_KEY) {
    console.warn('NEXT_PUBLIC_ALCHEMY_KEY not set — falling back to public RPCs.');
}

// G-03: read preferred chain from localStorage
let preferredChain: (typeof SUPPORTED_CHAINS)[number] | undefined;
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('preferred_chain');
    if (stored) {
        const chainId = parseInt(stored, 10);
        if (!isNaN(chainId)) {
            preferredChain = SUPPORTED_CHAINS.find(c => c.id === chainId);
        }
    }
}

// G-04: read RPC override from localStorage
let rpcOverride: string | null = null;
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('rpc_override');
    if (stored) {
        try { new URL(stored); rpcOverride = stored; } catch { /* malformed — ignore */ }
    }
}

const transports: Record<number, ReturnType<typeof http>> = {};
if (ALCHEMY_KEY) {
    for (const chain of SUPPORTED_CHAINS) {
        const subdomain = getAlchemySubdomain(chain.id);
        if (subdomain) {
            transports[chain.id] = http(`https://${subdomain}.g.alchemy.com/v2/${ALCHEMY_KEY}`);
        }
    }
}

// G-04: inject custom transport for preferred chain if rpcOverride is set
if (rpcOverride && preferredChain) {
    transports[preferredChain.id] = http(rpcOverride);
}

export const config = getDefaultConfig({
    appName: 'ABI Workbench',
    projectId: WALLET_CONNECT_PROJECT_ID ?? '',
    chains: SUPPORTED_CHAINS as any,
    ssr: true,
    ...(preferredChain ? { initialChain: preferredChain } : {}),
    transports: Object.keys(transports).length ? transports : undefined,
});
