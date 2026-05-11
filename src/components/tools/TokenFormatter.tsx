"use client";

import { useState, useEffect, useCallback } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { Copy, Check } from 'lucide-react';

const COMMON_TOKENS = [
    { symbol: 'ETH / WETH', decimals: 18 },
    { symbol: 'USDC / USDT', decimals: 6 },
    { symbol: 'WBTC', decimals: 8 },
    { symbol: 'DAI', decimals: 18 },
    { symbol: 'LINK', decimals: 18 },
];

interface Props { prefilled?: unknown }

export function TokenFormatter({ prefilled }: Props) {
    const [raw, setRaw] = useState('');
    const [human, setHuman] = useState('');
    const [decimals, setDecimals] = useState('18');
    const [copied, setCopied] = useState<string | null>(null);

    const syncFromRaw = useCallback((r: string, d: string) => {
        try {
            const dec = parseInt(d, 10);
            if (isNaN(dec) || !r) { setHuman(''); return; }
            setHuman(formatUnits(BigInt(r), dec));
        } catch { setHuman(''); }
    }, []);

    const syncFromHuman = useCallback((h: string, d: string) => {
        try {
            const dec = parseInt(d, 10);
            if (isNaN(dec) || !h) { setRaw(''); return; }
            setRaw(parseUnits(h, dec).toString());
        } catch { setRaw(''); }
    }, []);

    useEffect(() => {
        if (prefilled != null) {
            const s = String(prefilled);
            if (/^\d+$/.test(s)) {
                const timer = setTimeout(() => {
                    setRaw(s);
                    syncFromRaw(s, decimals);
                }, 50);
                return () => clearTimeout(timer);
            }
        }
    }, [prefilled, decimals, syncFromRaw]);

    const copy = async (text: string, key: string) => {
        try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); } catch { /* ignore */ }
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Decimals</label>
                <input
                    value={decimals}
                    onChange={e => { setDecimals(e.target.value); syncFromRaw(raw, e.target.value); }}
                    className="w-full rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-zinc-300 outline-none focus:border-blue-500/40"
                />
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-1">
                {COMMON_TOKENS.map(t => (
                    <button
                        key={t.symbol}
                        onClick={() => { setDecimals(String(t.decimals)); syncFromRaw(raw, String(t.decimals)); }}
                        className={`rounded-lg border px-2 py-1 text-[9px] font-bold transition-colors ${decimals === String(t.decimals) ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-white/5 text-zinc-600 hover:border-white/10 hover:text-zinc-400'}`}
                    >
                        {t.symbol}
                    </button>
                ))}
            </div>

            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Raw uint256</label>
                <div className="flex gap-2">
                    <input
                        value={raw}
                        onChange={e => { setRaw(e.target.value); syncFromHuman('', decimals); syncFromRaw(e.target.value, decimals); }}
                        placeholder="1000000000000000000"
                        className="flex-1 rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-orange-400 outline-none focus:border-blue-500/40"
                    />
                    <button onClick={() => copy(raw, 'raw')} className="rounded-lg border border-white/5 px-2 text-zinc-600 hover:text-white">
                        {copied === 'raw' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Human Amount</label>
                <div className="flex gap-2">
                    <input
                        value={human}
                        onChange={e => { setHuman(e.target.value); syncFromHuman(e.target.value, decimals); }}
                        placeholder="1.0"
                        className="flex-1 rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-emerald-400 outline-none focus:border-blue-500/40"
                    />
                    <button onClick={() => copy(human, 'human')} className="rounded-lg border border-white/5 px-2 text-zinc-600 hover:text-white">
                        {copied === 'human' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
