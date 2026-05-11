"use client";

import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace, useWorkspaceComputed } from '@/store/workspace';
import { DashboardIntake } from '@/components/abi/dashboard/DashboardIntake';
import { DashboardExplorer } from '@/components/abi/dashboard/DashboardExplorer';
import { useContractLoader } from '@/hooks/useContractLoader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Link from 'next/link';

export default function WorkspaceScreen() {
    const { state, dispatch } = useWorkspace();
    const { readFunctions, writeFunctions, parsedAbi } = useWorkspaceComputed();
    const { handleFetch, handleGenerate } = useContractLoader();

    return (
        <AppShell>
            {!state.isLoaded ? (
                <DashboardIntake onFetch={handleFetch} onGenerate={handleGenerate} />
            ) : (
                <ErrorBoundary>
                    {/* Contract identity bar */}
                    <div className="bg-[#c3f400] border-4 border-black neo-shadow p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 flex-wrap">
                            {state.contractName && (
                                <span className="bg-black text-[#c3f400] px-3 py-1 border-2 border-black font-black uppercase text-sm">{state.contractName}</span>
                            )}
                            {state.isProxy && (
                                <span className="bg-[#ffd7f5] text-[#380038] px-3 py-1 border-2 border-black text-xs font-black uppercase">PROXY</span>
                            )}
                            <span className="font-mono text-sm font-bold">{state.address}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex gap-2 text-xs font-black uppercase">
                                <span className="px-3 py-2 border-2 border-black bg-white">{readFunctions.length} READ</span>
                                <span className="px-3 py-2 border-2 border-black bg-black text-white">{writeFunctions.length} WRITE</span>
                            </div>
                            <Link
                                href="/debugger"
                                className="px-3 py-2 border-2 border-black bg-white text-xs font-black uppercase hover:bg-[#2b60ff] hover:text-white transition-colors"
                            >
                                DEBUGGER →
                            </Link>
                            <Link
                                href="/events"
                                className="px-3 py-2 border-2 border-black bg-white text-xs font-black uppercase hover:bg-[#2b60ff] hover:text-white transition-colors"
                            >
                                EVENTS →
                            </Link>
                            <button
                                onClick={() => dispatch({ type: 'SET_LOADED', isLoaded: false })}
                                className="px-3 py-2 border-2 border-black bg-white text-xs font-black uppercase hover:bg-[#ffdad6] transition-colors"
                            >
                                ← RESET
                            </button>
                        </div>
                    </div>

                    {/* Contract Metadata Bar */}
                    <div className="bg-white border-2 border-black neo-shadow p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#2b60ff] text-lg">info</span>
                                <div>
                                    <p className="text-xs font-black uppercase text-subtle">Contract Info</p>
                                    <p className="text-sm font-bold">{readFunctions.length + writeFunctions.length} functions • {state.isProxy ? '⚠ Upgradeable' : 'Non-upgradeable'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-xs font-bold">
                            {state.isProxy && (
                                <span className="px-2 py-1 border border-orange-500 bg-orange-50 text-orange-700 uppercase">
                                    <span className="material-symbols-outlined text-sm align-middle">warning</span>
                                    Proxy Detected
                                </span>
                            )}
                            <span className="px-2 py-1 border border-[#2b60ff] bg-[#dde1ff] text-[#001552] uppercase">
                                <span className="material-symbols-outlined text-sm align-middle">verified</span>
                                Ready to Interact
                            </span>
                        </div>
                    </div>

                    <DashboardExplorer
                        readFunctions={readFunctions}
                        writeFunctions={writeFunctions}
                        abi={parsedAbi ?? []}
                        onReset={() => dispatch({ type: 'SET_LOADED', isLoaded: false })}
                    />
                </ErrorBoundary>
            )}
        </AppShell>
    );
}
