"use client";

import { AppShell } from '@/components/layout/AppShell';
import Link from 'next/link';

const TIERS = [
    {
        id: 'TIER_1',
        name: 'DAILY UTILITIES',
        badge: 'bg-[#c3f400] text-[#161e00]',
        header: 'bg-[#c3f400]',
        price: 'FREE',
        description: 'Core cryptographic tools for every Ethereum developer.',
        features: [
            { label: 'Wei / Gwei / ETH Converter', included: true },
            { label: 'Keccak256 Hasher', included: true },
            { label: 'Calldata Decoder', included: true },
            { label: '4-Byte Selector Lookup', included: true },
            { label: 'Unix Timestamp Converter', included: true },
            { label: 'Hex / Decimal / Binary Converter', included: true },
            { label: 'Token Formatter', included: true },
            { label: 'Storage Slot Calculator', included: true },
            { label: 'Address Checksum (EIP-55)', included: true },
            { label: 'Contract ABI Explorer', included: true },
            { label: 'Live Monitoring Dashboard', included: true },
            { label: 'Transaction Simulation', included: true },
        ],
        cta: { label: 'OPEN TOOLS', href: '/tools' },
    },
    {
        id: 'TIER_2',
        name: 'WORKBENCH PRO',
        badge: 'bg-[#2b60ff] text-white',
        header: 'bg-[#2b60ff] text-white',
        price: 'PROTOCOL',
        description: 'Full ABI import, function explorer, and real-time chain monitoring.',
        features: [
            { label: 'Everything in Tier 1', included: true },
            { label: 'Contract ABI Explorer', included: true },
            { label: 'Read / Write Function Cards', included: true },
            { label: 'Gas Estimation (Low / Market / Fast)', included: true },
            { label: 'Live Monitoring Dashboard', included: true },
            { label: 'Block Feed + Gas History', included: true },
            { label: 'Multi-Chain Support (7 networks)', included: true },
            { label: 'Contract History (IndexedDB)', included: true },
            { label: 'Transaction Simulation', included: true },
            { label: 'Tenderly Fork Integration', included: true },
        ],
        cta: { label: 'OPEN EXPLORER', href: '/explorer' },
    },
    {
        id: 'TIER_3',
        name: 'FULL SUITE',
        badge: 'bg-[#c600c6] text-white',
        header: 'bg-[#c600c6] text-white',
        price: 'COMING SOON',
        description: 'Transaction simulation, Tenderly integration, and advanced debugging.',
        features: [
            { label: 'Everything in Tier 2', included: true },
            { label: 'Transaction Simulation Engine', included: true },
            { label: 'Tenderly Fork Integration', included: true },
            { label: 'Advanced Debugger', included: true },
            { label: 'Proxy Detection (EIP-1967, EIP-897)', included: true },
            { label: 'Pinned Contract Monitor', included: true },
            { label: 'Security Watch Scans', included: true },
            { label: 'Data Export (CSV / JSON)', included: true },
        ],
        cta: { label: 'OPEN DEBUGGER', href: '/debugger' },
    },
];

export default function TiersScreen() {
    return (
        <AppShell>
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-black text-white text-xs font-black border-2 border-black">PROTOCOL</span>
                    <span className="text-xs font-black text-[#737687] uppercase tracking-widest">Feature Access Levels</span>
                </div>
                <h1 className="text-5xl font-black uppercase tracking-tight mb-3" style={{ letterSpacing: '-0.02em' }}>TIERS</h1>
                <p className="text-[#434656] font-medium max-w-2xl">
                    Access to ABI Workbench capabilities is structured in tiers. All tools are open — tiers reflect the scope of chain interaction each level unlocks.
                </p>
            </div>

            {/* Tier Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {TIERS.map(tier => (
                    <div key={tier.id} className="border-4 border-black neo-shadow flex flex-col bg-white">
                        {/* Header */}
                        <div className={`${tier.header} border-b-4 border-black p-6`}>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 text-xs font-black border-2 border-black ${tier.badge}`}>{tier.id}</span>
                                <span className="font-black text-lg uppercase">{tier.price}</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase">{tier.name}</h3>
                            <p className="text-sm font-medium mt-2 opacity-80">{tier.description}</p>
                        </div>

                        {/* Features */}
                        <div className="flex-1 p-6 space-y-3">
                            {tier.features.map(f => (
                                <div key={f.label} className="flex items-center gap-3">
                                    {f.included ? (
                                        <span className="material-symbols-outlined text-[16px] text-[#506600] shrink-0">check_circle</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[16px] text-[#737687] shrink-0">remove_circle</span>
                                    )}
                                    <span className={`text-sm font-medium ${f.included ? 'text-black' : 'text-[#737687]'}`}>{f.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="p-6 border-t-2 border-black">
                            <Link
                                href={tier.cta.href}
                                className="block w-full bg-black text-white border-2 border-black neo-shadow py-4 font-black uppercase text-center text-sm hover:bg-[#c3f400] hover:text-black active:shadow-none active:translate-y-0.5 transition-all"
                            >
                                {tier.cta.label}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparison note */}
            <div className="border-2 border-dashed border-black p-6 flex items-start gap-4">
                <span className="material-symbols-outlined text-[#2b60ff] shrink-0">info</span>
                <p className="text-sm text-[#434656] font-medium">
                    All capabilities are available. Tiers represent the scope of chain interaction each workflow covers — not feature gates. Network calls always go through your connected wallet — no data is stored server-side.
                </p>
            </div>
        </AppShell>
    );
}
