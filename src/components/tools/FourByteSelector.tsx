"use client";

import { useState, useEffect } from 'react';
import { keccak256 } from 'viem';
import { Search, Hash, AlertCircle, ExternalLink } from 'lucide-react';

interface Props { prefilled?: unknown }

type SigResult = { id: number; text_signature: string; bytes_signature: string };

export function FourByteSelector({ prefilled }: Props) {
    const [selector, setSelector] = useState('');
    const [results, setResults] = useState<SigResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Compute selector from signature
    const [sigInput, setSigInput] = useState('');
    const computedSelector = sigInput.trim()
        ? (() => { try { return keccak256(new TextEncoder().encode(sigInput.trim())).slice(0, 10); } catch { return ''; } })()
        : '';

    useEffect(() => {
        if (prefilled) setSelector(String(prefilled));
    }, [prefilled]);

    const lookup = async (sel: string) => {
        const hex = sel.startsWith('0x') ? sel : `0x${sel}`;
        if (!/^0x[0-9a-fA-F]{8}$/.test(hex)) { setError('Enter a valid 4-byte selector (0x12345678)'); return; }
        setLoading(true); setError(''); setResults([]);
        try {
            const res = await fetch(`https://www.4byte.directory/api/v1/signatures/?hex_signature=${hex}`);
            const data = await res.json();
            setResults(data.results ?? []);
            if ((data.results ?? []).length === 0) setError('No signatures found for this selector');
        } catch { setError('Failed to reach 4byte.directory'); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            {/* Lookup by selector */}
            <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Lookup Selector</label>
                <div className="flex gap-2">
                    <input
                        value={selector}
                        onChange={e => setSelector(e.target.value)}
                        placeholder="0x12345678"
                        className="flex-1 rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-purple-400 outline-none focus:border-blue-500/40"
                    />
                    <button
                        onClick={() => lookup(selector)}
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-black text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? '...' : <Search className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-2.5 text-[10px] text-red-400">
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />{error}
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-1.5">
                    {results.map(r => (
                        <div key={r.id} className="rounded-xl border border-white/5 bg-white/2 p-3">
                            <p className="font-mono text-[11px] text-emerald-400">{r.text_signature}</p>
                            <div className="mt-1 flex items-center justify-between">
                                <p className="text-[9px] text-zinc-600">bytes4: {r.bytes_signature}</p>
                                <a href={`https://www.4byte.directory/signatures/${r.id}/`} target="_blank" className="text-zinc-600 hover:text-white">
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Compute selector from signature */}
            <div className="border-t border-white/5 pt-4 space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Compute Selector</label>
                <input
                    value={sigInput}
                    onChange={e => setSigInput(e.target.value)}
                    placeholder="transfer(address,uint256)"
                    className="w-full rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-zinc-300 outline-none focus:border-blue-500/40"
                />
                {computedSelector && (
                    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/30 p-3">
                        <Hash className="h-3 w-3 shrink-0 text-zinc-600" />
                        <p className="font-mono text-[11px] text-purple-400">{computedSelector}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
