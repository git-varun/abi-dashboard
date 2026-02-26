"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CardHeaderContent } from "./CardHeader";
import { CardInputs } from "./CardInputs";
import { CardOutput } from "./CardOutput";
import { CardActions } from "./CardActions";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useFunctionLogic } from "./hooks/useFunctionLogic";

export function FunctionCard({ func, abi, address, isWrite }: any) {
    const {
        inputs, setInputs, isLoading, isSimulating,
        readData, hash, error, handleSimulate, handleAction, canExecute
    } = useFunctionLogic(func, abi, address, isWrite);

    return (
        <Card className="overflow-hidden border-zinc-800 bg-zinc-900/40 transition-all hover:border-zinc-700">
            <CardHeader className="bg-zinc-900/60 py-3">
                <CardHeaderContent name={func.name} isWrite={isWrite} isLoading={isLoading} />
            </CardHeader>

            <CardContent className="pt-4">
                {isLoading ? (
                    <div className="space-y-3">
                        <div className="h-4 w-3/4 rounded bg-zinc-800 animate-pulse" />
                        <div className="h-8 w-full rounded bg-zinc-800 animate-pulse" />
                        <div className="h-4 w-1/2 rounded bg-zinc-800 animate-pulse" />
                    </div>
                ) : (
                    <>
                        <CardInputs
                            inputs={func.inputs}
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
                                className="mt-4 w-full border-zinc-700 text-[10px] h-8 gap-2"
                            >
                                {isSimulating ? <Loader2 className="h-3 w-3 animate-spin"/> : <ShieldCheck className="h-3 w-3 text-emerald-500" />}
                                SIMULATE TRANSACTION
                            </Button>
                        )}
                    </>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
                <CardActions isWrite={isWrite} isLoading={isLoading} onAction={handleAction} disabled={!canExecute} />
                <CardOutput readData={readData} hash={hash} error={error} isLoading={isLoading} />
            </CardFooter>
        </Card>
    );
}