"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { findTool } from '@/components/tools/registry';
import { usePipeline } from '@/store/pipeline';

type ToolProps = { prefilled?: unknown };

const TOOL_COMPONENTS: Record<string, React.ComponentType<ToolProps>> = {
    wei:            dynamic(() => import('@/components/tools/WeiConverter').then(m => ({ default: m.WeiConverter })), { ssr: false }),
    keccak:         dynamic(() => import('@/components/tools/Keccak256').then(m => ({ default: m.Keccak256 })), { ssr: false }),
    timestamp:      dynamic(() => import('@/components/tools/TimestampConverter').then(m => ({ default: m.TimestampConverter })), { ssr: false }),
    hex:            dynamic(() => import('@/components/tools/HexDecConverter').then(m => ({ default: m.HexDecConverter })), { ssr: false }),
    calldata:       dynamic(() => import('@/components/tools/CalldataDecoder').then(m => ({ default: m.CalldataDecoder })), { ssr: false }),
    fourByte:       dynamic(() => import('@/components/tools/FourByteSelector').then(m => ({ default: m.FourByteSelector })), { ssr: false }),
    tokenFormatter: dynamic(() => import('@/components/tools/TokenFormatter').then(m => ({ default: m.TokenFormatter })), { ssr: false }),
    storageSlot:    dynamic(() => import('@/components/tools/StorageSlot').then(m => ({ default: m.StorageSlot })), { ssr: false }),
    addressChecksum:dynamic(() => import('@/components/tools/AddressChecksum').then(m => ({ default: m.AddressChecksum })), { ssr: false }),
};

export function ToolDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeToolId, setActiveToolId] = useState<string | null>(null);
    const [prefilled, setPrefilled] = useState<unknown>(null);
    const { consume } = usePipeline();
    const consumeRef = useRef(consume);
    consumeRef.current = consume;

    useEffect(() => {
        const handler = (e: Event) => {
            const { toolId } = (e as CustomEvent<{ toolId: string }>).detail;
            const val = consumeRef.current(toolId);
            setPrefilled(val);
            setActiveToolId(toolId);
            setIsOpen(true);
        };
        window.addEventListener('open-tool', handler);
        return () => window.removeEventListener('open-tool', handler);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen]);

    function close() {
        setIsOpen(false);
        setPrefilled(null);
    }

    const tool = activeToolId ? findTool(activeToolId) : null;
    const ToolComponent = activeToolId ? TOOL_COMPONENTS[activeToolId] : null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[60]"
                    onClick={close}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-[420px] bg-white border-l-4 border-black z-[70] flex flex-col transition-transform duration-200 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b-4 border-black bg-black shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-white font-black uppercase tracking-tight text-lg">
                            {tool?.name ?? 'TOOL'}
                        </span>
                        {tool && (
                            <span className="px-2 py-0.5 bg-[#c3f400] text-[#161e00] text-[10px] font-black border border-[#c3f400] uppercase">
                                {tool.shortcut}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={close}
                        className="text-white hover:bg-[#2b60ff] p-1 transition-colors"
                        aria-label="Close tool drawer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {ToolComponent ? (
                        <ToolComponent prefilled={prefilled ?? undefined} />
                    ) : (
                        <p className="text-sm font-bold uppercase text-[#737687]">No tool selected.</p>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t-4 border-black px-5 py-3 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#737687] tracking-widest">
                        {tool?.description ?? ''}
                    </span>
                    <kbd className="text-[10px] font-mono text-[#737687] border border-[#737687] px-1.5 py-0.5">ESC</kbd>
                </div>
            </div>
        </>
    );
}
