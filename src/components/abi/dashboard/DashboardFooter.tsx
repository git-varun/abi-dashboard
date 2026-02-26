"use client";

import {useAccount, useChainId} from "wagmi";
import {Cpu, Github, Zap} from "lucide-react";

export const DashboardFooter = () => {
    const {isConnected, connector} = useAccount();
    const chainId = useChainId();

    // Mapping chain IDs to human-readable names
    const getNetworkName = (id: number) => {
        const networks: Record<number, string> = {
            1: "Ethereum Mainnet",
            11155111: "Sepolia Testnet",
            137: "Polygon",
            8453: "Base",
        };
        return networks[id] || "Unknown Network";
    };

    return (
        <footer className="mt-auto border-t border-zinc-800 bg-black/50 py-6 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

                    {/* Left Side: System Status */}
                    <div
                        className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <div className="flex items-center gap-2">
                            <div
                                className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-700"}`}/>
                            <span>{isConnected ? `Connected: ${connector?.name}` : "Wallet Disconnected"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Cpu className="h-3 w-3"/>
                            <span>{getNetworkName(chainId)} (ID: {chainId})</span>
                        </div>
                    </div>

                    {/* Center Side: Credits/Branding */}
                    <div className="text-[10px] text-zinc-600 font-medium">
                        &copy; {new Date().getFullYear()} ABIPRO. Built for Web3 Engineers.
                    </div>

                    {/* Right Side: Quick Links */}
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            className="text-zinc-500 hover:text-white transition-colors"
                            title="Documentation"
                        >
                            <Github className="h-4 w-4"/>
                        </a>
                        <a
                            href="#"
                            className="text-zinc-500 hover:text-blue-500 transition-colors flex items-center gap-1 text-[10px] font-bold"
                        >
                            <Zap className="h-3 w-3"/>
                            GAS: 24 GWEI
                        </a>
                    </div>

                </div>
            </div>
        </footer>
    );
};