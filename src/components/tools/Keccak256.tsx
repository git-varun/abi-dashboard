"use client";

import { useState } from 'react';
import { keccak256 } from 'viem';
import { Copy, Check, Hash } from 'lucide-react';

type Mode = 'utf8' | 'hex';

export function Keccak256() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<Mode>('utf8');
    const [copied, setCopied] = useState(false);

    const compute = (): string => {
        if (!input.trim()) return '';
        try {
            if (mode === 'utf8') {
                const bytes = new TextEncoder().encode(input);
                return keccak256(bytes);
            } else {
                const hex = input.startsWith('0x') ? input : `0x${input}`;
                return keccak256(hex as `0x${string}`);
            }
        } catch { return 'Invalid input'; }
    };

    const result = compute();

    const copy = async () => {
        if (!result || result === 'Invalid input') return;
        try { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
    };

    // Common ABI signatures
    const presets = [
        'Transfer(address,address,uint256)',
        'Approval(address,address,uint256)',
        'transfer(address,uint256)',
        'balanceOf(address)',
    ];

    return (
        <div className="space-y-3">
            <div className="flex gap-1 rounded-lg border border-white/5 bg-black/30 p-1">
                {(['utf8', 'hex'] as Mode[]).map(m => (
                    <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-md py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${mode === m ? 'bg-white/8 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
                        {m === 'utf8' ? 'String' : 'Hex'}
                    </button>
                ))}
            </div>

            <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={mode === 'utf8' ? 'Transfer(address,address,uint256)' : '0xdeadbeef...'}
                rows={3}
                className="w-full resize-none rounded-xl border border-white/8 bg-black/60 p-3 font-mono text-[11px] text-zinc-300 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
            />

            {result && (
                <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                            <Hash className="h-2.5 w-2.5" /> keccak256
                        </span>
                        <button onClick={copy} className="text-zinc-600 hover:text-white">
                            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                    </div>
                    <p className={`break-all font-mono text-[11px] leading-relaxed ${result === 'Invalid input' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {result}
                    </p>
                    {result && result !== 'Invalid input' && (
                        <p className="mt-1.5 text-[9px] text-zinc-600">
                            Selector: <span className="text-zinc-400">{result.slice(0, 10)}</span>
                        </p>
                    )}
                </div>
            )}

            {/* Presets */}
            <div>
                <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-700">Common Signatures</p>
                <div className="space-y-1">
                    {presets.map(p => (
                        <button key={p} onClick={() => { setMode('utf8'); setInput(p); }} className="w-full truncate rounded-lg border border-white/5 px-2 py-1.5 text-left text-[10px] font-mono text-zinc-500 hover:border-white/10 hover:text-zinc-300">
                            {p}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
