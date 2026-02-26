"use client";

import {useEffect, useState} from "react";
import {useAbiParser} from "@/hooks/useAbiParser";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {useChainId} from "wagmi";
import {toast} from "sonner";
import { Zap } from 'lucide-react';
import {fetchUniversalAbi} from "@/app/actions/abi";
import {addToHistory} from "@/lib/db"; // Our new IndexedDB utility
import {DashboardHeader} from "./DashboardHeader";
import {DashboardIntake} from "./DashboardIntake";
import {DashboardExplorer} from "./DashboardExplorer";
import {DashboardFooter} from "./DashboardFooter";

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [address, setAddress] = useState("");
    const [abiInput, setAbiInput] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchStep, setFetchStep] = useState<string | null>(null);
    const [isProxy, setIsProxy] = useState<boolean>(false);
    const [implementationAddress, setImplementationAddress] = useState<string | undefined>(undefined);
    const [contractName, setContractName] = useState("");

    const chainId = useChainId();
    const {parsedAbi, readFunctions, writeFunctions, error, diagnostics} = useAbiParser(abiInput);

    // 1. Prevent Hydration Errors
    useEffect(() => {
        setMounted(true);
    }, []);

    // 2. Handle Etherscan Fetch
    const handleFetch = async ():Promise<void> => {
        if (!address){
            toast.error("Please enter an address");
            return
        }
        setIsFetching(true);
        setFetchStep('Fetching Source...');

        // UX: Fake progressive steps so users understand deep-probes are happening.
        const t1 = window.setTimeout(() => setFetchStep('Detecting Proxy...'), 700);
        const t2 = window.setTimeout(() => setFetchStep('Fetching Implementation ABI...'), 1500);

        try {
            const result = await fetchUniversalAbi(address, chainId);
            // clear timers and step
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            setFetchStep(null);

            if (result.success) {
                setAbiInput(result.abi);
                setContractName(result.contractName); // Store the real name
                setIsProxy(!!result.isProxy);
                setImplementationAddress(result.implementationAddress);

                toast.success(`Found: ${result.contractName}`);

                if (result.isProxy) {
                    toast.info("Proxy Detected", {
                        description: `Automatically loaded logic from ${result.implementationAddress?.slice(0, 6)}...`,
                        icon: <Zap className="text-purple-400" />
                    });
                }
            } else {
                setContractName("Manual Contract");
                setIsProxy(false);
                setImplementationAddress(undefined);
                toast.info("Unverified. Please name this contract manually.");
            }
        } catch (err) {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            setFetchStep(null);
            toast.error("Network error during fetch.");
        } finally {
            setIsFetching(false);
        }
    };

    // 3. Handle Interface Generation & DB Saving
    const handleGenerate = async () => {
        if (error) return;

        // Save to IndexedDB before switching views
        try {
            await addToHistory({
                type: 'contract_visit',
                address,
                name: contractName || `0x${address.slice(2, 8)}`, // Fallback to prefix
                abi: abiInput,
                chainId,
                isProxy,
                implementationAddress
            });
            setIsLoaded(true);
        } catch (err) {
            console.error("DB Save Error:", err);
            setIsLoaded(true); // Still load even if DB fails
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen flex-col bg-black text-zinc-100 antialiased">
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <DashboardHeader diagnostics={diagnostics} contractName={contractName} isProxy={isProxy} implementationAddress={implementationAddress} address={address} />

                    {!isLoaded ? (
                        <DashboardIntake
                            address={address}
                            setAddress={setAddress}
                            contractName={contractName}     // Pass state
                            setContractName={setContractName} // Pass setter
                            abiInput={abiInput}
                            setAbiInput={setAbiInput}
                            onFetch={handleFetch}
                            onGenerate={handleGenerate}
                            isFetching={isFetching}
                            fetchStep={fetchStep || undefined}
                            error={error}
                            diagnostics={diagnostics}
                        />
                    ) : (
                        <ErrorBoundary>
                            <DashboardExplorer
                                address={address}
                                readFunctions={readFunctions}
                                writeFunctions={writeFunctions}
                                abi={parsedAbi}
                                onReset={() => setIsLoaded(false)}
                            />
                        </ErrorBoundary>
                    )}
                </div>
            </main>

            <DashboardFooter/>
        </div>
    );
}