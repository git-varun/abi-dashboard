import {AlertCircle, ExternalLink, Copy} from "lucide-react";
import {useState} from "react";
import { useChainId } from 'wagmi';

const EXPLORER_TX: Record<number, string> = {
    1: 'https://etherscan.io/tx/',
    11155111: 'https://sepolia.etherscan.io/tx/',
    137: 'https://polygonscan.com/tx/',
    56: 'https://bscscan.com/tx/',
    42161: 'https://arbiscan.io/tx/',
    10: 'https://optimistic.etherscan.io/tx/'
};

export const CardOutput = ({readData, hash, error, getExplorerUrl, isLoading}: any) => {
    const [copied, setCopied] = useState<string | null>(null);
    const chainId = useChainId();
    if (!readData && !hash && !error && !isLoading) return null;

    if (isLoading && !readData && !hash) {
        return (
            <div className="w-full space-y-2 rounded-xl border border-zinc-800 bg-black/30 p-4 font-mono text-[11px] animate-pulse">
                <div className="h-4 w-1/3 rounded bg-zinc-800" />
                <div className="h-8 w-full rounded bg-zinc-800" />
                <div className="h-4 w-1/2 rounded bg-zinc-800" />
            </div>
        );
    }

    const doCopy = async (text: string, key: string) => {
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // fallback
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
            }
            setCopied(key);
            setTimeout(() => setCopied(null), 2000);
        } catch (e) {
            setCopied(null);
        }
    };

    return (
        <div className="w-full space-y-2 rounded-xl border border-zinc-800 bg-black/50 p-4 font-mono text-[11px]">
            {readData !== undefined && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-[9px] uppercase font-bold">Output</span>
                        <button aria-label="Copy output" onClick={() => doCopy(String(readData), 'output')} className="text-zinc-400 hover:text-zinc-200">
                            <Copy className="h-3 w-3"/>
                        </button>
                    </div>
                    <pre className="text-blue-400 break-all leading-relaxed whitespace-pre-wrap max-h-40 overflow-auto">
                        {typeof readData === 'bigint'
                            ? readData.toString()
                            : (typeof readData === 'object'
                                ? (() => {
                                    try {
                                        return JSON.stringify(readData, (_k, v) => typeof v === 'bigint' ? v.toString() : v, 2);
                                    } catch (e) {
                                        return String(readData);
                                    }
                                })()
                                : String(readData))}
                    </pre>
                    {copied === 'output' && <div className="text-[10px] text-emerald-400">Copied</div>}
                </div>
            )}
            {hash && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-[9px] uppercase font-bold">Transaction</span>
                        <div className="flex items-center gap-2">
                            <button aria-label="Copy tx hash" onClick={() => doCopy(hash, 'tx')} className="text-zinc-400 hover:text-zinc-200">
                                <Copy className="h-3 w-3"/>
                            </button>
                            {(() => {
                                const url = typeof getExplorerUrl === 'function'
                                    ? getExplorerUrl(hash)
                                    : (EXPLORER_TX[chainId] ? `${EXPLORER_TX[chainId]}${hash}` : `https://etherscan.io/tx/${hash}`);
                                return (
                                    <a href={url} target="_blank" rel="noreferrer"
                                       className="text-orange-400 flex items-center gap-1 hover:text-orange-300">
                                        <span className="truncate">{hash}</span>
                                        <ExternalLink className="h-3 w-3 shrink-0"/>
                                    </a>
                                );
                            })()}
                        </div>
                    </div>
                    {copied === 'tx' && <div className="text-[10px] text-emerald-400">Copied</div>}
                </div>
            )}
            {error && (
                <div className="flex items-start gap-2 text-red-500 pt-1">
                    <AlertCircle className="h-3 w-3 mt-0.5"/>
                    <p>{error.message?.split('.')[0] || "Action failed"}</p>
                </div>
            )}
        </div>
    );
};