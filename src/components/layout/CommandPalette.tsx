"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWorkspaceComputed } from '@/store/workspace';
import { HistoryItem, getAllHistory } from '@/lib/db';
import { TOOLS } from '@/components/tools/registry';
import { Search, Zap, FileCode, Clock, ArrowRight } from 'lucide-react';
import { AbiEntry } from '@/hooks/useAbiParser';

type ResultType = 'tool' | 'read' | 'write' | 'history';

type Result = {
    id: string;
    type: ResultType;
    label: string;
    sublabel?: string;
    action: () => void;
};

function useResults(query: string, onClose: () => void): Result[] {
    const { readFunctions, writeFunctions } = useWorkspaceComputed();
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

    useEffect(() => {
        getAllHistory().then(h => setHistoryItems(h.filter(i => i.type === 'contract_visit'))).catch(() => {});
    }, []);

    const q = query.toLowerCase().trim();

    const tools: Result[] = TOOLS
        .filter(t => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.shortcut.toLowerCase() === q)
        .map(t => ({
            id: `tool-${t.id}`,
            type: 'tool' as ResultType,
            label: t.name,
            sublabel: t.description,
            action: () => { window.dispatchEvent(new CustomEvent('open-tool', { detail: { toolId: t.id } })); onClose(); },
        }));

    const reads: Result[] = (readFunctions ?? [])
        .filter((f: AbiEntry) => !q || f.name?.toLowerCase().includes(q))
        .slice(0, 5)
        .map((f: AbiEntry) => ({
            id: `read-${f.name}`,
            type: 'read' as ResultType,
            label: f.name ?? '',
            sublabel: `view · ${f.inputs?.length ?? 0} input(s)`,
            action: () => { document.getElementById(`fn-${f.name}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); onClose(); },
        }));

    const writes: Result[] = (writeFunctions ?? [])
        .filter((f: AbiEntry) => !q || f.name?.toLowerCase().includes(q))
        .slice(0, 5)
        .map((f: AbiEntry) => ({
            id: `write-${f.name}`,
            type: 'write' as ResultType,
            label: f.name ?? '',
            sublabel: `write · ${f.inputs?.length ?? 0} input(s)`,
            action: () => { document.getElementById(`fn-${f.name}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); onClose(); },
        }));

    const history: Result[] = historyItems
        .filter(h => !q || h.name?.toLowerCase().includes(q) || h.address?.toLowerCase().includes(q))
        .slice(0, 4)
        .map(h => ({
            id: `history-${h.id}`,
            type: 'history' as ResultType,
            label: h.name,
            sublabel: h.address,
            action: () => { window.dispatchEvent(new CustomEvent('load-contract', { detail: h })); onClose(); },
        }));

    if (!q) return [...tools.slice(0, 6), ...reads.slice(0, 3), ...writes.slice(0, 3), ...history.slice(0, 3)];
    return [...tools, ...reads, ...writes, ...history].slice(0, 12);
}

const TYPE_ICON: Record<ResultType, React.ComponentType<{ className?: string }>> = {
    tool: Zap,
    read: FileCode,
    write: Zap,
    history: Clock,
};

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const results = useResults(query, onClose);

    useEffect(() => {
        if (isOpen) {
            // Use setTimeout to avoid synchronous setState during render/effect cascade warning
            const timer = setTimeout(() => {
                setQuery('');
                setSelected(0);
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleKeydown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
        if (e.key === 'Enter' && results[selected]) { results[selected].action(); }
    }, [results, selected]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40" onClick={onClose}>
            <div className="relative w-full max-w-xl mx-4" onClick={e => e.stopPropagation()}>
                <div className="overflow-hidden bg-white border-4 border-black neo-shadow-lg">
                    {/* Search input */}
                    <div className="flex items-center gap-3 border-b-4 border-black px-4 py-3">
                        <Search className="h-5 w-5 shrink-0 text-black" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => { setQuery(e.target.value); setSelected(0); }}
                            onKeyDown={handleKeydown}
                            placeholder="Search tools, functions, contracts..."
                            className="flex-1 bg-transparent text-sm font-bold text-black placeholder-[#737687] outline-none uppercase"
                        />
                        <kbd className="border-2 border-black px-1.5 py-0.5 text-[10px] font-black bg-[#e2e2e2]">ESC</kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-80 overflow-y-auto">
                        {results.length === 0 ? (
                            <div className="py-10 text-center text-sm font-black uppercase text-[#737687]">No results for &quot;{query}&quot;</div>
                        ) : (
                            results.map((r, i) => {
                                const Icon = TYPE_ICON[r.type];
                                return (
                                    <button
                                        key={r.id}
                                        onClick={r.action}
                                        onMouseEnter={() => setSelected(i)}
                                        className={`flex w-full items-center gap-3 px-4 py-3 text-left border-b-2 border-black transition-colors ${i === selected ? 'bg-[#c3f400]' : 'hover:bg-[#f3f3f3]'}`}
                                    >
                                        <Icon className={`h-4 w-4 shrink-0 text-black`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-black uppercase text-black truncate">{r.label}</p>
                                            {r.sublabel && <p className="text-[10px] font-medium text-[#737687] truncate">{r.sublabel}</p>}
                                        </div>
                                        {i === selected && <ArrowRight className="h-4 w-4 shrink-0 text-black" />}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 border-t-2 border-black px-4 py-2 bg-[#f3f3f3]">
                        {[['↑↓', 'navigate'], ['↵', 'select'], ['esc', 'close']].map(([key, label]) => (
                            <div key={key} className="flex items-center gap-1.5">
                                <kbd className="border border-black px-1.5 py-0.5 text-[9px] font-black bg-white">{key}</kbd>
                                <span className="text-[9px] font-bold uppercase text-[#737687]">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
