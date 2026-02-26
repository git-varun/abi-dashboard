"use client";

import {ConnectButton} from "@rainbow-me/rainbowkit";
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useChainId, useAccount } from 'wagmi';

export const DashboardHeader = ({
    diagnostics,
    contractName,
    isProxy,
    implementationAddress,
    address
}: { diagnostics?: string[]; contractName?: string; isProxy?: boolean; implementationAddress?: string; address?: string }) => {
    return (
        <header className="mb-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl sm:flex-row">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 font-bold shadow-lg shadow-blue-500/20 text-white">A</div>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-white">{contractName || 'Unknown'}</h1>
                        {isProxy && (
                            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-purple-400 border border-purple-500/20">
                                Proxy Detected
                            </span>
                        )}
                    </div>

                    {isProxy && implementationAddress && (
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500">
                            <span className="font-mono">Logic: {implementationAddress}</span>
                            <a href={`https://etherscan.io/address/${implementationAddress}`} target="_blank" className="hover:text-white transition-colors">
                                <ExternalLink size={10} />
                            </a>
                        </div>
                    )}

                    <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-1">V2.0 STABLE</p>

                    {diagnostics && diagnostics.length > 0 && (
                        <div className="mt-2 flex items-start gap-2 rounded-md border border-yellow-700/20 bg-yellow-900/5 px-3 py-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            <div className="text-[11px] text-yellow-200">
                                <div className="font-bold text-yellow-300">ABI Warnings ({diagnostics.length})</div>
                                <div className="text-xs text-yellow-200">Hover to inspect in the intake area</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="shrink-0 min-h-10">
                <ConnectButton accountStatus="address" showBalance={false} chainStatus="icon" />
            </div>
        </header>
    );
};

export const NetworkStatus = ({ contractChainId }: { contractChainId?: number }) => {
    const currentChainId = useChainId();
    const { isConnected } = useAccount();

    // If a contract is loaded from history, check for mismatch
    const isMismatch = isConnected && contractChainId && currentChainId !== contractChainId;

    if (!isMismatch) return null;

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 animate-pulse">
            <AlertTriangle size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Network Mismatch: Wallet is on {currentChainId}, but Contract is on {contractChainId}</span>
        </div>
    );
};