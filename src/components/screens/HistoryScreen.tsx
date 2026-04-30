"use client";

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getAllHistory, type HistoryItem } from '@/lib/db';
import { toast } from 'sonner';

const LIVE_LOGS = [
    { time: '14:02:11', type: 'INFO', msg: 'New block detected: #18,294,002', color: 'text-white' },
    { time: '14:02:14', type: 'EVENT', msg: 'PairCreated detected on Uniswap V3', color: 'text-[#abd600]' },
    { time: '14:02:18', type: 'SOCKET', msg: 'Received 12 new pool events', color: 'text-white' },
    { time: '14:02:22', type: 'INFO', msg: 'Node LHR-02 synchronized', color: 'text-[#b7c4ff]' },
    { time: '14:02:25', type: 'ERROR', msg: 'Gas estimation failed for 0x7a...bc', color: 'text-[#ba1a1a]' },
    { time: '14:02:30', type: 'INFO', msg: 'Memory pool cleaned (0.4s)', color: 'text-white' },
];

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function HistoryScreen() {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        getAllHistory()
            .then(items => setHistory([...items].reverse()))
            .catch(() => { /* IndexedDB may not be ready */ });

        const handler = () => {
            getAllHistory()
                .then(items => setHistory([...items].reverse()))
                .catch(() => {});
        };
        window.addEventListener('history-updated', handler);
        return () => window.removeEventListener('history-updated', handler);
    }, []);

    const loadContract = (item: HistoryItem) => {
        window.dispatchEvent(new CustomEvent('load-contract', {
            detail: { address: item.address, abi: item.abi, name: item.name }
        }));
        toast.success(`Loading ${item.name}`);
    };

    return (
        <AppShell>
            {/* Header */}
            <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tight" style={{ letterSpacing: '-0.02em' }}>HISTORY &amp; EVENT LOGS</h1>
                    <p className="font-bold text-[#737687] uppercase tracking-widest mt-2 text-sm">DETERMINISTIC TRANSACTION REGISTRY // SYSTEM_UPTIME: 99.99%</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-black text-white px-6 py-4 border-2 border-black neo-shadow flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-[#c3f400]">Live Throughput</span>
                        <span className="text-2xl font-black">1,244 TPS</span>
                    </div>
                    <div className="bg-white text-black px-6 py-4 border-2 border-black neo-shadow flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-[#0046dd]">Indexed Events</span>
                        <span className="text-2xl font-black">{history.length > 0 ? history.length : '42.8M'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-6">
                {/* Transaction Registry */}
                <div className="col-span-12 lg:col-span-8 bg-white border-4 border-black neo-shadow overflow-hidden">
                    <div className="bg-black text-white px-4 py-3 flex justify-between items-center">
                        <h3 className="text-lg font-black uppercase flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#c3f400]">list_alt</span>
                            TRANSACTION REGISTRY
                        </h3>
                        <span className="text-[10px] font-mono uppercase bg-zinc-800 px-2 py-1">AUTO_REFRESH: ON</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#eeeeee] border-b-4 border-black">
                                    <th className="p-4 text-xs font-black uppercase border-r-2 border-black">Status</th>
                                    <th className="p-4 text-xs font-black uppercase border-r-2 border-black">Name / Hash</th>
                                    <th className="p-4 text-xs font-black uppercase border-r-2 border-black">Type</th>
                                    <th className="p-4 text-xs font-black uppercase border-r-2 border-black">Address</th>
                                    <th className="p-4 text-xs font-black uppercase">Age</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono text-sm">
                                {history.length === 0 ? (
                                    <>
                                        {[
                                            { status: 'SUCCESS', name: '0x7f8...3e2a', type: 'ExecuteSwap', addr: '0x1F98...', age: '12s ago', statusBg: 'bg-[#c3f400] text-black' },
                                            { status: 'SUCCESS', name: '0xa21...98bc', type: 'TransferETH', addr: '0xdAC1...', age: '24s ago', statusBg: 'bg-[#c3f400] text-black' },
                                            { status: 'PENDING', name: '0xbc5...11ff', type: 'MintNFT', addr: '0x71C7...', age: 'Processing...', statusBg: 'bg-[#ffd7f5] text-[#380038]' },
                                            { status: 'FAILED', name: '0x992...ffda', type: 'ContractDeploy', addr: '0x7d27...', age: '1m ago', statusBg: 'bg-[#ffdad6] text-[#93000a]' },
                                        ].map((row, i) => (
                                            <tr key={i} className="border-b-2 border-black hover:bg-[#f3f3f3] transition-colors">
                                                <td className="p-4 border-r-2 border-black">
                                                    <span className={`${row.statusBg} text-[10px] font-black px-2 py-1 border-2 border-black uppercase`}>{row.status}</span>
                                                </td>
                                                <td className="p-4 border-r-2 border-black text-[#0046dd] font-bold">{row.name}</td>
                                                <td className="p-4 border-r-2 border-black">
                                                    <span className="bg-[#e2e2e2] px-2 py-1 border-2 border-black text-xs">{row.type}</span>
                                                </td>
                                                <td className="p-4 border-r-2 border-black text-[#737687]">{row.addr}</td>
                                                <td className="p-4">{row.age}</td>
                                            </tr>
                                        ))}
                                    </>
                                ) : (
                                    history.slice(0, 20).map((item, i) => (
                                        <tr key={i} className="border-b-2 border-black hover:bg-[#f3f3f3] transition-colors cursor-pointer" onClick={() => item.type === 'contract_visit' && loadContract(item)}>
                                            <td className="p-4 border-r-2 border-black">
                                                <span className={`text-[10px] font-black px-2 py-1 border-2 border-black uppercase ${
                                                    item.status === 'failed' ? 'bg-[#ffdad6] text-[#93000a]' :
                                                    item.status === 'pending' ? 'bg-[#ffd7f5] text-[#380038]' :
                                                    'bg-[#c3f400] text-black'
                                                }`}>
                                                    {item.status ?? (item.type === 'contract_visit' ? 'VISITED' : 'OK')}
                                                </span>
                                            </td>
                                            <td className="p-4 border-r-2 border-black text-[#0046dd] font-bold">
                                                {item.hash ? `${item.hash.slice(0, 8)}...${item.hash.slice(-4)}` : item.name}
                                            </td>
                                            <td className="p-4 border-r-2 border-black">
                                                <span className="bg-[#e2e2e2] px-2 py-1 border-2 border-black text-xs">{item.type === 'transaction' ? 'TX' : 'CONTRACT'}</span>
                                            </td>
                                            <td className="p-4 border-r-2 border-black text-[#737687]">
                                                {item.address.slice(0, 8)}...
                                            </td>
                                            <td className="p-4">{timeAgo(item.timestamp)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-[#e2e2e2] flex justify-center">
                        <button className="text-xs font-black uppercase underline underline-offset-4 hover:text-[#0046dd] transition-colors">
                            Load More History
                        </button>
                    </div>
                </div>

                {/* Live Event Stream Terminal */}
                <div className="col-span-12 lg:col-span-4 bg-black border-4 border-black neo-shadow flex flex-col" style={{ minHeight: '400px' }}>
                    <div className="bg-zinc-800 border-b-2 border-black p-3 flex items-center justify-between">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                        </div>
                        <span className="text-white text-[10px] font-mono font-black uppercase tracking-widest">LIVE_EVENT_STREAM.log</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm text-[#c3f400] overflow-y-auto space-y-2 leading-relaxed">
                        {LIVE_LOGS.map((log, i) => (
                            <p key={i}>
                                <span className="text-zinc-500">[{log.time}]</span>{' '}
                                <span className={log.color}>{log.type}:</span>{' '}
                                {log.msg}
                            </p>
                        ))}
                        <p className="animate-pulse">_</p>
                    </div>
                    <div className="p-2 bg-zinc-900 border-t-2 border-black">
                        <div className="flex gap-2 items-center text-xs text-zinc-400 font-mono">
                            <span className="material-symbols-outlined text-xs">keyboard_arrow_right</span>
                            <input
                                className="bg-transparent border-none outline-none w-full text-white uppercase font-black placeholder:text-zinc-600 text-xs"
                                placeholder="FILTER LOGS..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower grid: Performance chart + storage */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-7 bg-white border-4 border-black neo-shadow">
                    <div className="bg-[#2b60ff] text-white p-4 border-b-2 border-black flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase flex items-center gap-2">
                            <span className="material-symbols-outlined">trending_up</span>
                            INDEX PERFORMANCE (24H)
                        </h3>
                    </div>
                    <div className="p-8 relative h-64 flex flex-col justify-end">
                        <div className="flex items-end justify-between h-48 w-full gap-2 relative">
                            {[50, 66, 75, 50, 83, 75, 66, 50, 80, 66].map((h, i) => (
                                <div
                                    key={i}
                                    className={`w-full border-2 border-black transition-colors hover:bg-[#c3f400] ${i === 4 ? 'bg-[#c3f400]' : 'bg-[#e2e2e2]'}`}
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                            <div className="absolute -bottom-6 left-0 text-[10px] font-bold">00:00</div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">12:00</div>
                            <div className="absolute -bottom-6 right-0 text-[10px] font-bold">23:59</div>
                        </div>
                    </div>
                    <div className="p-4 border-t-2 border-black bg-[#eeeeee] flex gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#c3f400] border-2 border-black"></div>
                            <span className="text-[10px] font-black uppercase">Latent Period</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#e2e2e2] border-2 border-black"></div>
                            <span className="text-[10px] font-black uppercase">Processing Peaks</span>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-5 flex flex-col gap-6">
                    <div className="bg-white border-4 border-black neo-shadow p-6 flex-1 flex flex-col justify-center gap-4">
                        <div className="flex justify-between items-start">
                            <h4 className="text-xs font-black uppercase text-zinc-500">Global Storage Health</h4>
                            <span className="material-symbols-outlined text-[#c3f400] text-4xl">cloud_sync</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-5xl font-black">98.2%</span>
                            <div className="flex flex-col">
                                <span className="text-xs font-black bg-black text-white px-2 py-0.5">OPTIMIZED</span>
                                <span className="text-[10px] font-bold uppercase text-zinc-400">Next Audit in 4H</span>
                            </div>
                        </div>
                        <div className="h-4 w-full bg-[#eeeeee] border-2 border-black overflow-hidden">
                            <div className="h-full bg-[#c3f400] border-r-2 border-black" style={{ width: '98.2%' }}></div>
                        </div>
                    </div>
                    <div className="bg-white border-4 border-black neo-shadow p-4 flex gap-4 items-center">
                        <div className="w-12 h-12 bg-[#c600c6] border-2 border-black flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white">storage</span>
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase">ACTIVE_NODES_CLUSTER</h4>
                            <p className="text-xs font-mono font-bold">254/256 ONLINE</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
