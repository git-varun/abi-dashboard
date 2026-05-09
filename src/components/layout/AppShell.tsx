"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CommandPalette } from './CommandPalette';
import { ToolDrawer } from './ToolDrawer';
import { useCommandPalette } from '@/hooks/useCommandPalette';

const SIDE_NAV = [
    {
        section: 'WORKBENCH',
        items: [
            { href: '/dashboard', label: 'DASHBOARD', icon: 'dashboard' },
        ],
    },
    {
        section: 'CONTRACT TOOLS',
        items: [
            { href: '/workspace', label: 'WORKSPACE', icon: 'terminal' },
            { href: '/debugger',  label: 'DEBUGGER',  icon: 'bug_report', indent: true },
            { href: '/events',    label: 'EVENTS',    icon: 'event_note', indent: true },
            { href: '/compare',   label: 'ABI DIFF',  icon: 'difference',  indent: true },
        ],
    },
    {
        section: 'ANALYTICS',
        items: [
            { href: '/monitoring', label: 'MONITORING', icon: 'analytics' },
            { href: '/history',    label: 'HISTORY',    icon: 'history' },
        ],
    },
    {
        section: 'SYSTEM',
        items: [
            { href: '/tools',    label: 'TOOLS',    icon: 'build' },
            { href: '/settings', label: 'SETTINGS', icon: 'settings' },
            { href: '/about',    label: 'ABOUT',    icon: 'info' },
        ],
    },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isOpen, open, close } = useCommandPalette();

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            {/* Top Nav */}
            <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-white border-b-4 border-black neo-shadow">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-2xl font-black text-black tracking-tighter uppercase hover:text-[#2B60FF] transition-colors">
                        ABI_WORKBENCH
                    </Link>
                    <span className="hidden md:block text-[#e2e2e2] font-bold select-none">|</span>
                    <span className="hidden md:block text-xs font-bold uppercase text-[#737687] tracking-widest">
                        {pathname.replace('/', '').toUpperCase() || 'DASHBOARD'}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={open}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-black neo-shadow bg-white hover:bg-[#c3f400] transition-colors font-bold text-sm uppercase"
                        title="Search (⌘K)"
                    >
                        <span className="material-symbols-outlined text-[18px]">search</span>
                        <kbd className="font-mono text-xs">⌘K</kbd>
                    </button>
                    <ConnectButton accountStatus="address" showBalance={false} chainStatus="icon" />
                </div>
            </nav>

            {/* Side Nav */}
            <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-80px)] flex flex-col border-r-4 border-black bg-white z-40">
                <div className="flex-1 overflow-y-auto py-4 space-y-6">
                    {SIDE_NAV.map(group => (
                        <div key={group.section}>
                            <p className="px-5 mb-1 text-[10px] font-black uppercase tracking-widest text-[#737687]">
                                {group.section}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map(item => {
                                    const active = pathname === item.href;
                                    const indented = (item as any).indent;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 py-2.5 font-bold uppercase transition-all ${
                                                indented ? 'pl-10 pr-3' : 'px-3 mx-2'
                                            } ${
                                                active
                                                    ? 'bg-[#CCFF00] text-black border-2 border-black neo-shadow'
                                                    : 'text-black hover:bg-[#2B60FF] hover:text-white'
                                            } ${indented && !active ? 'text-[#737687]' : ''}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                            <span className={indented ? 'text-xs' : 'text-sm'}>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="p-4 border-t-4 border-black">
                    <Link
                        href="/workspace"
                        className="block w-full bg-[#c3f400] text-[#161e00] border-2 border-black neo-shadow py-4 font-bold uppercase tracking-widest text-center hover:bg-[#abd600] active:translate-y-1 active:shadow-none transition-all"
                    >
                        LOAD CONTRACT
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 mt-20 p-8 min-h-[calc(100vh-80px)] bg-[#f9f9f9]">
                {children}
            </main>

            {/* Command Palette */}
            <CommandPalette isOpen={isOpen} onClose={close} />

            {/* Tool Drawer — handles open-tool events from ValueInspector + CommandPalette */}
            <ToolDrawer />
        </div>
    );
}
