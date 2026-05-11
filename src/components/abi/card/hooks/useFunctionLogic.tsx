"use client";

import { useState, useEffect, useCallback } from "react";
import {
    useAccount,
    useChainId,
    useWriteContract,
    useWaitForTransactionReceipt,
    useReadContract
} from "wagmi";
import { Address, type Abi } from "viem";
import { toast } from "sonner";
import { addToHistory } from "@/lib/db";
import { simulateTransaction } from "@/lib/simulate";
import { getNativePriceInINR } from "@/lib/prices";
import {Button} from "@/components/ui/button";

import { AbiEntry, AbiParameter } from "@/hooks/useAbiParser";

export function useFunctionLogic(
    func: AbiEntry,
    abi: AbiEntry[],
    address: Address,
    isWrite: boolean
) {
    const [inputs, setInputs] = useState<string[]>([]);
    // Initialize inputs to match function inputs shape
    useEffect(() => {
        const length = func?.inputs?.length || 0;
        setInputs((prev) => {
            if (prev.length === length) return prev;
            return Array.from({ length }).map(() => '');
        });
    }, [func]);
    const [isSimulating, setIsSimulating] = useState<boolean>(false);

    const { address: userAddress } = useAccount();
    const chainId = useChainId();

    // 1. Hook Definitions
    const { writeContract, data: hash, error: writeError, isPending: isWriting } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // 2. Argument Parsing Utility
    const getParsedArgs = useCallback((): unknown[] => {
        return (func.inputs || []).map((input, i) => {
            const val = inputs[i];
            const type = input.type;

            // Treat empty inputs as undefined so read calls use defaults
            if (val === undefined || val === null || String(val).trim() === '') return undefined;

            try {
                if (type?.includes('int')) {
                    // allow numeric strings
                    return BigInt(String(val));
                }

                if (type === 'bool') return String(val).toLowerCase() === 'true';

                if (type === 'address') {
                    const s = String(val);
                    if (!/^0x[0-9a-fA-F]{40}$/.test(s)) throw new Error('Invalid address');
                    return s;
                }

                // fallback for arrays/tuples: attempt JSON.parse
                if (type?.includes('[') && typeof val === 'string' && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
                    try { return JSON.parse(val); } catch { return val; }
                }

                return val;
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                // If parsing fails, bubble up via toast and return undefined
                toast.error(`Argument parse error for ${func.name}: ${message}`);
                return undefined;
            }
        });
    }, [inputs, func.inputs, func.name]);

    // 3. Read Hook
    const {
        data: readData,
        refetch,
        isFetching,
        error: readError
    } = useReadContract({
        address,
        abi,
        functionName: func.name,
        args: getParsedArgs(),
        query: { enabled: false }
    });

    const isLoading = isWriting || isConfirming || isFetching;

    // 4. Simulation Logic
    const handleSimulate = async () => {
        if (!userAddress) return toast.error("Wallet not connected");

        setIsSimulating(true);

        // The utility now handles the error internally and returns a clean object
        const result = await simulateTransaction(
            address,
            abi,
            func.name || 'unnamed',
            getParsedArgs(),
            userAddress,
            chainId
        );

        if (result.success && result.gasDetails) {
            const inrPrice = await getNativePriceInINR(result.gasDetails.symbol);
            const costINR = (parseFloat(result.gasDetails.totalNative) * inrPrice).toFixed(2);

            toast.success("Simulation Passed", {
                description: (
                    <div className="mt-2 space-y-2">
                        <p className="text-[11px]">Est. Cost: <span className="text-emerald-500 font-bold">₹{costINR}</span></p>
                        <Button
                            variant="outline" size="sm" className="h-7 w-full text-[10px] border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                            onClick={() => window.open(result.tenderlyUrl, '_blank')}
                        >
                            View Tenderly Trace
                        </Button>
                    </div>
                )
            });
        } else {
            // Handle the "Unauthorized" or "Reverted" case professionally
            toast.error("Execution Will Revert", {
                description: (
                    <div className="mt-2 space-y-2">
                        <div className="rounded bg-red-500/10 p-2 border border-red-500/20">
                            <p className="text-[10px] font-mono text-red-400">Error: {result.reason}</p>
                        </div>
                        <Button
                            variant="outline" size="sm" className="h-7 w-full text-[10px] border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                            onClick={() => window.open(result.tenderlyUrl, '_blank')}
                        >
                            Debug on Tenderly
                        </Button>
                    </div>
                ),
                duration: 10000, // Longer duration for failed simulations
            });
        }
        setIsSimulating(false);
    };

    // 5. Action Logic (Write or Read)
    const handleAction = () => {
        try {
            const args = getParsedArgs();
            if (isWrite) {
                // Record attempted transaction in history as pending
                addToHistory({
                    type: 'transaction',
                    address,
                    name: `Tx: ${func.name}`,
                    hash: undefined,
                    chainId,
                    status: 'pending'
                }).catch(() => {});

                writeContract({
                    address,
                    abi: abi as unknown as Abi, // Cast through unknown for wagmi compatibility
                    functionName: func.name as string,
                    args: args as unknown as readonly unknown[],
                });
            } else {
                // Validate required arguments for read calls
                const missing = (func.inputs || []).some((inp: AbiParameter, idx: number) => {
                    const val = args[idx];
                    // If an input is required and value is undefined/null/empty string, mark missing
                    return (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) && inp && inp.type;
                });

                if (missing) {
                    toast.error('Missing required input(s) for read call');
                    return;
                }

                refetch().catch(() => toast.error("Read call failed. Check arguments."));
            }
        } catch (err) {
            toast.error("Argument Error: Ensure numbers and addresses are valid.");
            const message = err instanceof Error ? err.message : String(err);
            // Save failed attempt
            addToHistory({
                type: 'transaction',
                address,
                name: `Tx: ${func.name}`,
                chainId,
                status: 'failed',
                error: message
            }).catch(() => {});
        }
    };

    // 6. Sync Success to History
    useEffect(() => {
        if (isSuccess && hash) {
            addToHistory({
                type: 'transaction',
                address,
                name: `Tx: ${func.name}`,
                hash,
                chainId,
                status: 'success'
            }).catch(() => {});
        }
    }, [isSuccess, hash, address, func.name, chainId]);

    // Monitor write errors to record failed transactions
    useEffect(() => {
        if ((writeError || readError) && !isWriting && !isConfirming) {
            const reason = (writeError || readError)?.message || 'Execution failed';
            addToHistory({
                type: 'transaction',
                address,
                name: `Tx: ${func.name}`,
                chainId,
                status: 'failed',
                error: reason
            }).catch(() => {});
        }
    }, [writeError, readError, isWriting, isConfirming, address, func.name, chainId]);

    // 7. Validation for execution
    const validateForExecute = useCallback((): string[] => {
        const problems: string[] = [];
        const args = inputs;

        (func.inputs || []).forEach((inp: AbiParameter, idx: number) => {
            const raw = args[idx];
            const type = inp?.type || '';

            // Missing value
            if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
                problems.push(`Missing input for ${inp.name || idx} (${type})`);
                return;
            }

            if (type.includes('int')) {
                try { BigInt(String(raw)); } catch { problems.push(`Invalid integer for ${inp.name || idx}`); }
            }

            if (type === 'address') {
                if (!/^0x[0-9a-fA-F]{40}$/.test(String(raw))) problems.push(`Invalid address for ${inp.name || idx}`);
            }

            if (type === 'bool') {
                const s = String(raw).toLowerCase();
                if (!['true', 'false', '0', '1'].includes(s)) problems.push(`Invalid boolean for ${inp.name || idx}`);
            }

            if ((type.includes('[') || type.startsWith('tuple')) && typeof raw === 'string') {
                try { JSON.parse(raw); } catch { problems.push(`Invalid JSON for ${inp.name || idx}`); }
            }
        });

        return problems;
    }, [inputs, func.inputs]);

    const validationMessages = validateForExecute();
    const canExecute = validationMessages.length === 0;

    return {
        inputs,
        setInputs,
        isLoading,
        isSimulating,
        isSuccess,
        isConfirming,
        readData,
        hash,
        error: readError || writeError,
        handleSimulate,
        handleAction,
        validationMessages,
        canExecute,
    };
}