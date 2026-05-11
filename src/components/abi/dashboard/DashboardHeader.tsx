"use client";

import { useWorkspace } from '@/store/workspace';
import { useWorkspaceComputed } from '@/store/workspace';
import { useChainId, useAccount } from 'wagmi';
import { getExplorerAddressUrl } from '@/lib/chain';
import { ShieldAlert, ExternalLink, AlertTriangle } from 'lucide-react';

export const DashboardHeader = () => {
    const { state } = useWorkspace();
    const { diagnostics } = useWorkspaceComputed();
    const chainId = useChainId();
    const { isConnected } = useAccount();

    // Only show after a contract is loaded or address is entered
    if (!state.address && !state.contractName) return null;

    return (
        <div className="glass rounded-2xl p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    {/* Contract identity */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/20 font-black text-blue-400">
                        {(state.contractName || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-[15px] font-black text-white">{state.contractName || 'Unknown Contract'}</h2>
                            {state.isProxy && (
                                <span className="flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-400">
                                    <ShieldAlert className="h-2.5 w-2.5" /> Proxy
                                </span>
                            )}
                        </div>
                        {state.address && (
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="font-mono text-[10px] text-zinc-600">{state.address}</p>
                                <a href={getExplorerAddressUrl(chainId, state.address)} target="_blank" className="text-zinc-700 hover:text-zinc-400 transition-colors">
                                    <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                            </div>
                        )}
                        {state.isProxy && state.implementationAddress && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-600">
                                <span>Logic:</span>
                                <span className="font-mono">{state.implementationAddress?.slice(0, 18)}...</span>
                                <a href={getExplorerAddressUrl(chainId, state.implementationAddress!)} target="_blank" className="hover:text-zinc-300">
                                    <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Network mismatch warning */}
                {!isConnected && state.isLoaded && (
                    <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-[10px] text-yellow-400">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        Connect wallet to execute write functions
                    </div>
                )}
            </div>

            {diagnostics && diagnostics.length > 0 && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-yellow-500/15 bg-yellow-500/5 px-3 py-2 text-[10px] text-yellow-400">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {diagnostics.length} ABI compatibility warning{diagnostics.length > 1 ? 's' : ''} — check the intake area
                </div>
            )}
        </div>
    );
};
