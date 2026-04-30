"use client";

import { FunctionCard } from '../card';
import type { AbiEntry } from '@/hooks/useAbiParser';
import { useWorkspace } from '@/store/workspace';
import { useState } from 'react';

interface Props {
    readFunctions: AbiEntry[];
    writeFunctions: AbiEntry[];
    abi: AbiEntry[];
    onReset: () => void;
}

export const DashboardExplorer = ({ readFunctions, writeFunctions, abi, onReset }: Props) => {
    const { state } = useWorkspace();
    const [tab, setTab] = useState<'read' | 'write'>('read');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase mb-2">FUNCTION_EXPLORER</h1>
                    <div className="flex items-center gap-3">
                        <span className="bg-[#0046dd] text-white px-3 py-1 border-2 border-black font-mono text-sm">
                            {state.address?.slice(0, 8)}...{state.address?.slice(-4)}
                        </span>
                        {state.contractName && (
                            <span className="bg-[#c3f400] text-[#161e00] px-3 py-1 border-2 border-black text-xs font-black uppercase">
                                {state.contractName}
                            </span>
                        )}
                        {state.isProxy && (
                            <span className="bg-[#ffd7f5] text-[#380038] px-3 py-1 border-2 border-black text-xs font-black uppercase">PROXY</span>
                        )}
                    </div>
                </div>
                <button
                    onClick={onReset}
                    className="bg-white border-2 border-black px-4 py-2 neo-shadow font-bold uppercase text-sm hover:bg-[#c3f400] active:shadow-none active:translate-y-0.5 transition-all"
                >
                    ← RESET
                </button>
            </div>

            {/* Tab selector */}
            <div className="flex border-4 border-black overflow-hidden neo-shadow">
                <button
                    onClick={() => setTab('read')}
                    className={`flex-1 py-4 font-black uppercase text-sm flex items-center justify-center gap-2 transition-colors ${
                        tab === 'read' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#f3f3f3]'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    READ FUNCTIONS
                    <span className={`px-2 py-0.5 text-[10px] font-black border border-current ${tab === 'read' ? 'bg-[#c3f400] text-black border-[#c3f400]' : ''}`}>
                        {readFunctions.length}
                    </span>
                </button>
                <div className="w-1 bg-black"></div>
                <button
                    onClick={() => setTab('write')}
                    className={`flex-1 py-4 font-black uppercase text-sm flex items-center justify-center gap-2 transition-colors ${
                        tab === 'write' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#f3f3f3]'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    WRITE FUNCTIONS
                    <span className={`px-2 py-0.5 text-[10px] font-black border border-current ${tab === 'write' ? 'bg-[#c3f400] text-black border-[#c3f400]' : ''}`}>
                        {writeFunctions.length}
                    </span>
                </button>
            </div>

            {/* Tab header bar */}
            {tab === 'read' && (
                <div className="bg-black text-white p-3 border-2 border-black flex justify-between items-center">
                    <span className="text-xs font-black uppercase">1. Read Functions — View-only, no gas required</span>
                    <span className="material-symbols-outlined text-sm">visibility</span>
                </div>
            )}
            {tab === 'write' && (
                <div className="bg-[#0046dd] text-white p-3 border-2 border-black flex justify-between items-center">
                    <span className="text-xs font-black uppercase">2. Write Functions — Requires wallet signature</span>
                    <span className="material-symbols-outlined text-sm">edit</span>
                </div>
            )}

            {/* Function cards grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tab === 'read' && (
                    readFunctions.length === 0
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-44 bg-[#eeeeee] border-2 border-black animate-pulse" />
                        ))
                        : readFunctions.map((f, i) => (
                            <div key={i} id={`fn-${f.name}`} className="bg-white border-2 border-black neo-shadow hover:-translate-y-0.5 hover:neo-shadow-lg transition-all">
                                <FunctionCard func={f} abi={abi} address={state.address as `0x${string}`} isWrite={false} />
                            </div>
                        ))
                )}
                {tab === 'write' && (
                    writeFunctions.length === 0
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-44 bg-[#eeeeee] border-2 border-black animate-pulse" />
                        ))
                        : writeFunctions.map((f, i) => (
                            <div key={i} id={`fn-${f.name}`} className="write-card bg-white border-2 border-black neo-shadow hover:-translate-y-0.5 transition-all">
                                <FunctionCard func={f} abi={abi} address={state.address as `0x${string}`} isWrite={true} />
                            </div>
                        ))
                )}
            </div>

            {/* Terminal */}
            <div className="mt-8 border-t-4 border-black pt-8">
                <div className="bg-black border-2 border-black neo-shadow overflow-hidden">
                    <div className="bg-zinc-800 p-2 flex items-center justify-between border-b-2 border-black">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="font-mono text-zinc-400 text-xs uppercase tracking-widest">System Logs — Node v18</span>
                    </div>
                    <div className="p-4 h-48 overflow-y-auto font-mono text-sm text-[#c3f400] bg-black space-y-1">
                        <p><span className="text-zinc-600">[ready]</span> <span className="text-white">ABI loaded:</span> {readFunctions.length + writeFunctions.length} functions</p>
                        <p><span className="text-zinc-600">[info]</span> <span className="text-[#b7c4ff]">Read:</span> {readFunctions.length} view/pure functions</p>
                        <p><span className="text-zinc-600">[info]</span> <span className="text-[#ffabf3]">Write:</span> {writeFunctions.length} state-modifying functions</p>
                        <p><span className="text-zinc-600">[ready]</span> Workbench active. Use tabs above to interact.</p>
                        <p className="animate-pulse">_</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
