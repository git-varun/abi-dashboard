"use client";

import { useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { AppShell } from '@/components/layout/AppShell';
import { toast } from 'sonner';

const CHAINS = [
    { id: 1, name: 'Ethereum Mainnet', symbol: 'ETH' },
    { id: 137, name: 'Polygon', symbol: 'MATIC' },
    { id: 42161, name: 'Arbitrum One', symbol: 'ETH' },
    { id: 8453, name: 'Base', symbol: 'ETH' },
    { id: 10, name: 'Optimism', symbol: 'ETH' },
    { id: 56, name: 'BNB Smart Chain', symbol: 'BNB' },
    { id: 11155111, name: 'Sepolia Testnet', symbol: 'ETH' },
];

const ENV_KEYS = [
    { label: 'ETHERSCAN_API_KEY', env: 'ETHERSCAN_API_KEY', side: 'Server', required: true },
    { label: 'ALCHEMY_API_KEY', env: 'ALCHEMY_API_KEY', side: 'Server', required: false },
    { label: 'NEXT_PUBLIC_ALCHEMY_KEY', env: 'NEXT_PUBLIC_ALCHEMY_KEY', side: 'Client', required: false },
    { label: 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', env: 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', side: 'Client', required: true },
];

export default function SettingsScreen() {
    const currentChainId = useChainId();
    const { switchChain, isPending: isSwitching } = useSwitchChain();
    const [preferredChain, setPreferredChain] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('preferred_chain');
            return stored ? Number(stored) : 1;
        }
        return 1;
    });
    const [rpcOverride, setRpcOverride] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('rpc_override') || '';
        }
        return '';
    });

    const [saved, setSaved] = useState(false);
    const [rpcError, setRpcError] = useState('');
    const [rpcValidating, setRpcValidating] = useState(false);

    const save = async () => {
        setRpcError('');
        if (rpcOverride.trim()) {
            try { new URL(rpcOverride.trim()); } catch {
                setRpcError('Invalid URL format.');
                return;
            }
            setRpcValidating(true);
            const ctrl = new AbortController();
            const tid = setTimeout(() => ctrl.abort(), 3000);
            try {
                const res = await fetch(rpcOverride.trim(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 }),
                    signal: ctrl.signal,
                });
                clearTimeout(tid);
                if (!res.ok) { setRpcError(`RPC returned HTTP ${res.status}.`); setRpcValidating(false); return; }
                const json = await res.json();
                if (!json.result) { setRpcError('RPC did not return a valid eth_chainId result.'); setRpcValidating(false); return; }
            } catch {
                clearTimeout(tid);
                setRpcError('Could not reach RPC endpoint. Check the URL or your network.');
                setRpcValidating(false);
                return;
            }
            setRpcValidating(false);
        }
        localStorage.setItem('preferred_chain', String(preferredChain));
        if (rpcOverride.trim()) {
            localStorage.setItem('rpc_override', rpcOverride.trim());
        } else {
            localStorage.removeItem('rpc_override');
        }

        if (preferredChain !== currentChainId) {
            try {
                switchChain({ chainId: preferredChain });
                toast.success(`Switching to chain ${preferredChain} — approve in your wallet`);
            } catch {
                toast.error('Chain switch failed. You can switch manually in your wallet.');
            }
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <AppShell>
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-5xl font-black uppercase tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>SETTINGS</h1>
                <p className="text-[#434656] font-medium">Configure chains, RPC endpoints, and review API key status.</p>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Chain Preference */}
                <div className="col-span-12 lg:col-span-7 bg-white border-4 border-black neo-shadow">
                    <div className="bg-black text-white p-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#c3f400]">language</span>
                        <h2 className="font-black uppercase tracking-widest">DEFAULT CHAIN</h2>
                    </div>
                    <div className="p-6 space-y-2">
                        {CHAINS.map(chain => (
                            <button
                                key={chain.id}
                                onClick={() => setPreferredChain(chain.id)}
                                className={`w-full flex items-center justify-between p-4 border-2 transition-all ${
                                    preferredChain === chain.id
                                        ? 'bg-[#c3f400] border-black neo-shadow'
                                        : 'bg-white border-black hover:bg-[#f3f3f3]'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 border-2 border-black ${preferredChain === chain.id ? 'bg-black' : 'bg-white'}`}></div>
                                    <span className="font-bold uppercase text-sm">{chain.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs text-[#737687]">ID: {chain.id}</span>
                                    <span className="text-xs font-black px-2 py-0.5 border border-black">{chain.symbol}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* RPC + API Keys */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* RPC Override */}
                    <div className="bg-white border-4 border-black neo-shadow">
                        <div className="bg-black text-white p-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#c3f400]">router</span>
                            <h2 className="font-black uppercase tracking-widest">RPC OVERRIDE</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <label className="text-xs font-black uppercase text-[#737687]">Custom RPC URL (optional)</label>
                            <input
                                value={rpcOverride}
                                onChange={e => setRpcOverride(e.target.value)}
                                placeholder="https://eth-mainnet.g.alchemy.com/v2/..."
                                className="w-full bg-white border-2 border-black p-3 font-mono text-sm focus:border-4 focus:outline-none transition-all placeholder:text-[#737687]"
                            />
                            {rpcError && (
                                <p className="text-[11px] font-bold uppercase text-[#93000a]">{rpcError}</p>
                            )}
                            {!rpcError && (
                                <p className="text-[10px] font-bold uppercase text-[#737687]">
                                    Overrides the default public RPC for read calls. Stored in localStorage.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* API Key Status */}
                    <div className="bg-white border-4 border-black neo-shadow">
                        <div className="bg-black text-white p-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#c3f400]">key</span>
                            <h2 className="font-black uppercase tracking-widest">API KEY STATUS</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            {ENV_KEYS.map(k => {
                                const isClientKey = k.env.startsWith('NEXT_PUBLIC_');
                                const value = isClientKey ? (process.env[k.env] ?? null) : null;
                                const configured = isClientKey ? !!value : true;
                                return (
                                    <div key={k.label} className="flex items-center justify-between p-3 border-2 border-black">
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs font-bold truncate">{k.label}</p>
                                            <p className="text-[10px] text-[#737687] uppercase mt-0.5">{k.side} · {k.required ? 'Required' : 'Optional'}</p>
                                        </div>
                                        <span className={`ml-3 shrink-0 px-2 py-1 text-[10px] font-black border border-black uppercase ${
                                            configured ? 'bg-[#c1f100] text-[#546b00]' : 'bg-[#ffdad6] text-[#93000a]'
                                        }`}>
                                            {configured ? (isClientKey ? 'SET' : 'SERVER') : 'MISSING'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Save */}
                    <button
                        onClick={save}
                        className={`w-full border-4 border-black neo-shadow py-4 font-black uppercase text-lg active:shadow-none active:translate-y-1 transition-all ${
                            saved ? 'bg-[#c3f400] text-[#161e00]' : 'bg-black text-white hover:bg-[#2b60ff]'
                        }`}
                    >
                        {isSwitching ? 'SWITCHING CHAIN…' : rpcValidating ? 'VALIDATING RPC…' : saved ? '✓ SAVED' : 'SAVE SETTINGS'}
                    </button>
                </div>

                {/* Info bar */}
                <div className="col-span-12 border-2 border-dashed border-black p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#2b60ff] shrink-0">info</span>
                    <p className="text-sm text-[#434656] font-medium">
                        Server-side keys (Etherscan, Alchemy) are configured via environment variables and never exposed to the client. Only <code className="font-mono text-xs bg-[#e8e8e8] px-1">NEXT_PUBLIC_</code> keys are readable here.
                    </p>
                </div>
            </div>
        </AppShell>
    );
}
