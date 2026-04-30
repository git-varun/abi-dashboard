"use client";

import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

interface Props { prefilled?: unknown }

export function TimestampConverter({ prefilled }: Props) {
    const [unix, setUnix] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        if (prefilled != null) {
            const s = String(prefilled);
            if (/^\d+$/.test(s)) setUnix(s);
        }
    }, [prefilled]);

    const setNow = () => setUnix(String(Math.floor(Date.now() / 1000)));

    const ts = parseInt(unix, 10);
    const isValid = !isNaN(ts) && ts > 0;
    const date = isValid ? new Date(ts * 1000) : null;

    const formats = date ? [
        { label: 'ISO 8601', value: date.toISOString() },
        { label: 'UTC', value: date.toUTCString() },
        { label: 'Local', value: date.toLocaleString() },
        { label: 'Date only', value: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
        { label: 'Relative', value: relativeTime(ts) },
        { label: 'Unix (ms)', value: (ts * 1000).toString() },
    ] : [];

    const copy = async (text: string, key: string) => {
        try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); } catch { /* ignore */ }
    };

    const [dateInput, setDateInput] = useState('');
    const handleDateInput = (val: string) => {
        setDateInput(val);
        const parsed = new Date(val);
        if (!isNaN(parsed.getTime())) setUnix(String(Math.floor(parsed.getTime() / 1000)));
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Unix Timestamp</label>
                <div className="flex gap-2">
                    <input
                        value={unix}
                        onChange={e => setUnix(e.target.value)}
                        placeholder="1713916800"
                        className="flex-1 rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-blue-400 outline-none focus:border-blue-500/40"
                    />
                    <button onClick={setNow} title="Use current time" className="rounded-lg border border-white/5 px-2 text-zinc-600 hover:text-white">
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Human Date → Unix</label>
                <input
                    type="datetime-local"
                    value={dateInput}
                    onChange={e => handleDateInput(e.target.value)}
                    className="w-full rounded-lg border border-white/8 bg-black/60 px-3 py-2 font-mono text-[11px] text-zinc-300 outline-none focus:border-blue-500/40 [color-scheme:dark]"
                />
            </div>

            {formats.length > 0 && (
                <div className="space-y-1.5 rounded-xl border border-white/5 bg-black/30 p-3">
                    {formats.map(f => (
                        <div key={f.label} className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{f.label}</p>
                                <p className="truncate font-mono text-[10px] text-zinc-300">{f.value}</p>
                            </div>
                            <button onClick={() => copy(f.value, f.label)} className="shrink-0 text-zinc-600 hover:text-white">
                                {copied === f.label ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function relativeTime(ts: number): string {
    const diff = ts - Math.floor(Date.now() / 1000);
    const abs = Math.abs(diff);
    const past = diff < 0;
    if (abs < 60) return past ? `${abs}s ago` : `in ${abs}s`;
    if (abs < 3600) return past ? `${Math.floor(abs / 60)}m ago` : `in ${Math.floor(abs / 60)}m`;
    if (abs < 86400) return past ? `${Math.floor(abs / 3600)}h ago` : `in ${Math.floor(abs / 3600)}h`;
    const days = Math.floor(abs / 86400);
    return past ? `${days}d ago` : `in ${days}d`;
}
