"use client";

import { useState, useEffect } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { Copy, Check } from 'lucide-react';

const UNITS = [
    { label: 'Wei', decimals: 0 },
    { label: 'Gwei', decimals: 9 },
    { label: 'ETH', decimals: 18 },
];

function safeParse(value: string, fromDecimals: number): bigint | null {
    try {
        if (!value || value === '.') return null;
        const trimmed = value.trim();
        if (fromDecimals === 0) return BigInt(trimmed);
        return parseUnits(trimmed, fromDecimals);
    } catch { return null; }
}

function safeFormat(wei: bigint, decimals: number): string {
    try { return formatUnits(wei, decimals); } catch { return ''; }
}

interface Props { prefilled?: unknown }

export function WeiConverter({ prefilled }: Props) {
    const [inputs, setInputs] = useState({ Wei: '', Gwei: '', ETH: '' });
    const [copied, setCopied] = useState<string | null>(null);
    const [customDecimals, setCustomDecimals] = useState('6');
    const [customValue, setCustomValue] = useState('');

    useEffect(() => {
        if (prefilled != null) {
            const s = String(prefilled);
            const wei = safeParse(s, 0);
            if (wei !== null) {
                setInputs({ Wei: s, Gwei: safeFormat(wei, 9), ETH: safeFormat(wei, 18) });
            }
        }
    }, [prefilled]);

    const handleChange = (unitLabel: string, value: string, decimals: number) => {
        const wei = safeParse(value, decimals);
        if (wei !== null && wei >= BigInt(0)) {
            setInputs({ Wei: safeFormat(wei, 0), Gwei: safeFormat(wei, 9), ETH: safeFormat(wei, 18) });
        } else {
            setInputs(prev => ({ ...prev, [unitLabel]: value }));
        }
    };

    const handleCustom = (v: string) => {
        setCustomValue(v);
        const dec = parseInt(customDecimals, 10);
        if (!isNaN(dec)) {
            const wei = safeParse(v, dec);
            if (wei !== null && wei >= BigInt(0)) {
                setInputs({ Wei: safeFormat(wei, 0), Gwei: safeFormat(wei, 9), ETH: safeFormat(wei, 18) });
            }
        }
    };

    const copy = async (text: string, key: string) => {
        try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); } catch { /* ignore */ }
    };

    return (
        <div className="space-y-3">
            {UNITS.map(u => (
                <div key={u.label} className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{u.label}</label>
                    <div className="flex gap-2">
                        <input
                            value={inputs[u.label as keyof typeof inputs]}
                            onChange={e => handleChange(u.label, e.target.value, u.decimals)}
                            placeholder="0"
                            className="flex-1 rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-blue-400 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
                        />
                        <button onClick={() => copy(inputs[u.label as keyof typeof inputs], u.label)} className="rounded-lg border border-white/5 px-2 text-zinc-600 hover:text-white">
                            {copied === u.label ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                    </div>
                </div>
            ))}

            {/* Custom token decimals */}
            <div className="mt-4 rounded-xl border border-white/5 bg-white/2 p-3 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Custom Token</p>
                <div className="flex gap-2">
                    <input
                        value={customValue}
                        onChange={e => handleCustom(e.target.value)}
                        placeholder="Raw amount"
                        className="flex-1 rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-zinc-300 outline-none focus:border-blue-500/40"
                    />
                    <input
                        value={customDecimals}
                        onChange={e => { setCustomDecimals(e.target.value); handleCustom(customValue); }}
                        placeholder="18"
                        className="w-14 rounded-lg border border-white/8 bg-black/60 px-2 py-2 font-mono text-[11px] text-zinc-500 outline-none text-center"
                    />
                </div>
                {customValue && (() => {
                    const dec = parseInt(customDecimals, 10);
                    const wei = !isNaN(dec) ? safeParse(customValue, dec) : null;
                    if (wei === null) return null;
                    const formatted = safeFormat(wei, dec);
                    return <p className="text-[11px] font-mono text-emerald-400">= {formatted} (×10<sup>{dec}</sup>)</p>;
                })()}
            </div>
        </div>
    );
}
