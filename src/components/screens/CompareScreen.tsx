"use client";

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAbiParser, type AbiEntry } from '@/hooks/useAbiParser';

// Canonical signature keyed by type:name(inputTypes) — handles overloads correctly
function canonicalSig(entry: AbiEntry): string {
    const types = (entry.inputs ?? []).map((i: any) => i.type).join(',');
    return `${entry.type}:${entry.name ?? ''}(${types})`;
}

function humanSig(entry: AbiEntry): string {
    const types = (entry.inputs ?? []).map((i: any) => i.type).join(', ');
    return `${entry.name ?? entry.type}(${types})`;
}

function useDiff(abiA: AbiEntry[] | null, abiB: AbiEntry[] | null) {
    return useMemo(() => {
        if (!abiA || !abiB) return null;

        const mapA = new Map<string, AbiEntry>(abiA.map(e => [canonicalSig(e), e]));
        const mapB = new Map<string, AbiEntry>(abiB.map(e => [canonicalSig(e), e]));

        const added: AbiEntry[] = [];
        const removed: AbiEntry[] = [];
        const unchanged: AbiEntry[] = [];

        for (const [sig, entry] of mapB) {
            if (mapA.has(sig)) unchanged.push(entry);
            else added.push(entry);
        }
        for (const [sig, entry] of mapA) {
            if (!mapB.has(sig)) removed.push(entry);
        }

        return { added, removed, unchanged };
    }, [abiA, abiB]);
}

const TYPE_BADGE: Record<string, string> = {
    function: 'bg-[#b7c4ff]',
    event: 'bg-[#ffd7f5]',
    error: 'bg-[#ffdad6] text-[#93000a]',
    constructor: 'bg-[#c3f400]',
};

function EntryRow({ entry, accent }: { entry: AbiEntry; accent: string }) {
    return (
        <div className={`p-3 border-b-2 border-black flex items-start gap-3 ${accent}`}>
            <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 border border-black uppercase ${TYPE_BADGE[entry.type] ?? 'bg-[#e2e2e2]'}`}>
                {entry.type}
            </span>
            <div className="min-w-0">
                <p className="font-mono text-sm font-bold truncate">{humanSig(entry)}</p>
                {entry.stateMutability && (
                    <p className="text-[10px] font-bold uppercase text-[#737687] mt-0.5">{entry.stateMutability}</p>
                )}
            </div>
        </div>
    );
}

function AbiInput({ label, value, onChange, error, count }: {
    label: string; value: string; onChange: (v: string) => void;
    error: string | null; count: number | null;
}) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest">{label}</span>
                {count !== null && (
                    <span className="text-[10px] font-black px-2 py-0.5 border border-black bg-[#f3f3f3]">
                        {count} ENTRIES
                    </span>
                )}
            </div>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder='Paste ABI JSON array here…'
                spellCheck={false}
                className={`flex-1 w-full bg-white border-2 font-mono text-xs p-3 resize-none focus:outline-none transition-all placeholder:text-[#737687] ${
                    error ? 'border-[#ba1a1a] focus:border-[#ba1a1a]' : 'border-black focus:border-4'
                }`}
                style={{ minHeight: '260px' }}
            />
            {error && (
                <p className="mt-1 text-[10px] font-bold text-[#ba1a1a] uppercase">{error}</p>
            )}
        </div>
    );
}

export default function CompareScreen() {
    const [rawA, setRawA] = useState('');
    const [rawB, setRawB] = useState('');

    const parsedA = useAbiParser(rawA);
    const parsedB = useAbiParser(rawB);

    const diff = useDiff(parsedA.parsedAbi, parsedB.parsedAbi);

    const bothLoaded = parsedA.parsedAbi && parsedB.parsedAbi;

    return (
        <AppShell>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-5xl font-black uppercase tracking-tight" style={{ letterSpacing: '-0.02em' }}>ABI_DIFF</h1>
                <p className="text-[#434656] font-bold uppercase tracking-tight mt-1">
                    Paste two ABIs to compare — added, removed, and unchanged entries
                </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border-4 border-black neo-shadow p-5">
                    <AbiInput
                        label="ABI  A  —  BASE"
                        value={rawA}
                        onChange={setRawA}
                        error={parsedA.error}
                        count={parsedA.parsedAbi?.length ?? null}
                    />
                </div>
                <div className="bg-white border-4 border-black neo-shadow p-5">
                    <AbiInput
                        label="ABI  B  —  NEW"
                        value={rawB}
                        onChange={setRawB}
                        error={parsedB.error}
                        count={parsedB.parsedAbi?.length ?? null}
                    />
                </div>
            </div>

            {/* Stats bar */}
            {bothLoaded && diff && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'ADDED', count: diff.added.length, bg: 'bg-[#c3f400]', icon: 'add_circle' },
                        { label: 'REMOVED', count: diff.removed.length, bg: 'bg-[#ffdad6]', icon: 'remove_circle' },
                        { label: 'UNCHANGED', count: diff.unchanged.length, bg: 'bg-white', icon: 'check_circle' },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} border-4 border-black neo-shadow p-5 flex items-center justify-between`}>
                            <div>
                                <p className="text-xs font-black uppercase text-[#737687]">{s.label}</p>
                                <p className="text-4xl font-black mt-1">{s.count}</p>
                            </div>
                            <span className="material-symbols-outlined text-4xl opacity-20">{s.icon}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!bothLoaded && (
                <div className="bg-white border-4 border-black neo-shadow p-16 text-center">
                    <span className="material-symbols-outlined text-6xl text-[#e2e2e2]">difference</span>
                    <p className="mt-4 font-black uppercase text-[#737687] text-sm">Paste both ABIs above to see the diff</p>
                </div>
            )}

            {/* Diff Results */}
            {bothLoaded && diff && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Added */}
                    <div className="bg-white border-4 border-black neo-shadow">
                        <div className="bg-[#c3f400] p-4 border-b-4 border-black flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            <h3 className="font-black uppercase tracking-widest text-sm">ADDED IN B ({diff.added.length})</h3>
                        </div>
                        {diff.added.length === 0 ? (
                            <p className="p-6 text-xs font-bold text-[#737687] uppercase text-center">No new entries</p>
                        ) : (
                            <div className="overflow-y-auto" style={{ maxHeight: '480px' }}>
                                {diff.added.map(e => (
                                    <EntryRow key={canonicalSig(e)} entry={e} accent="hover:bg-[#f3fff0]" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Removed */}
                    <div className="bg-white border-4 border-black neo-shadow">
                        <div className="bg-[#ffdad6] p-4 border-b-4 border-black flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">remove_circle</span>
                            <h3 className="font-black uppercase tracking-widest text-sm">REMOVED FROM A ({diff.removed.length})</h3>
                        </div>
                        {diff.removed.length === 0 ? (
                            <p className="p-6 text-xs font-bold text-[#737687] uppercase text-center">Nothing removed</p>
                        ) : (
                            <div className="overflow-y-auto" style={{ maxHeight: '480px' }}>
                                {diff.removed.map(e => (
                                    <EntryRow key={canonicalSig(e)} entry={e} accent="hover:bg-[#fff5f5]" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Unchanged */}
                    <div className="bg-white border-4 border-black neo-shadow">
                        <div className="bg-[#f3f3f3] p-4 border-b-4 border-black flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <h3 className="font-black uppercase tracking-widest text-sm">UNCHANGED ({diff.unchanged.length})</h3>
                        </div>
                        {diff.unchanged.length === 0 ? (
                            <p className="p-6 text-xs font-bold text-[#737687] uppercase text-center">No common entries</p>
                        ) : (
                            <div className="overflow-y-auto" style={{ maxHeight: '480px' }}>
                                {diff.unchanged.map(e => (
                                    <EntryRow key={canonicalSig(e)} entry={e} accent="hover:bg-[#f3f3f3]" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppShell>
    );
}
