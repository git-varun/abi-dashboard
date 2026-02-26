"use client";

import {useEffect, useState} from 'react';
import {deleteHistoryItem, getAllHistory, updateHistoryName} from '@/lib/db';
import {Button} from "@/components/ui/button";
import {Clock, ExternalLink, Trash2, Edit2, X, Layers} from "lucide-react";
import {toast} from "sonner";

export function HistorySidebar() {
    const [history, setHistory] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [tempName, setTempName] = useState("");
    const [mounted, setMounted] = useState(false);
    const [groupedHistory, setGroupedHistory] = useState<Record<string, any>>({});

    const refresh = async () => {
        try {
            const data = await getAllHistory();
            // 1. Safety Check: Ensure data exists and is an array
            if (!data || !Array.isArray(data)) {
                setGroupedHistory({});
                return;
            }

            const sorted = data.sort((a: any, b: any) => b.timestamp - a.timestamp);

            const groups = sorted.reduce((acc: any, item: any) => {
                // 2. Data Integrity: Ensure item has an address
                if (!item.address) return acc;

                const key = item.address.toLowerCase();
                if (!acc[key]) {
                    acc[key] = { contract: null, transactions: [] };
                }

                if (item.type === 'contract_visit') {
                    acc[key].contract = item;
                } else if (item.type === 'transaction') {
                    acc[key].transactions.push(item);
                }
                return acc;
            }, {});

            setGroupedHistory(groups);
        } catch (err) {
            console.error("Sidebar Refresh Error:", err);
            toast.error("Failed to load history from database");
        }
    };

    useEffect(() => {
        setMounted(true);
        refresh();
        window.addEventListener('history-updated', refresh);
        return () => window.removeEventListener('history-updated', refresh);
    }, []);

    const handleRename = async (id: number) => {
        if (!tempName.trim()) return setEditingId(null);
        await updateHistoryName(id, tempName);
        setEditingId(null);
        toast.success("Entry renamed");
    };

    const startRename = (id: number, existingName: string) => {
        setEditingId(id);
        setTempName(existingName || '');
    };

    const handleDelete = async (id: number) => {
        await deleteHistoryItem(id);
        toast.info("Entry removed from history");
    };

    if (!mounted) return null;

    return (
        <div className="flex h-full w-80 flex-col border-l border-zinc-800 bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <Clock className="h-3 w-3"/> Workspace History
                </h2>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {Object.keys(groupedHistory).length === 0 ? (
                    <div className="mt-10 text-center text-[10px] text-zinc-700 uppercase">Empty Workspace</div>
                ) : (
                    Object.entries(groupedHistory).map(([address, group]: [string, any]) => (
                        <div key={address} className="space-y-2">

                            {/* 1. THE CONTRACT (PARENT) */}
                                                        {group.contract ? (
                                                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 group/contract">
                                                                                <div className="flex justify-between items-start mb-1">
                                                                            {editingId === group.contract.id ? (
                                                                                <div className="flex gap-2 items-center w-full">
                                                                                    <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="flex-1 rounded bg-black/20 p-1 text-[11px]" />
                                                                                    <Button size="sm" onClick={() => handleRename(group.contract.id)} className="h-6">Save</Button>
                                                                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-6"><X size={14} /></Button>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="text-[11px] font-black text-white truncate max-w-[120px]">
                                                                                                    {group.contract.name}
                                                                                                </span>
                                                                                                {group.contract.isProxy && (
                                                                                                    <div className="flex items-center gap-1">
                                                                                                                <div title="Proxy Contract" className="flex items-center">
                                                                                                                    <Layers size={12} className="text-purple-400" />
                                                                                                                </div>
                                                                                                        <span className="text-[9px] font-mono text-purple-300">Proxy</span>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover/contract:opacity-100 h-6" onClick={() => startRename(group.contract.id, group.contract.name)}>
                                                                                            <Edit2 size={12} />
                                                                                        </Button>
                                                                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover/contract:opacity-100 h-6 text-red-500" onClick={() => handleDelete(group.contract.id)}>
                                                                                            <Trash2 size={12} />
                                                                                        </Button>
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[8px] font-mono text-zinc-500 mb-2 truncate">{address}</p>
                                                                        <Button
                                                                                variant="secondary"
                                                                                className="w-full h-6 text-[8px] font-black uppercase tracking-widest bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
                                                                                onClick={() => window.dispatchEvent(new CustomEvent('load-contract', { detail: group.contract }))}
                                                                        >
                                                                                Restore ABI
                                                                        </Button>
                                                                </div>
                                                        ) : (
                                /* Fallback if transactions exist but ABI was deleted */
                                <div className="px-3 text-[9px] font-bold text-zinc-600 uppercase">
                                    Unknown Contract ({address.slice(0, 6)}...)
                                </div>
                            )}

                            {/* 2. THE TRANSACTIONS (CHILDREN) */}
                            {group.transactions.length > 0 && (
                                <div className="ml-4 space-y-1.5 border-l border-zinc-800 pl-3">
                                    {group.transactions.map((tx: any) => (
                                        <div key={tx.id} className="group flex items-center justify-between rounded-lg bg-zinc-900/20 p-2 border border-transparent hover:border-orange-500/20 transition-all">
                                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                                <span className="text-[9px] font-bold text-orange-400 truncate">⚡ {tx.name}</span>
                                                <div className="flex items-center gap-1">
                    <span className={`text-[7px] font-black uppercase ${
                        tx.status === 'success' ? 'text-emerald-500' :
                            tx.status === 'failed' ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      {tx.status || 'pending'}
                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" className="text-zinc-600 hover:text-white">
                                                    <ExternalLink size={10} />
                                                </a>
                                                <button onClick={() => handleDelete(tx.id)} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 transition-opacity">
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}