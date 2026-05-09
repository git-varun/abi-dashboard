"use client";

import { useState, useEffect, useRef } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace, useWorkspaceComputed } from '@/store/workspace';
import { DashboardIntake } from '@/components/abi/dashboard/DashboardIntake';
import { useContractLoader } from '@/hooks/useContractLoader';
import Link from 'next/link';
import type { AbiEntry } from '@/hooks/useAbiParser';

type LogEntry = {
    id: string;
    eventName: string;
    args: Record<string, string>;
    blockNumber: bigint;
    transactionHash: string;
    timestamp: number;
};

function formatArg(val: unknown): string {
    if (typeof val === 'bigint') return val.toString();
    if (typeof val === 'string') return val;
    if (val === null || val === undefined) return '—';
    try { return JSON.stringify(val, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)); }
    catch { return String(val); }
}

export default function EventsScreen() {
    const { state } = useWorkspace();
    const { parsedAbi } = useWorkspaceComputed();
    const { handleFetch, handleGenerate } = useContractLoader();
    const publicClient = usePublicClient();
    const chainId = useChainId();

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [watching, setWatching] = useState(false);
    const [filter, setFilter] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<string>('ALL');
    const unsubRef = useRef<(() => void) | null>(null);

    const eventAbi = (parsedAbi ?? []).filter((e: AbiEntry) => e.type === 'event');

    const start = () => {
        if (!publicClient || !state.address || eventAbi.length === 0) return;
        stop();
        setLogs([]);
        setWatching(true);

        const abiToWatch = selectedEvent === 'ALL'
            ? eventAbi
            : eventAbi.filter(e => e.name === selectedEvent);

        const unsub = publicClient.watchContractEvent({
            address: state.address as `0x${string}`,
            abi: abiToWatch as any,
            onLogs: (incoming: any[]) => {
                const entries: LogEntry[] = incoming.map(log => ({
                    id: `${log.transactionHash}-${log.logIndex}`,
                    eventName: log.eventName ?? '?',
                    args: Object.fromEntries(
                        Object.entries(log.args ?? {}).map(([k, v]) => [k, formatArg(v)])
                    ),
                    blockNumber: log.blockNumber ?? 0n,
                    transactionHash: log.transactionHash ?? '',
                    timestamp: Date.now(),
                }));
                setLogs(prev => [...entries, ...prev].slice(0, 200));
            },
        });
        unsubRef.current = unsub;
    };

    const stop = () => {
        unsubRef.current?.();
        unsubRef.current = null;
        setWatching(false);
    };

    useEffect(() => () => { unsubRef.current?.(); }, []);

    if (!state.isLoaded) {
        return (
            <AppShell>
                <div className="mb-8">
                    <h1 className="text-5xl font-black uppercase tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>EVENTS</h1>
                    <p className="text-[#737687] font-medium">Watch contract events in real-time. Load a contract first.</p>
                </div>

                {/* Skeleton preview */}
                <div className="grid grid-cols-12 gap-6 mb-8 opacity-25 pointer-events-none select-none">
                    <div className="col-span-12 lg:col-span-3 bg-white border-4 border-black neo-shadow">
                        <div className="bg-black p-3"><span className="text-white font-black uppercase text-xs">EVENTS</span></div>
                        <div className="p-3 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 bg-[#e2e2e2] border-2 border-black" />)}</div>
                    </div>
                    <div className="col-span-12 lg:col-span-9 bg-black border-4 border-black neo-shadow h-64" />
                </div>

                <div className="border-4 border-black neo-shadow bg-white p-8">
                    <DashboardIntake onFetch={handleFetch} onGenerate={handleGenerate} />
                </div>
            </AppShell>
        );
    }

    const filteredLogs = logs.filter(log => {
        if (filter === '') return true;
        const q = filter.toLowerCase();
        return log.eventName.toLowerCase().includes(q) ||
            log.transactionHash.toLowerCase().includes(q) ||
            Object.values(log.args).some(v => v.toLowerCase().includes(q));
    });

    return (
        <AppShell>
            {/* Header */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#0046dd] text-white px-3 py-1 border-2 border-black font-mono text-sm">
                            {state.address?.slice(0, 8)}...{state.address?.slice(-4)}
                        </span>
                        {state.contractName && (
                            <span className="bg-[#c3f400] text-[#161e00] px-3 py-1 border-2 border-black text-xs font-black uppercase">{state.contractName}</span>
                        )}
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tight" style={{ letterSpacing: '-0.02em' }}>EVENTS</h1>
                </div>
                <div className="flex gap-3 items-start flex-wrap">
                    <div className="px-3 py-2 border-2 border-black bg-white text-xs font-black uppercase">
                        {eventAbi.length} EVENT TYPES
                    </div>
                    <div className={`px-3 py-2 border-2 border-black text-xs font-black uppercase flex items-center gap-2 ${watching ? 'bg-[#c3f400]' : 'bg-white'}`}>
                        <span className={`w-2 h-2 rounded-full ${watching ? 'bg-black animate-pulse' : 'bg-[#737687]'}`}></span>
                        {watching ? 'WATCHING' : 'IDLE'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Event selector */}
                <div className="col-span-12 lg:col-span-3 bg-white border-4 border-black neo-shadow">
                    <div className="bg-black text-white p-3 border-b-2 border-black">
                        <span className="font-black uppercase text-xs tracking-widest">EVENT TYPES</span>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                        {[{ name: 'ALL' }, ...eventAbi].map(e => (
                            <button
                                key={e.name}
                                onClick={() => setSelectedEvent(e.name ?? 'ALL')}
                                className={`w-full text-left p-3 border-b-2 border-black font-mono text-xs transition-colors ${
                                    selectedEvent === e.name ? 'bg-[#c3f400]' : 'hover:bg-[#f3f3f3]'
                                }`}
                            >
                                <span className="font-bold">{e.name}</span>
                                {e.name !== 'ALL' && (
                                    <span className="block text-[10px] text-[#737687] mt-0.5 uppercase">
                                        {((e as AbiEntry).inputs ?? []).length} args
                                    </span>
                                )}
                            </button>
                        ))}
                        {eventAbi.length === 0 && (
                            <p className="p-4 text-xs text-[#737687] uppercase font-bold">No events in ABI.</p>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="p-3 border-t-4 border-black space-y-2">
                        <button
                            onClick={watching ? stop : start}
                            disabled={eventAbi.length === 0}
                            className={`w-full py-3 border-2 border-black font-black uppercase text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:shadow-none active:translate-y-0.5 ${
                                watching
                                    ? 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ba1a1a] hover:text-white'
                                    : 'bg-[#2b60ff] text-white hover:bg-[#0046dd]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">{watching ? 'stop' : 'play_arrow'}</span>
                            {watching ? 'STOP' : 'WATCH'}
                        </button>
                        <button
                            onClick={() => setLogs([])}
                            className="w-full py-2 border-2 border-black bg-white font-black uppercase text-xs hover:bg-[#f3f3f3] transition-colors"
                        >
                            CLEAR LOG
                        </button>
                    </div>
                </div>

                {/* Live event log */}
                <div className="col-span-12 lg:col-span-9 flex flex-col">
                    <div className="bg-black border-4 border-black neo-shadow flex flex-col flex-1" style={{ minHeight: '480px' }}>
                        <div className="border-b-2 border-[#333] p-3 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${watching ? 'bg-[#c3f400] animate-pulse' : 'bg-[#737687]'}`}></div>
                                <span className="text-[#c3f400] font-mono text-xs uppercase">
                                    EVENT_STREAM — {filteredLogs.length} EVENTS
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 py-1">
                                <span className="material-symbols-outlined text-[14px] text-zinc-500">search</span>
                                <input
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                    placeholder="FILTER..."
                                    className="bg-transparent border-none outline-none text-white font-mono text-xs w-40 placeholder:text-zinc-600 uppercase"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto font-mono text-xs p-4 space-y-2">
                            {filteredLogs.length === 0 ? (
                                <p className="text-zinc-500">
                                    {watching
                                        ? '> LISTENING FOR EVENTS...'
                                        : '> PRESS WATCH TO START MONITORING EVENTS'}
                                </p>
                            ) : (
                                filteredLogs.map(log => (
                                    <div key={log.id} className="border border-[#333] p-3 space-y-1 hover:border-[#c3f400] transition-colors">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <span className="text-[#c3f400] font-black">{log.eventName}</span>
                                            <div className="flex items-center gap-3 text-[#737687]">
                                                <span>BLOCK #{log.blockNumber.toString()}</span>
                                                <span>[{new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}]</span>
                                            </div>
                                        </div>
                                        {Object.entries(log.args).length > 0 && (
                                            <div className="pl-2 border-l-2 border-[#333] space-y-0.5">
                                                {Object.entries(log.args).map(([k, v]) => (
                                                    <p key={k} className="text-zinc-400">
                                                        <span className="text-[#b7c4ff]">{k}</span>: {v}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-zinc-600 text-[10px] truncate">
                                            TX: {log.transactionHash}
                                        </p>
                                    </div>
                                ))
                            )}
                            {watching && <p className="text-[#c3f400] animate-pulse">_</p>}
                        </div>
                    </div>

                    {/* Info bar */}
                    <div className="mt-3 border-2 border-dashed border-black p-3 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#2b60ff] shrink-0 text-sm">info</span>
                        <p className="text-xs text-[#434656] font-medium">
                            Uses viem <code className="font-mono text-xs bg-[#e8e8e8] px-1">watchContractEvent</code> over WebSocket RPC. Events are captured from new blocks only — not historical. Chain: {chainId}.{' '}
                            <Link href="/workspace" className="text-[#2b60ff] underline">Load a different contract</Link>
                        </p>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
