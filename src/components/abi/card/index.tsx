"use client";

import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CardHeaderContent } from "./CardHeader";
import { CardInputs } from "./CardInputs";
import { CardOutput } from "./CardOutput";
import { CardActions } from "./CardActions";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useFunctionLogic } from "./hooks/useFunctionLogic";

import { AbiEntry } from "@/hooks/useAbiParser";
import { Address } from "viem";

interface FunctionCardProps {
    func: AbiEntry;
    abi: AbiEntry[];
    address: Address;
    isWrite: boolean;
}

export function FunctionCard({ func, abi, address, isWrite }: FunctionCardProps) {
    const {
        inputs, setInputs, isLoading, isSimulating,
        readData, hash, error, handleSimulate, handleAction, canExecute,
        isSuccess, isConfirming
    } = useFunctionLogic(func, abi, address, isWrite);

    return (
        <div className={`group relative overflow-hidden transition-all duration-200 ${
            isWrite
                ? 'border-l-4 border-l-[#9d009d]'
                : 'border-l-4 border-l-[#0046dd]'
        }`}>
            <CardHeader className={`py-3 px-4 ${isWrite ? 'bg-[#ffd7f5]' : 'bg-[#dde1ff]'}`}>
                <CardHeaderContent name={func.name || 'unnamed'} isWrite={isWrite} isLoading={isLoading} isSuccess={isSuccess} isConfirming={isConfirming} />
            </CardHeader>

            <CardContent className="px-4 pt-3 pb-2 bg-white">
                {isLoading ? (
                    <div className="space-y-3">
                        <div className="h-4 w-3/4 bg-[#e2e2e2] animate-pulse" />
                        <div className="h-8 w-full bg-[#e2e2e2] animate-pulse" />
                        <div className="h-4 w-1/2 bg-[#e2e2e2] animate-pulse" />
                    </div>
                ) : (
                    <>
                        <CardInputs
                            inputs={func.inputs || []}
                            onInputChange={(idx: number, val: string) => {
                                const next = [...inputs];
                                next[idx] = val;
                                setInputs(next);
                            }}
                        />

                        {isWrite && (
                            <Button
                                onClick={handleSimulate}
                                disabled={isSimulating || isLoading}
                                variant="outline"
                                className="mt-4 w-full border-2 border-[#9d009d] bg-white text-[10px] h-8 gap-2 text-[#9d009d] hover:bg-[#ffd7f5] transition-colors"
                            >
                                {isSimulating ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                                Simulate Transaction
                            </Button>
                        )}
                    </>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 px-4 pb-4 bg-white">
                <CardActions isWrite={isWrite} isLoading={isLoading} onAction={handleAction} disabled={!canExecute} />
                <CardOutput readData={readData} hash={hash} error={error} isLoading={isLoading} />
            </CardFooter>
        </div>
    );
}
