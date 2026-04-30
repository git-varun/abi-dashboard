"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props { prefilled?: unknown }

function toBigIntSafe(s: string, base: number): bigint | null {
    try { return BigInt(base === 16 ? (s.startsWith('0x') ? s : `0x${s}`) : s); } catch { return null; }
}

export function HexDecConverter({ prefilled }: Props) {
    const [dec, setDec] = useState(prefilled != null ? String(prefilled) : '');
    const [hex, setHex] = useState('');
    const [bin, setBin] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    const sync = (value: bigint | null) => {
        if (value === null || value < BigInt(0)) return;
        setDec(value.toString(10));
        setHex('0x' + value.toString(16));
        setBin(value.toString(2).replace(/(.{8})/g, '$1 ').trim());
    };

    const copy = async (text: string, key: string) => {
        try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); } catch { /* ignore */ }
    };

    const fields = [
        { label: 'Decimal', value: dec, setter: (v: string) => { setDec(v); sync(toBigIntSafe(v, 10)); }, placeholder: '255', mono: 'text-blue-400' },
        { label: 'Hex', value: hex, setter: (v: string) => { setHex(v); sync(toBigIntSafe(v.replace(/^0x/i, ''), 16)); }, placeholder: '0xff', mono: 'text-purple-400' },
        { label: 'Binary', value: bin, setter: (v: string) => { setBin(v); sync(toBigIntSafe(v.replace(/\s/g, ''), 2)); }, placeholder: '11111111', mono: 'text-emerald-400' },
    ];

    return (
        <div className="space-y-3">
            {fields.map(f => (
                <div key={f.label} className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{f.label}</label>
                    <div className="flex gap-2">
                        <input
                            value={f.value}
                            onChange={e => f.setter(e.target.value)}
                            placeholder={f.placeholder}
                            className={`flex-1 rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] ${f.mono} outline-none focus:border-blue-500/40`}
                        />
                        <button onClick={() => copy(f.value, f.label)} className="rounded-lg border border-white/5 px-2 text-zinc-600 hover:text-white">
                            {copied === f.label ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                    </div>
                </div>
            ))}

            {dec && (() => {
                const n = toBigIntSafe(dec, 10);
                if (!n || n <= BigInt(0)) return null;
                const bits = n.toString(2).length;
                return (
                    <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-[10px] space-y-1">
                        <div className="flex justify-between"><span className="text-zinc-600">Bit length</span><span className="font-mono text-zinc-300">{bits} bits</span></div>
                        <div className="flex justify-between"><span className="text-zinc-600">Byte length</span><span className="font-mono text-zinc-300">{Math.ceil(bits / 8)} bytes</span></div>
                        {bits <= 256 && <div className="flex justify-between"><span className="text-zinc-600">Fits in</span><span className="font-mono text-zinc-300">uint{Math.pow(2, Math.ceil(Math.log2(bits || 1)))}</span></div>}
                    </div>
                );
            })()}
        </div>
    );
}
