"use client";

import { useEffect, useState } from 'react';
import { useWorkspace, useWorkspaceComputed } from '@/store/workspace';
import { SmartPastePill } from '@/components/inspector/SmartPastePill';
import { inspect } from '@/lib/inspector';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Props {
    onFetch: () => Promise<void>;
    onGenerate: () => void;
}

export const DashboardIntake = ({ onFetch, onGenerate }: Props) => {
    const { state, dispatch } = useWorkspace();
    const { error, diagnostics } = useWorkspaceComputed();
    const [showPill, setShowPill] = useState(false);
    const [pillValue, setPillValue] = useState('');

    useEffect(() => {
        const handler = (e: Event) => {
            const { address, abi, name } = (e as CustomEvent).detail;
            dispatch({ type: 'SET_CONTRACT', address: address ?? '', abiInput: abi ?? '', contractName: name ?? '', isProxy: false });
            toast.success('Contract restored from history');
        };
        window.addEventListener('load-contract', handler);
        return () => window.removeEventListener('load-contract', handler);
    }, [dispatch]);

    const handleAddressChange = (val: string) => {
        dispatch({ type: 'SET_ADDRESS', address: val });
        const interpretations = inspect(val);
        if (interpretations.length > 0 && val.length > 10) {
            setPillValue(val);
            setShowPill(true);
        } else {
            setShowPill(false);
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            dispatch({ type: 'SET_ABI_INPUT', abiInput: text });
        } catch { toast.error('Clipboard access denied'); }
    };

    const isReady = state.abiInput && !error;

    return (
        <div>
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-5xl font-black uppercase tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>CONTRACT SETUP</h1>
                <p className="text-[#737687] font-medium">Initialize your development environment by importing smart contract parameters and ABI definitions.</p>
            </div>

            <div className="grid grid-cols-12 gap-6 items-start">
                {/* Left: Import Parameters */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <section className="bg-white border-4 border-black neo-shadow overflow-hidden">
                        <div className="bg-black p-4">
                            <h3 className="text-white uppercase font-black text-xl">Import Parameters</h3>
                        </div>
                        <div className="p-8 space-y-4 relative">
                            {state.isFetching && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#0046dd] mb-2" />
                                    <p className="text-xs font-black uppercase tracking-widest">{state.fetchStep || 'Fetching...'}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-black">Contract Address</label>
                                <div className="flex gap-2">
                                    <input
                                        className={`flex-1 bg-white border-2 ${error ? 'border-[#ba1a1a]' : 'border-black'} p-4 font-mono text-sm focus:border-4 focus:outline-none transition-all placeholder:text-[#737687]`}
                                        placeholder="0x..."
                                        value={state.address}
                                        onChange={e => handleAddressChange(e.target.value)}
                                    />
                                    <button
                                        onClick={onFetch}
                                        disabled={state.isFetching || !state.address}
                                        className="bg-white border-2 border-black px-4 neo-shadow font-bold uppercase text-sm hover:bg-[#c3f400] disabled:opacity-40 disabled:cursor-not-allowed active:shadow-none active:translate-y-0.5 transition-all"
                                        title="Fetch ABI"
                                    >
                                        {state.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'FETCH'}
                                    </button>
                                </div>
                                {state.isProxy && (
                                    <p className="text-xs font-bold text-[#9d009d] uppercase">⬡ Proxy detected — implementation ABI loaded</p>
                                )}
                                {showPill && (
                                    <SmartPastePill value={pillValue} onDismiss={() => setShowPill(false)} />
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-black">Contract Alias</label>
                                <input
                                    className="w-full bg-white border-2 border-black p-4 font-medium text-sm focus:border-4 focus:outline-none transition-all placeholder:text-[#737687]"
                                    placeholder="e.g. TREASURY_V2"
                                    value={state.contractName}
                                    onChange={e => dispatch({ type: 'SET_CONTRACT_NAME', name: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-black bg-[#c3f400] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-black text-sm">check</span>
                                </div>
                                <span className="text-xs font-black uppercase">VERIFY ON EXPLORER AUTOMATICALLY</span>
                            </div>
                        </div>
                    </section>

                    <button
                        onClick={onGenerate}
                        disabled={!isReady || state.isFetching}
                        className={`w-full py-8 border-4 border-black font-black text-2xl uppercase flex items-center justify-center gap-4 transition-all ${
                            isReady
                                ? 'bg-[#2b60ff] text-white neo-shadow-lg hover:bg-[#0046dd] active:translate-y-1 active:shadow-none'
                                : 'bg-[#e2e2e2] text-[#737687] cursor-not-allowed'
                        }`}
                    >
                        <span>Generate Workbench</span>
                        <span className="material-symbols-outlined">bolt</span>
                    </button>

                    <div className="bg-[#eeeeee] border-2 border-black p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#0046dd]">info</span>
                        <p className="font-mono text-xs">Ensure your ABI JSON follows the standard Ethers.js or Web3.js format for optimal parsing compatibility.</p>
                    </div>
                </div>

                {/* Right: ABI Definition */}
                <div className="col-span-12 lg:col-span-7">
                    <section className="bg-white border-4 border-black neo-shadow flex flex-col">
                        <div className="bg-black p-4 flex justify-between items-center">
                            <h3 className="text-white uppercase font-black text-xl">ABI Definition</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePaste}
                                    className="bg-zinc-800 text-white px-3 py-1 text-xs font-black border border-zinc-600 hover:bg-zinc-700 uppercase"
                                >
                                    PASTE
                                </button>
                                <button
                                    onClick={() => dispatch({ type: 'SET_ABI_INPUT', abiInput: '' })}
                                    className="bg-zinc-800 text-white px-3 py-1 text-xs font-black border border-zinc-600 hover:bg-zinc-700 uppercase"
                                >
                                    CLEAR
                                </button>
                            </div>
                        </div>
                        <div className="relative flex-1">
                            <textarea
                                className={`w-full h-[400px] bg-zinc-900 text-[#c3f400] p-8 font-mono text-sm focus:outline-none resize-none border-none placeholder:text-zinc-600 ${error ? 'border-t-2 border-t-[#ba1a1a]' : ''}`}
                                placeholder={`[{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]`}
                                value={state.abiInput}
                                onChange={e => dispatch({ type: 'SET_ABI_INPUT', abiInput: e.target.value })}
                            />
                            <div className="absolute bottom-4 right-4 bg-black/60 text-zinc-400 px-2 py-1 text-[10px] font-mono uppercase">
                                {state.abiInput && !error ? '✓ JSON VALID' : 'JSON FORMAT'}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 border-t-2 border-[#ba1a1a] bg-[#ffdad6] flex items-start gap-2">
                                <span className="material-symbols-outlined text-[#ba1a1a] text-sm">error</span>
                                <div>
                                    <p className="text-xs font-black uppercase text-[#ba1a1a]">Parse Error</p>
                                    <p className="text-xs text-[#93000a]">{error}</p>
                                </div>
                            </div>
                        )}

                        {diagnostics && diagnostics.length > 0 && !error && (
                            <div className="p-4 border-t-2 border-yellow-500 bg-yellow-50">
                                <p className="text-xs font-black uppercase text-yellow-700 mb-1">Compatibility Warnings</p>
                                <ul className="list-disc pl-4 text-xs text-yellow-600 space-y-0.5">
                                    {diagnostics.map((d, i) => <li key={i}>{d}</li>)}
                                </ul>
                            </div>
                        )}
                    </section>
                </div>

                {/* Bottom: Recent Imports (static) */}
                <div className="col-span-12 mt-4">
                    <section className="bg-white border-4 border-black neo-shadow overflow-hidden">
                        <div className="bg-black p-4 flex justify-between items-center">
                            <h3 className="text-white uppercase font-black text-xl">Recent Imports</h3>
                            <span className="font-mono text-xs text-[#c3f400]">SESSION CACHE: 128KB</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-4 border-black bg-[#e8e8e8]">
                                        <th className="p-4 text-left text-xs font-black uppercase">Contract Alias</th>
                                        <th className="p-4 text-left text-xs font-black uppercase">Address</th>
                                        <th className="p-4 text-left text-xs font-black uppercase">Network</th>
                                        <th className="p-4 text-left text-xs font-black uppercase">Status</th>
                                        <th className="p-4 text-right text-xs font-black uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { alias: 'UNISWAP_V3_FACTORY', address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', network: 'MAINNET', active: true },
                                        { alias: 'TREASURY_PROXY_OVM', address: '0x4200000000000000000000000000000000000006', network: 'OPTIMISM', active: true },
                                        { alias: 'TEST_NFT_DROP', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'SEPOLIA', active: false },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b-2 border-black hover:bg-[#eeeeee] transition-colors">
                                            <td className="p-4 font-bold">{row.alias}</td>
                                            <td className="p-4 font-mono text-sm">{row.address}</td>
                                            <td className="p-4">
                                                <span className="bg-[#f3f3f3] border border-black px-2 py-1 text-xs font-black">{row.network}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${row.active ? 'bg-[#c3f400]' : 'bg-[#ba1a1a]'}`}></div>
                                                    <span className={`text-xs font-black uppercase ${row.active ? 'text-[#506600]' : 'text-[#ba1a1a]'}`}>
                                                        {row.active ? 'ACTIVE' : 'EXPIRED'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="bg-black text-white px-4 py-1 text-xs font-black hover:bg-[#2b60ff] transition-all uppercase">LOAD</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
