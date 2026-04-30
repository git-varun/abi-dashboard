"use client";

import { AppShell } from '@/components/layout/AppShell';
import { WeiConverter } from '@/components/tools/WeiConverter';
import { Keccak256 } from '@/components/tools/Keccak256';
import { CalldataDecoder } from '@/components/tools/CalldataDecoder';
import { TimestampConverter } from '@/components/tools/TimestampConverter';
import { HexDecConverter } from '@/components/tools/HexDecConverter';
import { FourByteSelector } from '@/components/tools/FourByteSelector';
import { TokenFormatter } from '@/components/tools/TokenFormatter';
import { StorageSlot } from '@/components/tools/StorageSlot';
import { AddressChecksum } from '@/components/tools/AddressChecksum';

function ToolCard({ title, icon, dark, children }: { title: string; icon: string; dark?: boolean; children: React.ReactNode }) {
    return (
        <div className={`border-4 border-black neo-shadow flex flex-col ${dark ? 'bg-zinc-900' : 'bg-white'}`}>
            <div className={`p-4 border-b-2 border-black flex items-center justify-between ${dark ? 'border-zinc-700' : ''}`}>
                <h3 className={`font-black uppercase text-xl flex items-center gap-3 ${dark ? 'text-white' : 'text-black'}`}>
                    <span className={`material-symbols-outlined p-1 ${dark ? 'text-[#CCFF00]' : 'bg-[#2b60ff] text-white'}`}>{icon}</span>
                    {title}
                </h3>
            </div>
            <div className="p-6 flex-1">
                {children}
            </div>
        </div>
    );
}

export default function ToolsScreen() {
    return (
        <AppShell>
            {/* Header */}
            <header className="mb-16">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-[#c3f400] text-[#161e00] text-xs font-black border-2 border-black">TIER 1</span>
                    <span className="text-xs font-black text-[#737687] uppercase tracking-widest">Global Protocol Standards</span>
                </div>
                <h1 className="text-5xl font-black uppercase tracking-tight mb-3" style={{ letterSpacing: '-0.02em' }}>DAILY UTILITIES</h1>
                <p className="text-[#434656] font-medium max-w-2xl">
                    Essential cryptographic and unit conversion tools for Ethereum developers. Raw access to keccak256, wei conversion, and calldata inspection.
                </p>
            </header>

            {/* Tool Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Wei Converter — col-span-8 */}
                <div className="col-span-12 lg:col-span-8">
                    <ToolCard title="Wei / Gwei / ETH Converter" icon="swap_horiz">
                        <WeiConverter />
                    </ToolCard>
                </div>

                {/* Keccak256 — col-span-4, dark */}
                <div className="col-span-12 lg:col-span-4">
                    <ToolCard title="Keccak256" icon="fingerprint" dark>
                        <Keccak256 />
                    </ToolCard>
                </div>

                {/* Calldata Decoder — col-span-6 */}
                <div className="col-span-12 lg:col-span-6">
                    <ToolCard title="Calldata Decoder" icon="data_object">
                        <CalldataDecoder />
                    </ToolCard>
                </div>

                {/* 4-Byte Selector — col-span-6 */}
                <div className="col-span-12 lg:col-span-6">
                    <ToolCard title="4-Byte Selector" icon="search">
                        <FourByteSelector />
                    </ToolCard>
                </div>

                {/* Timestamp Converter — col-span-3 */}
                <div className="col-span-12 lg:col-span-3">
                    <ToolCard title="Unix Time" icon="schedule">
                        <TimestampConverter />
                    </ToolCard>
                </div>

                {/* Hex/Dec Converter — col-span-3 */}
                <div className="col-span-12 lg:col-span-3">
                    <ToolCard title="Base Conv." icon="calculate">
                        <HexDecConverter />
                    </ToolCard>
                </div>

                {/* Token Formatter — col-span-3 */}
                <div className="col-span-12 lg:col-span-3">
                    <ToolCard title="Token Formatter" icon="token">
                        <TokenFormatter />
                    </ToolCard>
                </div>

                {/* Storage Slot — col-span-3 */}
                <div className="col-span-12 lg:col-span-3">
                    <ToolCard title="Storage Slot" icon="storage">
                        <StorageSlot />
                    </ToolCard>
                </div>

                {/* Address Checksum — col-span-6 */}
                <div className="col-span-12 lg:col-span-6">
                    <ToolCard title="Address Checksum" icon="shield_person">
                        <AddressChecksum />
                    </ToolCard>
                </div>

                {/* Quick Access Bar */}
                <div className="col-span-12 border-2 border-dashed border-black p-6 flex items-center justify-center gap-8 overflow-x-auto flex-wrap">
                    <span className="text-xs font-black text-[#737687] uppercase shrink-0">FREQUENTLY USED:</span>
                    {[
                        { icon: 'bolt', label: 'FAST_WEI' },
                        { icon: 'token', label: 'ERC20_ABI' },
                        { icon: 'visibility', label: 'ADDR_CHKSUM' },
                        { icon: 'history', label: 'TX_REPLAY' },
                    ].map(item => (
                        <button key={item.label} className="px-4 py-2 bg-white border-2 border-black text-xs font-black neo-shadow hover:bg-[#c3f400] active:shadow-none active:translate-y-0.5 transition-all flex items-center gap-2 uppercase">
                            <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t-4 border-black grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-2">
                    <p className="font-mono text-xs text-zinc-600 mb-2">SYSTEM_LOG_v1.0.4.88</p>
                    <div className="bg-black text-[#c3f400] p-4 font-mono text-xs h-32 overflow-y-auto">
                        {'> Initializing daily_utils.sh...'}<br/>
                        {'> Loading Keccak libraries... OK'}<br/>
                        {'> Unit converter active.'}<br/>
                        {'> Calldata buffer: 0x00...'}<br/>
                        {'> System ready for blockchain operations.'}<br/>
                        <span className="animate-pulse">_</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase">DEVELOPER RESOURCES</h4>
                    <ul className="text-[#434656] text-sm space-y-1">
                        <li><span className="font-medium">EVM Opcodes</span></li>
                        <li><span className="font-medium">Solidity Docs</span></li>
                        <li><span className="font-medium">Chainlist.org</span></li>
                    </ul>
                </div>
                <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase">NETWORK STATUS</h4>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#c3f400] border-2 border-black"></div>
                        <span className="text-xs font-black">MAINNET: ONLINE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#c3f400] border-2 border-black"></div>
                        <span className="text-xs font-black">SEPOLIA: ONLINE</span>
                    </div>
                </div>
            </footer>
        </AppShell>
    );
}
