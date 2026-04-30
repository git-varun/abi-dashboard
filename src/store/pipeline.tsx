"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

type PipelineEntry = {
    value: unknown;
    fromTool: string;
    toTool: string;
};

type PipelineCtxType = {
    prefill: (toTool: string, value: unknown, fromTool?: string) => void;
    consume: (toolId: string) => unknown | null;
    pending: PipelineEntry | null;
};

const PipelineCtx = createContext<PipelineCtxType | null>(null);

export function PipelineProvider({ children }: { children: ReactNode }) {
    const [pending, setPending] = useState<PipelineEntry | null>(null);
    // Ref for synchronous reads — setPending is async so the event handler
    // that fires in the same tick as prefill() would read stale state otherwise.
    const pendingRef = useRef<PipelineEntry | null>(null);

    const prefill = useCallback((toTool: string, value: unknown, fromTool = 'unknown') => {
        const entry = { value, fromTool, toTool };
        pendingRef.current = entry;
        setPending(entry);
        window.dispatchEvent(new CustomEvent('open-tool', { detail: { toolId: toTool } }));
    }, []);

    const consume = useCallback((toolId: string): unknown | null => {
        if (pendingRef.current?.toTool === toolId) {
            const val = pendingRef.current.value;
            pendingRef.current = null;
            setPending(null);
            return val;
        }
        return null;
    }, []); // no dep on pending state — reads synchronously from ref

    return (
        <PipelineCtx.Provider value={{ prefill, consume, pending }}>
            {children}
        </PipelineCtx.Provider>
    );
}

export function usePipeline() {
    const ctx = useContext(PipelineCtx);
    if (!ctx) throw new Error('usePipeline must be inside PipelineProvider');
    return ctx;
}
