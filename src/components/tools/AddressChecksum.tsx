"use client";

import { useState, useEffect } from 'react';
import { getAddress, isAddress } from 'viem';
import { Copy, Check, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Props { prefilled?: unknown }

export function AddressChecksum({ prefilled }: Props) {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        if (prefilled) {
            const timer = setTimeout(() => setInput(String(prefilled)), 50);
            return () => clearTimeout(timer);
        }
    }, [prefilled]);

    const copy = async (text: string, key: string) => {
        try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); } catch { /* ignore */ }
    };

    const isValidHex = /^(0x)?[0-9a-fA-F]{40}$/.test(input.trim());
    let checksummed = '';
    let isValid = false;
    let isChecksummed = false;

    if (isValidHex) {
        try {
            checksummed = getAddress(input.trim());
            isValid = true;
            isChecksummed = input.trim() === checksummed || input.trim().toLowerCase() === checksummed.toLowerCase();
            // Check if already correct checksum
            isChecksummed = isAddress(input.trim());
        } catch { isValid = false; }
    }

    const lower = checksummed ? checksummed.toLowerCase() : '';
    const noPrefix = checksummed ? checksummed.slice(2) : '';

    const formats = checksummed ? [
        { label: 'EIP-55 Checksummed', value: checksummed, highlight: true },
        { label: 'Lowercase', value: lower },
        { label: 'No prefix', value: noPrefix },
    ] : [];

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Ethereum Address</label>
                <div className="relative">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
                        className={`w-full rounded-xl border bg-black/60 px-3 py-2.5 font-mono text-[11px] text-blue-400 outline-none focus:ring-1 ${
                            input && !isValidHex ? 'border-red-500/40 focus:ring-red-500/10' : 'border-white/8 focus:border-blue-500/40 focus:ring-blue-500/10'
                        }`}
                    />
                    {input && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValid
                                ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                : <XCircle className="h-3.5 w-3.5 text-red-400" />
                            }
                        </div>
                    )}
                </div>
            </div>

            {input && isValid && (
                <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] ${isChecksummed ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400'}`}>
                    {isChecksummed
                        ? <><CheckCircle2 className="h-3 w-3 shrink-0" /> Valid EIP-55 checksum</>
                        : <><AlertCircle className="h-3 w-3 shrink-0" /> Checksummed version differs — use EIP-55 format for safety</>
                    }
                </div>
            )}

            {formats.map(f => (
                <div key={f.label} className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{f.label}</label>
                    <div className="flex gap-2">
                        <input readOnly value={f.value} className={`flex-1 rounded-lg border border-white/5 bg-black/40 px-3 py-2 font-mono text-[11px] outline-none ${f.highlight ? 'text-emerald-400' : 'text-zinc-400'}`} />
                        <button onClick={() => copy(f.value, f.label)} className="rounded-lg border border-white/5 px-2 text-zinc-600 hover:text-white">
                            {copied === f.label ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
