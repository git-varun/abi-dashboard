"use client";

import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace, useWorkspaceComputed } from '@/store/workspace';
import { DashboardIntake } from '@/components/abi/dashboard/DashboardIntake';
import { useContractLoader } from '@/hooks/useContractLoader';
import { simulateTransaction } from '@/lib/simulate';
import { TestnetWarningModal } from '@/components/ui/TestnetWarningModal';
import type { Address } from 'viem';
import type { AbiEntry, AbiParameter } from '@/hooks/useAbiParser';

type LogLine = { time: string; text: string; color: string };

function timestamp() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}

export default function DebuggerScreen() {
    const { state } = useWorkspace();
    const { writeFunctions, parsedAbi } = useWorkspaceComputed();
    const { address: userAddress } = useAccount();
    const chainId = useChainId();
    const { handleFetch, handleGenerate } = useContractLoader();

    const [selectedFn, setSelectedFn] = useState<AbiEntry | null>(null);
    const [args, setArgs] = useState<Record<string, string>>({});
    const [logs, setLogs] = useState<LogLine[]>([
        { time: '--:--:--', text: '> DEBUGGER_READY. Load a contract and select a write function.', color: 'text-[#737687]' },
    ]);
    const [simulating, setSimulating] = useState(false);
    const [gasResult, setGasResult] = useState<{ low: string; standard: string; fast: string } | null>(null);
    const [simSuccess, setSimSuccess] = useState<boolean | null>(null);
    const [testnetWarningOpen, setTestnetWarningOpen] = useState(false);
    const [testnetConfirmed, setTestnetConfirmed] = useState(false);

    const CHAIN_NAMES: Record<number, string> = {
        1: 'Ethereum Mainnet',
        137: 'Polygon',
        42161: 'Arbitrum One',
        8453: 'Base',
        10: 'Optimism',
        56: 'BNB Smart Chain',
        11155111: 'Sepolia Testnet',
    };
    const isTestnet = chainId !== 1 && chainId !== 137 && chainId !== 42161 && chainId !== 8453 && chainId !== 10 && chainId !== 56;

    const addLog = (text: string, color = 'text-[#c3f400]') =>
        setLogs(prev => [...prev, { time: timestamp(), text, color }]);

    const handleSelectFn = (fn: AbiEntry) => {
        setSelectedFn(fn);
        setArgs({});
        setGasResult(null);
        setSimSuccess(null);
        setLogs([{ time: timestamp(), text: `> FUNCTION SELECTED: ${fn.name}`, color: 'text-[#b7c4ff]' }]);
    };

    const handleSimulate = async () => {
        if (!selectedFn || !selectedFn.name || !state.address || !userAddress) return;

        // Check for testnet and require confirmation
        if (isTestnet && !testnetConfirmed) {
            setTestnetWarningOpen(true);
            return;
        }

        setSimulating(true);
        setGasResult(null);
        setSimSuccess(null);
        addLog('> INITIALIZING SIMULATION...', 'text-[#737687]');
        addLog(`> TARGET: ${state.address}`, 'text-[#737687]');
        addLog(`> METHOD: ${selectedFn.name}`, 'text-[#737687]');

        const parsedArgs = (selectedFn.inputs ?? []).map((inp: AbiParameter) => args[inp.name ?? inp.type] ?? '');

        try {
            const result = await simulateTransaction(
                state.address as Address,
                parsedAbi ?? [],
                selectedFn.name,
                parsedArgs,
                userAddress as Address,
                chainId
            );

            if (result.success && result.gasDetails) {
                const base = parseFloat(result.gasDetails.totalNative);
                setGasResult({
                    low: (base * 0.85).toFixed(6),
                    standard: base.toFixed(6),
                    fast: (base * 1.2).toFixed(6),
                });
                setSimSuccess(true);
                addLog('> SIMULATION: SUCCESS', 'text-[#c3f400]');
                addLog(`> GAS COST (standard): ${base.toFixed(6)} ${result.gasDetails.symbol}`, 'text-[#c3f400]');
                addLog('> READY FOR BROADCAST', 'text-white');
            } else {
                setSimSuccess(false);
                addLog(`> SIMULATION FAILED: ${result.reason}`, 'text-[#ba1a1a]');
            }
        } catch (e: unknown) {
            setSimSuccess(false);
            const message = e instanceof Error ? e.message : 'Unknown error';
            addLog(`> ERROR: ${message}`, 'text-[#ba1a1a]');
        } finally {
            setSimulating(false);
        }
    };

    if (!state.isLoaded) {
        return (
            <AppShell>
                <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tight" style={{ letterSpacing: '-0.02em' }}>DEBUGGER</h1>
                        <p className="text-[#737687] font-medium mt-1">Simulate and debug smart contract write functions.</p>
                    </div>
                    <div className="flex gap-2 text-xs font-bold uppercase opacity-40">
                        <div className="px-3 py-2 border-2 border-black bg-white">— WRITE FNS</div>
                        <div className="px-3 py-2 border-2 border-black bg-[#e2e2e2]">WALLET: —</div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Function list skeleton */}
                    <div className="col-span-12 lg:col-span-3 bg-white border-4 border-black neo-shadow opacity-40 pointer-events-none">
                        <div className="bg-black text-white p-3 border-b-2 border-black">
                            <span className="font-black uppercase text-xs tracking-widest">WRITE FUNCTIONS</span>
                        </div>
                        <div className="p-3 space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-10 bg-[#e2e2e2] border-2 border-black" />
                            ))}
                        </div>
                    </div>

                    {/* Input + log skeleton */}
                    <div className="col-span-12 lg:col-span-6 space-y-6 opacity-40 pointer-events-none">
                        <div className="bg-white border-4 border-black neo-shadow">
                            <div className="bg-black text-white p-3 border-b-2 border-black">
                                <span className="font-black uppercase text-xs tracking-widest">SELECT A FUNCTION</span>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="h-10 bg-[#e2e2e2] border-2 border-black" />
                                <div className="h-10 bg-[#e2e2e2] border-2 border-black" />
                                <div className="h-12 bg-[#e2e2e2] border-2 border-black" />
                            </div>
                        </div>
                        <div className="bg-black border-4 border-black neo-shadow" style={{ minHeight: '160px' }}>
                            <div className="border-b-2 border-[#333] p-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#737687]" />
                                <span className="text-[#737687] font-mono text-xs uppercase">SIMULATION_LOG</span>
                            </div>
                            <div className="p-4 font-mono text-xs text-[#555]">
                                <p>&gt; DEBUGGER_READY. Load a contract to begin.</p>
                            </div>
                        </div>
                    </div>

                    {/* Gas skeleton */}
                    <div className="col-span-12 lg:col-span-3 opacity-40 pointer-events-none">
                        <div className="bg-white border-4 border-black neo-shadow">
                            <div className="bg-black text-white p-3 border-b-2 border-black flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#c3f400] text-sm">local_gas_station</span>
                                <span className="font-black uppercase text-xs tracking-widest">GAS ESTIMATION</span>
                            </div>
                            <div className="p-4 space-y-2">
                                {['LOW', 'MARKET', 'FAST'].map(label => (
                                    <div key={label} className="border-2 border-black p-4 flex justify-between items-center">
                                        <p className="font-black text-sm uppercase">{label}</p>
                                        <p className="font-black text-sm font-mono text-[#737687]">—</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inline intake */}
                <div className="mt-6 border-4 border-black neo-shadow bg-white p-8">
                    <DashboardIntake onFetch={handleFetch} onGenerate={handleGenerate} />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            {/* Header */}
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#0046dd] text-white px-3 py-1 border-2 border-black font-mono text-sm">
                            {state.address?.slice(0, 8)}...{state.address?.slice(-4)}
                        </span>
                        {state.contractName && (
                            <span className="bg-[#c3f400] text-[#161e00] px-3 py-1 border-2 border-black text-xs font-black uppercase">{state.contractName}</span>
                        )}
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tight" style={{ letterSpacing: '-0.02em' }}>DEBUGGER</h1>
                </div>
                <div className="flex gap-2 text-xs font-bold uppercase">
                    <div className="px-3 py-2 border-2 border-black bg-white">{writeFunctions.length} WRITE FNS</div>
                    {userAddress && <div className="px-3 py-2 border-2 border-black bg-[#c3f400]">WALLET: {userAddress.slice(0, 6)}…{userAddress.slice(-4)}</div>}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Function Selector */}
                <div className="col-span-12 lg:col-span-3 bg-white border-4 border-black neo-shadow">
                    <div className="bg-black text-white p-3 border-b-2 border-black">
                        <span className="font-black uppercase text-xs tracking-widest">WRITE FUNCTIONS</span>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: '520px' }}>
                        {writeFunctions.length === 0 ? (
                            <p className="p-4 text-xs text-[#737687] uppercase font-bold">No write functions found.</p>
                        ) : (
                            writeFunctions.map(fn => (
                                <button
                                    key={fn.name}
                                    onClick={() => handleSelectFn(fn)}
                                    className={`w-full text-left p-3 border-b-2 border-black font-mono text-xs transition-colors ${
                                        selectedFn?.name === fn.name ? 'bg-[#c3f400]' : 'hover:bg-[#f3f3f3]'
                                    }`}
                                >
                                    <span className="font-bold">{fn.name}</span>
                                    <span className="block text-[10px] text-[#737687] mt-0.5 uppercase">
                                        {(fn.inputs ?? []).length} input{(fn.inputs ?? []).length !== 1 ? 's' : ''}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Inputs + Simulation Log */}
                <div className="col-span-12 lg:col-span-6 space-y-6">
                    {/* Input Parameters */}
                    <div className="bg-white border-4 border-black neo-shadow">
                        <div className="bg-black text-white p-3 border-b-2 border-black flex justify-between items-center">
                            <span className="font-black uppercase text-xs tracking-widest">
                                {selectedFn ? `METHOD: ${selectedFn.name}` : 'SELECT A FUNCTION'}
                            </span>
                        </div>
                        
                        {/* Pre-Simulation Gas Estimate Banner */}
                        {selectedFn && !gasResult && (
                            <div className="bg-[#e6ff00] border-b-2 border-black p-4">
                                <div className="flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#0046dd] text-lg">local_gas_station</span>
                                        <div>
                                            <p className="text-xs font-black uppercase text-[#0046dd]">Estimated Gas</p>
                                            <p className="text-sm font-bold text-black">~2-3M gas • Run simulation for exact cost</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-[#0046dd] uppercase">TBD</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="p-6 space-y-4">
                            {!selectedFn ? (
                                <p className="text-xs text-[#737687] uppercase font-bold">← Choose a write function from the list.</p>
                            ) : (selectedFn.inputs ?? []).length === 0 ? (
                                <p className="text-xs text-[#737687] uppercase font-bold">No inputs required.</p>
                            ) : (
                                (selectedFn.inputs ?? []).map((inp: AbiParameter) => (
                                    <div key={inp.name ?? inp.type} className="space-y-1">
                                        <label className="text-xs font-black uppercase text-[#737687]">{inp.name ?? inp.type} ({inp.type})</label>
                                        <input
                                            value={args[inp.name ?? inp.type] ?? ''}
                                            onChange={e => setArgs(prev => ({ ...prev, [inp.name ?? inp.type]: e.target.value }))}
                                            placeholder={inp.type === 'address' ? '0x...' : inp.type.includes('uint') ? '0' : '...'}
                                            className="w-full bg-white border-2 border-black p-3 font-mono text-sm focus:border-4 focus:outline-none transition-all placeholder:text-[#737687]"
                                        />
                                    </div>
                                ))
                            )}

                            <button
                                onClick={handleSimulate}
                                disabled={!selectedFn || simulating || !userAddress}
                                className="w-full bg-[#2b60ff] text-white border-2 border-black neo-shadow py-4 font-black uppercase text-sm hover:bg-[#0046dd] disabled:opacity-40 disabled:cursor-not-allowed active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                {simulating ? (
                                    <><span className="material-symbols-outlined text-sm animate-spin">refresh</span> SIMULATING...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-sm">play_arrow</span> RUN SIMULATION</>
                                )}
                            </button>
                            {!userAddress && (
                                <p className="text-xs text-[#ba1a1a] font-bold uppercase text-center">Connect wallet to simulate</p>
                            )}
                        </div>
                    </div>

                    {/* Simulation Log */}
                    <div className="bg-black border-4 border-black neo-shadow flex flex-col" style={{ minHeight: '240px' }}>
                        <div className="border-b-2 border-[#333] p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${simulating ? 'bg-[#c3f400] animate-pulse' : simSuccess === true ? 'bg-[#c3f400]' : simSuccess === false ? 'bg-[#ba1a1a]' : 'bg-[#737687]'}`}></div>
                                <span className="text-[#c3f400] font-mono text-xs uppercase">SIMULATION_LOG</span>
                            </div>
                            <button onClick={() => setLogs([])} className="text-[#737687] hover:text-white text-[10px] font-mono uppercase">CLEAR</button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-1 font-mono text-xs">
                            {logs.map((l, i) => (
                                <p key={i} className={l.color}>
                                    <span className="text-[#555]">[{l.time}]</span> {l.text}
                                </p>
                            ))}
                            {simulating && <p className="text-[#c3f400] animate-pulse">_</p>}
                        </div>
                    </div>
                </div>

                {/* Gas Estimation */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <div className="bg-white border-4 border-black neo-shadow">
                        <div className="bg-black text-white p-3 border-b-2 border-black flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#c3f400] text-sm">local_gas_station</span>
                            <span className="font-black uppercase text-xs tracking-widest">GAS ESTIMATION</span>
                        </div>
                        <div className="p-4 space-y-2">
                            {[
                                { label: 'LOW', sub: '~2 min', value: gasResult?.low, bg: 'hover:bg-[#f3f3f3]' },
                                { label: 'MARKET', sub: '~30 sec', value: gasResult?.standard, bg: 'bg-[#c1f100] border-4' },
                                { label: 'FAST', sub: '~12 sec', value: gasResult?.fast, bg: 'hover:bg-[#f3f3f3]' },
                            ].map(tier => (
                                <div key={tier.label} className={`border-2 border-black p-4 cursor-pointer transition-all ${tier.bg}`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-black text-sm uppercase">{tier.label}</p>
                                            <p className="text-xs text-[#737687]">{tier.sub}</p>
                                        </div>
                                        <p className="font-black text-sm font-mono">{tier.value ?? '—'}</p>
                                    </div>
                                </div>
                            ))}
                            {!gasResult && (
                                <p className="text-[10px] text-[#737687] font-bold uppercase text-center pt-2">Run simulation to estimate gas</p>
                            )}
                        </div>
                    </div>

                    {/* Tenderly Link */}
                    {state.address && (
                        <a
                            href={`https://dashboard.tenderly.co/simulator/new?contractAddress=${state.address}&network=${chainId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full border-4 border-black bg-white neo-shadow p-4 text-center font-black uppercase text-sm hover:bg-[#c3f400] active:shadow-none active:translate-y-0.5 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm mr-1">open_in_new</span>
                            OPEN IN TENDERLY
                        </a>
                    )}
                </div>
            </div>

            {/* Testnet Warning Modal */}
            <TestnetWarningModal
                isOpen={testnetWarningOpen}
                onConfirm={() => {
                    setTestnetConfirmed(true);
                    setTestnetWarningOpen(false);
                    // Trigger simulation after confirmation
                    setTimeout(() => handleSimulate(), 100);
                }}
                onCancel={() => {
                    setTestnetWarningOpen(false);
                    setTestnetConfirmed(false);
                }}
                chainName={CHAIN_NAMES[chainId] || `Chain ${chainId}`}
                action="simulate a transaction"
            />
        </AppShell>
    );
}
