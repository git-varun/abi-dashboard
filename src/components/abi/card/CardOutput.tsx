"use client";

import { useState } from 'react';
import { AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { useChainId } from 'wagmi';
import { getExplorerTxUrl } from '@/lib/chain';
import { ValueInspector } from '@/components/inspector/ValueInspector';

function formatReadData(data: unknown): string {
    if (typeof data === 'bigint') return data.toString();
    if (typeof data === 'object' && data !== null) {
        try {
            return JSON.stringify(data, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
        } catch {
            return String(data);
        }
    }
    return String(data);
}

export const CardOutput = ({ readData, hash, error, isLoading }: { readData?: unknown; hash?: string; error?: Error | null; isLoading?: boolean }) => {
    const [copied, setCopied] = useState<string | null>(null);
    const chainId = useChainId();

    if (!readData && !hash && !error && !isLoading) return null;

    if (isLoading && !readData && !hash) {
        return (
            <div className="w-full space-y-2 border-2 border-black bg-[#f3f3f3] p-4 font-mono text-[11px] animate-pulse">
                <div className="h-3 w-1/3 bg-[#e2e2e2]" />
                <div className="h-6 w-full bg-[#e2e2e2]" />
            </div>
        );
    }

    const doCopy = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        } catch { /* ignore */ }
    };

    return (
        <div className="w-full space-y-3 border-2 border-black bg-[#f3f3f3] p-3 font-mono text-[11px]">
            {readData !== undefined && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#737687]">Output</span>
                        <button onClick={() => doCopy(formatReadData(readData), 'output')} className="text-[#737687] transition-colors hover:text-black">
                            {copied === 'output' ? <Check className="h-3 w-3 text-[#506600]" /> : <Copy className="h-3 w-3" />}
                        </button>
                    </div>
                    <pre className="max-h-40 overflow-auto break-all leading-relaxed whitespace-pre-wrap text-[#0046dd]">
                        <ValueInspector value={readData}>
                            {formatReadData(readData)}
                        </ValueInspector>
                    </pre>
                </div>
            )}

            {hash && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#737687]">TX Hash</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => doCopy(hash, 'tx')} className="text-[#737687] transition-colors hover:text-black">
                                {copied === 'tx' ? <Check className="h-3 w-3 text-[#506600]" /> : <Copy className="h-3 w-3" />}
                            </button>
                            <a href={getExplorerTxUrl(chainId, hash)} target="_blank" rel="noreferrer" className="text-[#737687] transition-colors hover:text-black">
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                    <p className="truncate text-[#9d009d]">{hash}</p>
                </div>
            )}

            {error && (
                <div className="flex items-start gap-2 text-[#ba1a1a]">
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                    <p className="text-[10px]">{error.message?.split('.')[0] ?? 'Action failed'}</p>
                </div>
            )}
        </div>
    );
};
