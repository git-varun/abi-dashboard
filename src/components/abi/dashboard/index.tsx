"use client";

import { useWorkspace, useWorkspaceComputed } from '@/store/workspace';
import Link from 'next/link';
import { DashboardIntake } from './DashboardIntake';
import { useContractLoader } from '@/hooks/useContractLoader';

export default function Dashboard() {
    const { state, dispatch } = useWorkspace();
    const { readFunctions, writeFunctions } = useWorkspaceComputed();
    const { handleFetch, handleGenerate } = useContractLoader();

    if (state.isLoaded) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-5xl font-black uppercase tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>CONTRACT SETUP</h1>
                    <p className="text-[#737687] font-medium">Contract loaded successfully. Use the tools below to interact with it.</p>
                </div>

                {/* Contract identity card */}
                <div className="bg-[#c3f400] border-4 border-black neo-shadow p-8 mb-6 flex items-center justify-between gap-6 flex-wrap">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            {state.contractName && (
                                <span className="bg-black text-[#c3f400] px-3 py-1 border-2 border-black font-black uppercase text-sm">{state.contractName}</span>
                            )}
                            {state.isProxy && (
                                <span className="bg-[#ffd7f5] text-[#380038] px-3 py-1 border-2 border-black text-xs font-black uppercase">PROXY</span>
                            )}
                        </div>
                        <p className="font-mono text-sm font-bold">{state.address}</p>
                        {state.implementationAddress && (
                            <p className="font-mono text-xs text-[#546b00]">impl: {state.implementationAddress}</p>
                        )}
                    </div>
                    <div className="flex gap-3 text-xs font-black uppercase">
                        <div className="px-4 py-3 border-2 border-black bg-white">
                            {readFunctions.length} READ
                        </div>
                        <div className="px-4 py-3 border-2 border-black bg-black text-white">
                            {writeFunctions.length} WRITE
                        </div>
                    </div>
                </div>

                {/* Navigation to tools */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/explorer"
                        className="group bg-white border-4 border-black neo-shadow p-8 flex flex-col gap-4 hover:bg-[#2b60ff] hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined text-4xl">search</span>
                        <div>
                            <h3 className="text-2xl font-black uppercase mb-1">EXPLORER</h3>
                            <p className="text-sm font-medium text-[#737687] group-hover:text-[#b7c4ff]">Browse and call read/write functions.</p>
                        </div>
                        <span className="mt-auto font-black uppercase text-sm">OPEN EXPLORER →</span>
                    </Link>

                    <Link
                        href="/debugger"
                        className="group bg-white border-4 border-black neo-shadow p-8 flex flex-col gap-4 hover:bg-black hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined text-4xl">bug_report</span>
                        <div>
                            <h3 className="text-2xl font-black uppercase mb-1">DEBUGGER</h3>
                            <p className="text-sm font-medium text-[#737687] group-hover:text-[#737687]">Simulate write transactions before broadcasting.</p>
                        </div>
                        <span className="mt-auto font-black uppercase text-sm">OPEN DEBUGGER →</span>
                    </Link>

                    <Link
                        href="/monitoring"
                        className="group bg-white border-4 border-black neo-shadow p-8 flex flex-col gap-4 hover:bg-[#c3f400] transition-all"
                    >
                        <span className="material-symbols-outlined text-4xl">analytics</span>
                        <div>
                            <h3 className="text-2xl font-black uppercase mb-1">MONITORING</h3>
                            <p className="text-sm font-medium text-[#737687]">Watch on-chain activity and events.</p>
                        </div>
                        <span className="mt-auto font-black uppercase text-sm">OPEN MONITORING →</span>
                    </Link>
                </div>

                <button
                    onClick={() => dispatch({ type: 'SET_LOADED', isLoaded: false })}
                    className="border-4 border-black bg-white neo-shadow px-8 py-4 font-black uppercase text-sm hover:bg-[#ffdad6] active:shadow-none active:translate-y-0.5 transition-all"
                >
                    ← LOAD A DIFFERENT CONTRACT
                </button>
            </div>
        );
    }

    return (
        <div>
            <DashboardIntake onFetch={handleFetch} onGenerate={handleGenerate} />
        </div>
    );
}
