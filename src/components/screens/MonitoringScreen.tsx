"use client";

import { useRef, useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useLiveChain } from '@/hooks/useLiveChain';

const MAX_GAS_HISTORY = 10;

type GasSnapshot = { height: string; label: string };

function toSnapshot(gwei: number, max: number): GasSnapshot {
    const pct = Math.min(100, Math.round((gwei / max) * 100));
    return { height: `${pct}%`, label: gwei.toFixed(1) };
}

const BLOCK_FEED = [
    { block: '20,184,512', txs: 218, gasUsed: '87%', miner: '0xbea...c44', time: '12s ago' },
    { block: '20,184,511', txs: 194, gasUsed: '79%', miner: '0x1f9...d3a', time: '24s ago' },
    { block: '20,184,510', txs: 241, gasUsed: '98%', miner: '0x4b8...11c', time: '36s ago' },
    { block: '20,184,509', txs: 183, gasUsed: '74%', miner: '0xbea...c44', time: '48s ago' },
    { block: '20,184,508', txs: 209, gasUsed: '85%', miner: '0xd4e...77b', time: '1m ago' },
];

export default function MonitoringScreen() {
    const { blockNumber, gasData, ethPriceUsd, isNewBlock } = useLiveChain();

    const ringBuffer = useRef<GasSnapshot[]>([]);
    const [gasHistory, setGasHistory] = useState<GasSnapshot[]>([]);

    useEffect(() => {
        if (!gasData?.standard) return;
        const gwei = Number(gasData.standard);
        if (isNaN(gwei)) return;

        const buf = ringBuffer.current;
        buf.push({ height: '0%', label: gwei.toFixed(1) }); // placeholder, recalculate below
        if (buf.length > MAX_GAS_HISTORY) buf.shift();

        // normalize heights relative to the max in the buffer
        const maxGwei = Math.max(...buf.map(s => parseFloat(s.label)));
        const normalized = buf.map(s => toSnapshot(parseFloat(s.label), maxGwei));
        ringBuffer.current = normalized;
        setGasHistory([...normalized]);
    }, [gasData]);

    return (
        <AppShell>
            {/* Header */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-[#c3f400] text-[#161e00] text-xs font-black border-2 border-black">LIVE</span>
                        <span className="text-xs font-black text-[#737687] uppercase tracking-widest">Real-Time Chain Telemetry</span>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tight" style={{ letterSpacing: '-0.02em' }}>MONITORING</h1>
                    <p className="text-[#434656] font-bold uppercase tracking-tight mt-1">MAINNET — POLLING EVERY 12s</p>
                </div>
                <div className="flex gap-3">
                    <div className={`px-4 py-2 bg-white border-2 border-black neo-shadow font-bold flex items-center gap-2 transition-colors ${isNewBlock ? 'bg-[#c3f400]' : ''}`}>
                        <span className="w-2 h-2 rounded-full bg-[#c3f400] animate-pulse"></span>
                        BLOCK: {blockNumber ? blockNumber.toLocaleString() : '—'}
                    </div>
                    <div className="px-4 py-2 bg-white border-2 border-black neo-shadow font-bold">
                        ETH: {ethPriceUsd ? `$${ethPriceUsd.toLocaleString()}` : '—'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Live Gas Cards */}
                <div className="col-span-12 lg:col-span-4 bg-white border-4 border-black neo-shadow p-6 flex flex-col justify-between group hover:bg-[#c3f400] transition-all">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-black uppercase text-[#737687]">GAS — SLOW</span>
                        <span className="material-symbols-outlined">gas_meter</span>
                    </div>
                    <div className="mt-6">
                        <span className="text-4xl font-black">{gasData ? `${gasData.slow} GWEI` : '—'}</span>
                        <p className="text-xs font-bold text-[#737687] mt-1 uppercase">~2 min confirmation</p>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-4 bg-[#2b60ff] text-white border-4 border-black neo-shadow p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-black uppercase text-[#b7c4ff]">GAS — STANDARD</span>
                        <span className="material-symbols-outlined">local_gas_station</span>
                    </div>
                    <div className="mt-6">
                        <span className="text-4xl font-black">{gasData ? `${gasData.standard} GWEI` : '—'}</span>
                        <p className="text-xs font-bold text-[#b7c4ff] mt-1 uppercase">~30 sec confirmation</p>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-4 bg-white border-4 border-black neo-shadow p-6 flex flex-col justify-between group hover:bg-[#c600c6] hover:text-white transition-all">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-black uppercase text-[#737687] group-hover:text-[#ffd7f5]">GAS — FAST</span>
                        <span className="material-symbols-outlined">bolt</span>
                    </div>
                    <div className="mt-6">
                        <span className="text-4xl font-black">{gasData ? `${gasData.fast} GWEI` : '—'}</span>
                        <p className="text-xs font-bold text-[#737687] group-hover:text-[#ffd7f5] mt-1 uppercase">~12 sec confirmation</p>
                    </div>
                </div>

                {/* Gas History Chart */}
                <div className="col-span-12 xl:col-span-8 bg-white border-2 border-black neo-shadow">
                    <div className="bg-black text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#b7c4ff]">bar_chart</span>
                            GAS_PRICE_HISTORY — LAST 10 BLOCKS
                        </h3>
                        <span className="text-[10px] font-mono text-[#737687] uppercase">GWEI</span>
                    </div>
                    <div className="p-8 h-64 flex items-end gap-3 justify-between">
                        {gasHistory.map((bar, i) => (
                            <div
                                key={i}
                                className="w-full bg-[#2b60ff] hover:bg-[#c3f400] border-t-2 border-black relative group transition-colors"
                                style={{ height: bar.height }}
                            >
                                <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 uppercase whitespace-nowrap">
                                    {bar.label}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t-2 border-black p-4 flex justify-between text-[10px] font-bold uppercase text-[#737687]">
                        <span>-10 BLK</span><span>-8</span><span>-6</span><span>-4</span><span>-2</span><span>-1</span><span>LATEST</span>
                    </div>
                </div>

                {/* Network Status */}
                <div className="col-span-12 xl:col-span-4 bg-black border-2 border-black neo-shadow flex flex-col" style={{ minHeight: '360px' }}>
                    <div className="p-4 border-b-2 border-[#333] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#c3f400] animate-pulse"></div>
                            <span className="text-[#c3f400] font-mono text-sm uppercase">NETWORK_STATUS</span>
                        </div>
                    </div>
                    <div className="flex-1 p-4 space-y-3">
                        {[
                            { net: 'MAINNET', status: 'ONLINE', gas: gasData?.standard ?? '—', color: 'text-[#c3f400]', dot: 'bg-[#c3f400]' },
                            { net: 'ARBITRUM', status: 'ONLINE', gas: '0.1', color: 'text-[#c3f400]', dot: 'bg-[#c3f400]' },
                            { net: 'BASE', status: 'ONLINE', gas: '0.1', color: 'text-[#c3f400]', dot: 'bg-[#c3f400]' },
                            { net: 'OPTIMISM', status: 'ONLINE', gas: '0.1', color: 'text-[#c3f400]', dot: 'bg-[#c3f400]' },
                            { net: 'POLYGON', status: 'ONLINE', gas: '30', color: 'text-[#c3f400]', dot: 'bg-[#c3f400]' },
                            { net: 'SEPOLIA', status: 'ONLINE', gas: '5', color: 'text-[#c3f400]', dot: 'bg-[#c3f400]' },
                        ].map(n => (
                            <div key={n.net} className="flex items-center justify-between font-mono text-xs border-b border-[#222] pb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${n.dot}`}></span>
                                    <span className="text-white uppercase">{n.net}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[#666] uppercase">{n.gas} GWEI</span>
                                    <span className={`${n.color} uppercase font-black text-[10px]`}>{n.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Block Feed */}
                <div className="col-span-12 bg-white border-2 border-black neo-shadow">
                    <div className="bg-black text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#c3f400]">view_list</span>
                            BLOCK_FEED — LATEST PROPOSALS
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="border-b-4 border-black">
                                <tr className="bg-[#f3f3f3] font-bold uppercase text-xs">
                                    <th className="p-4 border-r-2 border-black">BLOCK</th>
                                    <th className="p-4 border-r-2 border-black">TXS</th>
                                    <th className="p-4 border-r-2 border-black">GAS USED</th>
                                    <th className="p-4 border-r-2 border-black">MINER</th>
                                    <th className="p-4">TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {BLOCK_FEED.map((b, i) => (
                                    <tr key={i} className="border-b-2 border-black hover:bg-[#e8e8e8] transition-colors">
                                        <td className="p-4 border-r-2 border-black font-mono font-bold text-[#2b60ff]">{b.block}</td>
                                        <td className="p-4 border-r-2 border-black font-bold">{b.txs}</td>
                                        <td className="p-4 border-r-2 border-black">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-[#eeeeee] h-2 border border-black overflow-hidden">
                                                    <div className="bg-[#c3f400] h-full" style={{ width: b.gasUsed }}></div>
                                                </div>
                                                <span className="font-bold text-xs">{b.gasUsed}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r-2 border-black font-mono text-sm text-[#737687]">{b.miner}</td>
                                        <td className="p-4 text-xs font-bold text-[#737687] uppercase">{b.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
