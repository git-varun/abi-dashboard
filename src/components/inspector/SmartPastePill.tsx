"use client";

import { inspect } from '@/lib/inspector';
import { usePipeline } from '@/store/pipeline';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface Props {
    value: string;
    onDismiss: () => void;
}

export function SmartPastePill({ value, onDismiss }: Props) {
    const { prefill } = usePipeline();
    const interpretations = inspect(value).filter(i => i.pipeTarget);

    if (interpretations.length === 0) return null;

    const primary = interpretations[0];

    return (
        <div className="animate-in slide-in-from-bottom-2 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-[11px]">
            <Sparkles className="h-3 w-3 shrink-0 text-blue-400" />
            <span className="text-zinc-400">
                Looks like <span className="font-bold text-white">{primary.label}</span>
                {primary.value && <> — {primary.value}</>}
            </span>
            {primary.pipeTarget && (
                <button
                    onClick={() => { prefill(primary.pipeTarget!, value, 'paste'); onDismiss(); }}
                    className="flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-bold text-blue-400 hover:bg-blue-500/20"
                >
                    <ArrowRight className="h-2.5 w-2.5" />
                    {primary.pipeLabel}
                </button>
            )}
            <button onClick={onDismiss} className="ml-auto shrink-0 text-zinc-600 hover:text-white">
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}
