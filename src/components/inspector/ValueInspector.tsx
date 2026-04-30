"use client";

import { useState, useRef } from 'react';
import { inspect, Interpretation } from '@/lib/inspector';
import { usePipeline } from '@/store/pipeline';
import { Copy, ArrowRight, Check } from 'lucide-react';

interface Props {
    value: unknown;
    children: React.ReactNode;
}

export function ValueInspector({ value, children }: Props) {
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { prefill } = usePipeline();

    const interpretations = inspect(value);
    if (interpretations.length === 0) return <>{children}</>;

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShow(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setShow(false), 200);
    };

    const copy = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        } catch { /* ignore */ }
    };

    const pipe = (interp: Interpretation) => {
        if (!interp.pipeTarget) return;
        prefill(interp.pipeTarget, value, 'inspector');
        setShow(false);
    };

    const confidenceColor = (c: Interpretation['confidence']) =>
        c === 'high' ? 'text-emerald-400' : c === 'medium' ? 'text-yellow-400' : 'text-zinc-500';

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className="cursor-help rounded underline decoration-dashed decoration-zinc-600 underline-offset-2 transition-colors hover:decoration-blue-500">
                {children}
            </span>

            {show && (
                <div
                    className="absolute bottom-full left-0 z-50 mb-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/98 shadow-2xl shadow-black/50 backdrop-blur-xl"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="border-b border-white/5 px-3 py-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Value Inspector</p>
                    </div>
                    <div className="divide-y divide-white/5">
                        {interpretations.map((interp, i) => (
                            <div key={i} className="px-3 py-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${confidenceColor(interp.confidence)}`}>
                                            {interp.label}
                                        </p>
                                        <p className="mt-0.5 break-all font-mono text-[10px] text-zinc-300 leading-relaxed">
                                            {interp.value}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => copy(interp.value, `${i}`)}
                                        className="shrink-0 rounded p-1 text-zinc-600 transition-colors hover:text-white"
                                        title="Copy"
                                    >
                                        {copied === `${i}` ? (
                                            <Check className="h-3 w-3 text-emerald-400" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </button>
                                </div>
                                {interp.pipeTarget && (
                                    <button
                                        onClick={() => pipe(interp)}
                                        className="mt-1.5 flex w-full items-center gap-1.5 rounded-lg border border-blue-500/15 bg-blue-500/5 px-2 py-1 text-[9px] font-bold text-blue-400 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10"
                                    >
                                        <ArrowRight className="h-2.5 w-2.5" />
                                        {interp.pipeLabel}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
