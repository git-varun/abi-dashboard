"use client";

import { AppShell } from '@/components/layout/AppShell';
import Link from 'next/link';

const SHORTCUTS = [
    { keys: '⌘K', desc: 'Open command palette — search functions, tools, history' },
    { keys: 'ESC', desc: 'Close command palette or tool drawer' },
    { keys: 'Tab', desc: 'Cycle through inputs in a function card' },
];

const ROUTES = [
    { path: '/dashboard', desc: 'System overview — activity metrics, pinned contracts, session log' },
    { path: '/workspace', desc: 'Load contract by address or paste ABI, then explore read/write functions inline' },
    { path: '/debugger', desc: 'Simulate write transactions before broadcasting — gas estimation + Tenderly link' },
    { path: '/events', desc: 'Watch contract events live via viem watchContractEvent' },
    { path: '/monitoring', desc: 'Real-time gas prices, live block feed, ETH price' },
    { path: '/history', desc: 'IndexedDB contract visits and transaction log' },
    { path: '/tools', desc: '9 utility tools: Wei, Keccak256, Calldata, 4-Byte, Timestamp, Hex, Token, Storage, Checksum' },
    { path: '/settings', desc: 'Chain selector (wired to wallet), custom RPC override, API key status' },
];

const STACK = [
    { label: 'Framework', value: 'Next.js 15 App Router' },
    { label: 'Language', value: 'TypeScript' },
    { label: 'Styling', value: 'Tailwind CSS — neobrutalism theme' },
    { label: 'Font', value: 'Space Grotesk' },
    { label: 'Wallet', value: 'RainbowKit + Wagmi v2' },
    { label: 'Chain reads', value: 'viem' },
    { label: 'State', value: 'React Context (Workspace, Pipeline)' },
    { label: 'Persistence', value: 'IndexedDB via idb' },
    { label: 'ABI source', value: 'Etherscan V2 API (server action)' },
    { label: 'Price feed', value: 'CoinGecko (60s cache)' },
    { label: 'Simulation', value: 'viem simulateContract' },
];

export default function AboutScreen() {
    return (
        <AppShell>
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-black text-white text-xs font-black border-2 border-black">v1.0</span>
                    <span className="text-xs font-black text-[#737687] uppercase tracking-widest">ABI Workbench</span>
                </div>
                <h1 className="text-5xl font-black uppercase tracking-tight mb-3" style={{ letterSpacing: '-0.02em' }}>ABOUT</h1>
                <p className="text-[#434656] font-medium max-w-2xl">
                    A keyboard-first smart contract workbench for Ethereum developers. Load any contract, explore its functions, simulate transactions, and watch live events — all in one place.
                </p>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Routes reference */}
                <div className="col-span-12 lg:col-span-7 bg-white border-4 border-black neo-shadow">
                    <div className="bg-black text-white p-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#c3f400]">map</span>
                        <h2 className="font-black uppercase tracking-widest">ROUTES</h2>
                    </div>
                    <div className="divide-y-2 divide-black">
                        {ROUTES.map(r => (
                            <div key={r.path} className="p-4 flex items-start gap-4 hover:bg-[#f3f3f3] transition-colors">
                                <Link
                                    href={r.path}
                                    className="shrink-0 font-mono text-xs font-black text-[#2b60ff] hover:underline w-28"
                                >
                                    {r.path}
                                </Link>
                                <p className="text-sm text-[#434656] font-medium">{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Keyboard shortcuts */}
                    <div className="bg-white border-4 border-black neo-shadow">
                        <div className="bg-black text-white p-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#c3f400]">keyboard</span>
                            <h2 className="font-black uppercase tracking-widest">SHORTCUTS</h2>
                        </div>
                        <div className="divide-y-2 divide-black">
                            {SHORTCUTS.map(s => (
                                <div key={s.keys} className="p-4 flex items-center gap-4">
                                    <kbd className="shrink-0 font-mono text-sm font-black bg-[#f3f3f3] border-2 border-black px-3 py-1 w-14 text-center">
                                        {s.keys}
                                    </kbd>
                                    <p className="text-sm text-[#434656] font-medium">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tech stack */}
                    <div className="bg-white border-4 border-black neo-shadow">
                        <div className="bg-black text-white p-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#c3f400]">layers</span>
                            <h2 className="font-black uppercase tracking-widest">TECH STACK</h2>
                        </div>
                        <div className="divide-y-2 divide-black">
                            {STACK.map(s => (
                                <div key={s.label} className="p-3 flex items-center justify-between">
                                    <span className="text-xs font-black uppercase text-[#737687]">{s.label}</span>
                                    <span className="text-xs font-mono font-bold">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Design philosophy */}
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: 'terminal', title: 'KEYBOARD FIRST', body: '⌘K palette, function scroll-to, shortcut keys for every tool. No required mouse interaction.' },
                        { icon: 'bolt', title: 'VALUES ARE ALIVE', body: 'Any rendered output can be hovered to inspect, copied, and piped directly into a utility tool.' },
                        { icon: 'workspace_premium', title: 'ONE WORKSPACE', body: 'Load a contract once — Explorer, Debugger, and Events all share the same workspace state.' },
                    ].map(card => (
                        <div key={card.title} className="bg-[#c3f400] border-4 border-black neo-shadow p-6 relative overflow-hidden">
                            <span className="material-symbols-outlined text-6xl absolute -right-2 -bottom-2 opacity-10">{card.icon}</span>
                            <h4 className="font-black uppercase text-lg mb-3 relative z-10">{card.title}</h4>
                            <p className="text-sm font-medium relative z-10">{card.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
