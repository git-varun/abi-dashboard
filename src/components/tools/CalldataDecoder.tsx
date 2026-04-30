"use client";

import { useState } from 'react';
import { decodeFunctionData } from 'viem';
import { useWorkspace } from '@/store/workspace';
import { useWorkspaceComputed } from '@/store/workspace';
import { Copy, Check, AlertCircle } from 'lucide-react';

export function CalldataDecoder() {
    const { state } = useWorkspace();
    const { parsedAbi } = useWorkspaceComputed();
    const [calldata, setCalldata] = useState('');
    const [result, setResult] = useState<{ functionName: string; args: readonly unknown[] } | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const decode = () => {
        setError(''); setResult(null);
        if (!calldata.trim()) { setError('Paste calldata to decode'); return; }
        const abi = parsedAbi ?? [];
        if (abi.length === 0) { setError('Load a contract ABI first to decode calldata'); return; }
        try {
            const decoded = decodeFunctionData({ abi, data: calldata as `0x${string}` });
            setResult(decoded as any);
        } catch (e: any) {
            setError(e?.message?.split('\n')[0] ?? 'Decoding failed — ABI mismatch?');
        }
    };

    const copy = async (text: string) => {
        try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
    };

    const formatted = result ? JSON.stringify({ function: result.functionName, args: result.args }, (_k, v) => typeof v === 'bigint' ? v.toString() : v, 2) : '';

    return (
        <div className="space-y-3">
            {!parsedAbi && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-[10px] text-yellow-400">
                    Load a contract ABI in the explorer first to decode its calldata.
                </div>
            )}

            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Raw Calldata</label>
                <textarea
                    value={calldata}
                    onChange={e => setCalldata(e.target.value)}
                    placeholder="0xa9059cbb000000000000..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/8 bg-black/60 p-3 font-mono text-[11px] text-zinc-300 outline-none focus:border-blue-500/40"
                />
            </div>

            <button
                onClick={decode}
                className="h-9 w-full rounded-xl bg-blue-600 text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-700"
            >
                Decode
            </button>

            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-[10px] text-red-400">
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                    {error}
                </div>
            )}

            {result && (
                <div className="rounded-xl border border-white/5 bg-black/40 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Decoded</span>
                        <button onClick={() => copy(formatted)} className="text-zinc-600 hover:text-white">
                            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                    </div>
                    <p className="font-mono text-[11px] text-blue-400">{result.functionName}()</p>
                    {result.args && result.args.length > 0 && (
                        <pre className="max-h-48 overflow-auto rounded-lg bg-black/30 p-2 font-mono text-[10px] text-zinc-300 leading-relaxed">
                            {formatted}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}
