"use client";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
import {ArrowLeft, ShieldCheck} from "lucide-react";
import {FunctionCard} from "../card"; // Adjust import path

export const DashboardExplorer = ({
                                      address, readFunctions, writeFunctions, abi, onReset
                                  }: any) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
            <Button variant="ghost" onClick={onReset} className="text-zinc-500">
                <ArrowLeft className="mr-2 h-4 w-4"/> Reset Configuration
            </Button>
            <div
                className="flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2 font-mono text-[10px] text-zinc-400">
                <ShieldCheck className="h-3 w-3 text-emerald-500"/>
                ACTIVE: <span className="text-blue-400 truncate max-w-[150px]">{address}</span>
            </div>
        </div>

        <Tabs defaultValue="read" className="w-full">
            <TabsList className="mb-10 h-16 w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-1.5">
                <TabsTrigger value="read"
                             className="h-full w-full rounded-xl text-lg font-black tracking-widest">READ</TabsTrigger>
                <TabsTrigger value="write"
                             className="h-full w-full rounded-xl text-lg font-black tracking-widest">WRITE</TabsTrigger>
            </TabsList>

            <TabsContent value="read" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {readFunctions.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-56 rounded-xl border border-zinc-800 bg-black/20 p-4 animate-pulse" />
                    ))
                ) : (
                    readFunctions.map((f: any, i: number) => (
                        <FunctionCard key={i} func={f} abi={abi || []} address={address} isWrite={false} />
                    ))
                )}
            </TabsContent>

            <TabsContent value="write" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {writeFunctions.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-56 rounded-xl border border-zinc-800 bg-black/20 p-4 animate-pulse" />
                    ))
                ) : (
                    writeFunctions.map((f: any, i: number) => (
                        <FunctionCard key={i} func={f} abi={abi || []} address={address} isWrite={true} />
                    ))
                )}
            </TabsContent>
        </Tabs>
    </div>
);