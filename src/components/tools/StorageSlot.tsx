"use client";

import { useState } from 'react';
import { keccak256, concat, pad, toHex } from 'viem';
import { Copy, Check, AlertCircle } from 'lucide-react';

type SlotType = 'simple' | 'mapping' | 'array';

export function StorageSlot() {
    const [slotType, setSlotType] = useState<SlotType>('mapping');
    const [baseSlot, setBaseSlot] = useState('0');
    const [mappingKey, setMappingKey] = useState('');
    const [arrayIndex, setArrayIndex] = useState('0');
    const [copied, setCopied] = useState(false);

    const { result, error } = (() => {
        try {
            const slot = BigInt(baseSlot);
            if (slotType === 'simple') {
                return { result: toHex(slot, { size: 32 }), error: '' };
            }
            if (slotType === 'mapping') {
                if (!mappingKey.trim()) return { result: '', error: 'Enter a mapping key' };
                const key = mappingKey.startsWith('0x') ? mappingKey as `0x${string}` : toHex(BigInt(mappingKey), { size: 32 });
                const paddedKey = pad(key, { size: 32 });
                const paddedSlot = pad(toHex(slot), { size: 32 });
                return { result: keccak256(concat([paddedKey, paddedSlot])), error: '' };
            }
            if (slotType === 'array') {
                const arrayBase = keccak256(pad(toHex(slot), { size: 32 }));
                const index = BigInt(arrayIndex);
                return { result: toHex(BigInt(arrayBase) + index, { size: 32 }), error: '' };
            }
        } catch (e: any) {
            return { result: '', error: e?.message ?? 'Computation failed' };
        }
        return { result: '', error: '' };
    })();

    const copy = async () => {
        if (!result) return;
        try { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-1 rounded-lg border border-white/5 bg-black/30 p-1">
                {(['simple', 'mapping', 'array'] as SlotType[]).map(t => (
                    <button key={t} onClick={() => setSlotType(t)} className={`flex-1 rounded-md py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${slotType === t ? 'bg-white/8 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
                        {t}
                    </button>
                ))}
            </div>

            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Base Slot Index</label>
                <input value={baseSlot} onChange={e => setBaseSlot(e.target.value)} placeholder="0" className="w-full rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-zinc-300 outline-none focus:border-blue-500/40" />
            </div>

            {slotType === 'mapping' && (
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Mapping Key (address or uint)</label>
                    <input value={mappingKey} onChange={e => setMappingKey(e.target.value)} placeholder="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" className="w-full rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-blue-400 outline-none focus:border-blue-500/40" />
                </div>
            )}

            {slotType === 'array' && (
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Array Index</label>
                    <input value={arrayIndex} onChange={e => setArrayIndex(e.target.value)} placeholder="0" className="w-full rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-zinc-300 outline-none focus:border-blue-500/40" />
                </div>
            )}

            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-2.5 text-[10px] text-red-400">
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />{error}
                </div>
            )}

            {result && !error && (
                <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Storage Slot</span>
                        <button onClick={copy} className="text-zinc-600 hover:text-white">
                            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                    </div>
                    <p className="break-all font-mono text-[11px] leading-relaxed text-purple-400">{result}</p>
                    <p className="mt-1.5 text-[9px] text-zinc-600 font-mono">
                        {slotType === 'mapping' ? 'keccak256(pad(key) ++ pad(slot))' : slotType === 'array' ? 'keccak256(pad(slot)) + index' : 'direct slot index'}
                    </p>
                </div>
            )}
        </div>
    );
}
