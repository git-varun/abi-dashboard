"use client";

import { useState } from 'react';

interface TestnetWarningModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    chainName: string;
    action: string;
}

export function TestnetWarningModal({
    isOpen,
    onConfirm,
    onCancel,
    chainName,
    action,
}: TestnetWarningModalProps) {
    const [understood, setUnderstood] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white border-4 border-red-500 neo-shadow max-w-md w-full">
                <div className="bg-red-500 text-white p-4 border-b-2 border-red-500">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-2xl">warning</span>
                        <h2 className="text-xl font-black uppercase">TESTNET WARNING</h2>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <p className="font-bold text-sm">
                        You are about to {action} on <span className="text-red-600 font-black uppercase">{chainName}</span>.
                    </p>

                    <ul className="space-y-2 text-sm font-bold list-disc list-inside text-[#555555]">
                        <li>This is a <strong>testnet</strong> — transactions cost testnet tokens</li>
                        <li>Data on testnets may be reset at any time</li>
                        <li>This action <strong>will NOT</strong> affect mainnet</li>
                    </ul>

                    <div className="border-2 border-red-500 p-3 bg-red-50">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={understood}
                                onChange={e => setUnderstood(e.target.checked)}
                                className="mt-1 w-4 h-4 border-2 border-black cursor-pointer"
                                aria-label="I understand the risks"
                            />
                            <span className="text-sm font-bold">
                                I understand this is a testnet and accept the risks
                            </span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-2 p-4 border-t-2 border-black">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-white border-2 border-black py-3 font-bold uppercase hover:bg-[#f3f3f3] transition-colors neo-shadow-sm"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!understood}
                        className="flex-1 bg-red-500 text-white border-2 border-red-600 py-3 font-bold uppercase hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors neo-shadow-sm"
                    >
                        PROCEED
                    </button>
                </div>
            </div>
        </div>
    );
}
