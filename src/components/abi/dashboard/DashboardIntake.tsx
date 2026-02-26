"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Loader2, Terminal, RefreshCcw, ClipboardPaste,
    Tag, AlertCircle, Info, CheckCircle2, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

interface DashboardIntakeProps {
    address: string;
    setAddress: (val: string) => void;
    contractName: string;
    setContractName: (val: string) => void;
    abiInput: string;
    setAbiInput: (val: string) => void;
    onFetch: () => Promise<void>;
    onGenerate: () => void;
    isFetching: boolean;
    fetchStep?: string;
    error: string | null;
    diagnostics?: string[];
    isProxy?: boolean; // New prop from your optimized fetch logic
}

export const DashboardIntake = ({
    address,
    setAddress,
    contractName,
    setContractName,
    abiInput,
    setAbiInput,
    onFetch,
    onGenerate,
    isFetching,
    fetchStep,
    error,
    diagnostics,
    isProxy
}: DashboardIntakeProps) => {

    useEffect(() => {
        const handleLoadHistory = (event: any) => {
            const { address: savedAddress, abi: savedAbi, name: savedName } = event.detail;
            setAddress(savedAddress);
            setContractName(savedName || "");
            if (savedAbi) setAbiInput(savedAbi);
            toast.success("Project loaded from database");
        };

        window.addEventListener('load-contract', handleLoadHistory);
        return () => window.removeEventListener('load-contract', handleLoadHistory);
    }, [setAddress, setAbiInput, setContractName]);

    return (
        <div className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">

            {/* 1. PROGRESS OVERLAY (Enhanced for Deep Probes) */}
            {isFetching && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="relative">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            <div className="absolute inset-0 blur-xl bg-blue-500/20" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-black uppercase tracking-widest text-white">
                                {fetchStep || 'Initializing...'}
                            </p>
                            <p className="text-[10px] text-zinc-500 max-w-[200px]">
                                Probing storage slots and verifying source code via Alchemy.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-blue-500" /> Contract Setup
                </h2>
            </div>

            <div className="space-y-5">
                {/* Identifier Field */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <Tag className="h-3 w-3" /> Identifier / Alias
                    </label>
                    <input
                        className="w-full rounded-xl border border-zinc-800 bg-black p-3 font-mono text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500/50"
                        placeholder="e.g., MyTestToken"
                        value={contractName}
                        onChange={(e) => setContractName(e.target.value)}
                    />
                </div>

                {/* Address Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Contract Address</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                className={`w-full rounded-xl border ${error ? 'border-red-500/50' : 'border-zinc-800'} bg-black p-4 font-mono text-sm text-blue-400 outline-none focus:ring-2 focus:ring-blue-500/20`}
                                placeholder="0x..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            {isProxy && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2 py-1 border border-purple-500/20">
                                    <ShieldAlert className="h-3 w-3 text-purple-400" />
                                    <span className="text-[9px] font-black text-purple-400 uppercase">Proxy</span>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            className="h-auto border-zinc-800 bg-zinc-900 px-6 hover:bg-zinc-800"
                            onClick={onFetch}
                            disabled={isFetching || !address}
                        >
                            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* ABI Input & Diagnostics */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">ABI JSON</label>
                        <button
                            onClick={() => navigator.clipboard.readText().then(setAbiInput)}
                            className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 uppercase font-bold transition-colors"
                        >
                            <ClipboardPaste className="h-3 w-3" /> Paste
                        </button>
                    </div>

                    <textarea
                        className={`h-48 w-full rounded-xl border ${error ? 'border-red-500/50' : 'border-zinc-800'} bg-black p-4 font-mono text-[11px] outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all`}
                        placeholder="Paste contract ABI here..."
                        value={abiInput}
                        onChange={(e) => setAbiInput(e.target.value)}
                    />

                    {/* ERROR STATE */}
                    {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase leading-none">Parser Error</p>
                                <p className="text-[10px] opacity-80">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* DIAGNOSTICS (Soft Warnings) */}
                    {diagnostics && diagnostics.length > 0 && !error && (
                        <div className="flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-yellow-500">
                            <Info className="h-4 w-4 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase leading-none">Compatibility Warnings</p>
                                <ul className="list-disc pl-3 text-[10px] opacity-80">
                                    {diagnostics.map((d, i) => <li key={i}>{d}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Button
                className={`h-14 w-full rounded-xl text-lg font-black tracking-tighter transition-all ${
                    abiInput && !error
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
                onClick={onGenerate}
                disabled={!abiInput || !!error || isFetching}
            >
                {abiInput && !error ? <CheckCircle2 className="mr-2 h-5 w-5" /> : null}
                GENERATE INTERFACE
            </Button>
        </div>
    );
};