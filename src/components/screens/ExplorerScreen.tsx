"use client";

import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace, useWorkspaceComputed } from '@/store/workspace';
import { DashboardExplorer } from '@/components/abi/dashboard/DashboardExplorer';
import { DashboardIntake } from '@/components/abi/dashboard/DashboardIntake';
import { useContractLoader } from '@/hooks/useContractLoader';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ExplorerScreen() {
    const { state, dispatch } = useWorkspace();
    const { readFunctions, writeFunctions, parsedAbi } = useWorkspaceComputed();
    const { handleFetch, handleGenerate } = useContractLoader();

    return (
        <AppShell>
            {!state.isLoaded ? (
                <>
                    <div className="mb-8">
                        <h1 className="text-5xl font-black uppercase tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>EXPLORER</h1>
                        <p className="text-[#737687] font-medium">Browse and interact with smart contract functions.</p>
                    </div>

                    {/* Tab bar skeleton */}
                    <div className="flex border-4 border-black overflow-hidden neo-shadow mb-6 opacity-40 pointer-events-none select-none">
                        <div className="flex-1 py-4 bg-black text-white font-black uppercase text-sm flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            READ FUNCTIONS
                            <span className="px-2 py-0.5 text-[10px] font-black border border-current bg-[#c3f400] text-black">—</span>
                        </div>
                        <div className="w-1 bg-black" />
                        <div className="flex-1 py-4 bg-white font-black uppercase text-sm flex items-center justify-center gap-2 text-black">
                            <span className="material-symbols-outlined text-sm">edit</span>
                            WRITE FUNCTIONS
                            <span className="px-2 py-0.5 text-[10px] font-black border border-black">—</span>
                        </div>
                    </div>

                    {/* Placeholder cards grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8 opacity-25 pointer-events-none">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-44 bg-white border-2 border-black" />
                        ))}
                    </div>

                    {/* Inline intake */}
                    <div className="border-4 border-black neo-shadow bg-white p-8">
                        <DashboardIntake onFetch={handleFetch} onGenerate={handleGenerate} />
                    </div>
                </>
            ) : (
                <ErrorBoundary>
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
