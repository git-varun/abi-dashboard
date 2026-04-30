"use client";

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import Link from 'next/link';
import { getAllHistory, getPinnedContracts, togglePin, type HistoryItem } from '@/lib/db';

export default function DashboardScreen() {
    const [pinnedContracts, setPinnedContracts] = useState<HistoryItem[]>([]);
    const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);

    const loadData = async () => {
        const [pinned, all] = await Promise.all([getPinnedContracts(), getAllHistory()]);
        setPinnedContracts(pinned);
        setRecentHistory([...all].reverse().slice(0, 10));
    };

    useEffect(() => {
        loadData().catch(console.error);
        const handler = () => loadData().catch(console.error);
        window.addEventListener('history-updated', handler);
        return () => window.removeEventListener('history-updated', handler);
    }, []);

    return (
        <AppShell>
            <div className="grid grid-cols-12 gap-6">
                {/* Header */}
                <div className="col-span-12 flex items-end justify-between mb-2">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tight" style={{ letterSpacing: '-0.02em' }}>SYSTEM_OVERVIEW</h1>
                        <p className="text-[#434656] font-bold uppercase tracking-tight">REAL-TIME ON-CHAIN PERFORMANCE TELEMETRY</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white border-2 border-black neo-shadow font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#c3f400]"></span>
                            ABI WORKBENCH
                        </div>
                        <Link href="/history" className="px-4 py-2 bg-white border-2 border-black neo-shadow font-bold flex items-center gap-2 hover:bg-[#c3f400] transition-colors">
                            {recentHistory.length} EVENTS →
                        </Link>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="col-span-12 lg:col-span-4 bg-white border-2 border-black neo-shadow p-6 flex flex-col justify-between group hover:bg-[#2b60ff] hover:text-white transition-all cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold uppercase text-[#737687] group-hover:text-[#dde1ff]">CONTRACTS VISITED</span>
                        <span className="material-symbols-outlined">history_edu</span>
                    </div>
                    <div className="mt-8">
                        <span className="text-4xl font-black">{recentHistory.filter(i => i.type === 'contract_visit').length}</span>
                        <div className="flex items-center gap-2 text-[#c3f400] font-bold mt-2">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span>THIS SESSION</span>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 bg-white border-2 border-black neo-shadow p-6 flex flex-col justify-between group hover:bg-[#c3f400] hover:text-black transition-all cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold uppercase text-[#737687]">TRANSACTIONS</span>
                        <span className="material-symbols-outlined">receipt_long</span>
                    </div>
                    <div className="mt-8">
                        <span className="text-4xl font-black">{recentHistory.filter(i => i.type === 'transaction').length}</span>
                        <div className="flex items-center gap-2 text-[#0046dd] font-bold mt-2">
                            <span className="material-symbols-outlined text-sm">bolt</span>
                            <span>RECENT HISTORY</span>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 bg-white border-2 border-black neo-shadow p-6 flex flex-col justify-between group hover:bg-[#c600c6] hover:text-white transition-all cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold uppercase text-[#737687] group-hover:text-[#ffd7f5]">PINNED</span>
                        <span className="material-symbols-outlined">push_pin</span>
                    </div>
                    <div className="mt-8">
                        <span className="text-4xl font-black">{pinnedContracts.length}</span>
                        <div className="flex items-center gap-2 font-bold mt-2 group-hover:text-white">
                            <span className="material-symbols-outlined text-sm">bookmark</span>
                            <span>CONTRACTS PINNED</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div className="col-span-12 xl:col-span-8 bg-white border-2 border-black neo-shadow">
                    <div className="bg-black text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#b7c4ff]">history</span>
                            RECENT_ACTIVITY
                        </h3>
                        <Link href="/history" className="text-[10px] font-bold uppercase text-[#737687] hover:text-white transition-colors">VIEW ALL →</Link>
                    </div>
                    {recentHistory.length === 0 ? (
                        <div className="p-8 text-center text-[#737687] font-bold uppercase text-sm">
                            No activity yet — load a contract at <Link href="/contracts" className="text-[#2b60ff] underline">/contracts</Link> to begin.
                        </div>
                    ) : (
                        <div className="divide-y-2 divide-black">
                            {recentHistory.map((item, i) => (
                                <div key={item.id ?? i} className="p-4 flex items-center justify-between gap-4 hover:bg-[#f3f3f3] transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className={`shrink-0 px-2 py-0.5 text-[10px] font-black border border-black uppercase ${item.type === 'contract_visit' ? 'bg-[#b7c4ff]' : item.status === 'success' ? 'bg-[#c3f400]' : item.status === 'failed' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#e2e2e2]'}`}>
                                            {item.type === 'contract_visit' ? 'VISIT' : item.status?.toUpperCase() ?? 'TX'}
                                        </span>
                                        <span className="font-bold truncate">{item.name || item.address}</span>
                                        <span className="font-mono text-xs text-[#737687] hidden sm:block shrink-0">{item.address.slice(0, 8)}…{item.address.slice(-4)}</span>
                                    </div>
                                    <span className="shrink-0 text-[10px] font-bold text-[#737687] uppercase">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Live Logs Terminal */}
                <div className="col-span-12 xl:col-span-4 bg-black border-2 border-black neo-shadow flex flex-col" style={{ height: '480px' }}>
                    <div className="p-4 border-b-2 border-[#333] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#c3f400] animate-pulse"></div>
                            <span className="text-[#c3f400] font-mono text-sm uppercase">SESSION_LOG</span>
                        </div>
                        <span className="text-[#666] font-mono text-xs">{recentHistory.length} EVENTS</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2">
                        {recentHistory.length === 0 ? (
                            <p className="text-[#555]">&gt; AWAITING_EVENTS…</p>
                        ) : recentHistory.map((item, i) => (
                            <p key={item.id ?? i} className={item.type === 'transaction' && item.status === 'failed' ? 'text-[#ba1a1a]' : 'text-[#c3f400]'}>
                                <span className="text-[#555]">[{new Date(item.timestamp).toLocaleTimeString('en-US', { hour12: false })}]</span>
                                {' '}&gt; {item.type === 'contract_visit' ? `CONTRACT_LOADED: ${item.name || item.address}` : `TX_${item.status?.toUpperCase()}: ${item.hash?.slice(0, 10) ?? item.address}`}
                            </p>
                        ))}
                        <div className="h-3 w-2 bg-[#c3f400] inline-block animate-pulse"></div>
                    </div>
                </div>

                {/* Pinned Contracts Table */}
                <div className="col-span-12 bg-white border-2 border-black neo-shadow mb-8">
                    <div className="bg-[#2b60ff] text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined">push_pin</span>
                            PINNED_CONTRACTS
                        </h3>
                        <Link href="/contracts" className="bg-black text-white px-3 py-1 text-xs border border-white hover:bg-[#c3f400] hover:text-black transition-all uppercase font-bold">
                            ADD_CONTRACT
                        </Link>
                    </div>
                    {pinnedContracts.length === 0 ? (
                        <div className="p-8 text-center text-[#737687] font-bold uppercase text-sm">
                            No pinned contracts — visit a contract at <Link href="/contracts" className="text-[#2b60ff] underline">/contracts</Link>, then pin it here.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="border-b-4 border-black">
                                    <tr className="bg-[#f3f3f3] font-bold uppercase text-xs">
                                        <th className="p-4 border-r-2 border-black">NAME</th>
                                        <th className="p-4 border-r-2 border-black">ADDRESS</th>
                                        <th className="p-4 border-r-2 border-black">CHAIN</th>
                                        <th className="p-4">PIN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pinnedContracts.map((c, i) => (
                                        <tr key={c.id ?? i} className="border-b-2 border-black hover:bg-[#e8e8e8] transition-colors">
                                            <td className="p-4 border-r-2 border-black font-bold">{c.name || '—'}</td>
                                            <td className="p-4 border-r-2 border-black font-mono text-sm text-[#737687]">{c.address.slice(0, 10)}…{c.address.slice(-4)}</td>
                                            <td className="p-4 border-r-2 border-black font-bold text-xs">{c.chainId}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => togglePin(c.address)}
                                                    className="px-2 py-1 text-[10px] font-black border border-black bg-[#c3f400] hover:bg-[#ffdad6] uppercase transition-colors"
                                                >
                                                    UNPIN
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Bento Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-[#c3f400] p-8 border-4 border-black neo-shadow relative overflow-hidden group">
                    <span className="material-symbols-outlined text-8xl absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">bolt</span>
                    <h4 className="text-3xl font-black uppercase mb-4 relative z-10">QUICK_DEBUG</h4>
                    <p className="font-bold uppercase tracking-tighter relative z-10">Instant contract state verification in sandboxed environment.</p>
                    <Link href="/contracts" className="mt-8 bg-black text-white px-6 py-3 border-2 border-black font-bold uppercase hover:bg-white hover:text-black transition-all neo-shadow active:shadow-none inline-block">OPEN_TTY</Link>
                </div>
                <div className="bg-[#2b60ff] text-white p-8 border-4 border-black neo-shadow relative overflow-hidden group">
                    <span className="material-symbols-outlined text-8xl absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">shield</span>
                    <h4 className="text-3xl font-black uppercase mb-4 relative z-10">SECURITY_WATCH</h4>
                    <p className="font-bold uppercase tracking-tighter relative z-10">Automated vulnerability scans on every block proposal.</p>
                    <Link href="/history" className="mt-8 bg-white text-black px-6 py-3 border-2 border-black font-bold uppercase hover:bg-[#c3f400] transition-all neo-shadow active:shadow-none inline-block">VIEW_REPORT</Link>
                </div>
                <div className="bg-white p-8 border-4 border-black neo-shadow relative overflow-hidden group">
                    <span className="material-symbols-outlined text-8xl absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">database</span>
                    <h4 className="text-3xl font-black uppercase mb-4 relative z-10">DATA_SYNC</h4>
                    <p className="font-bold uppercase tracking-tighter relative z-10">Export transaction history to local workbench cache.</p>
                    <Link href="/history" className="mt-8 bg-black text-white px-6 py-3 border-2 border-black font-bold uppercase hover:bg-[#c3f400] hover:text-black transition-all neo-shadow active:shadow-none inline-block">RUN_EXPORT</Link>
                </div>
            </div>

            {/* FAB */}
            <Link
                href="/contracts"
                className="fixed bottom-8 right-8 bg-[#CCFF00] text-black w-16 h-16 border-4 border-black neo-shadow flex items-center justify-center hover:bg-white active:translate-y-1 active:shadow-none transition-all z-50"
            >
                <span className="material-symbols-outlined text-3xl font-bold">add</span>
            </Link>
        </AppShell>
    );
}
