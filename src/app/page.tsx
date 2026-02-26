"use client";

import dynamic from 'next/dynamic';
import {HistorySidebar} from "@/components/abi/HistorySidebar";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {PanelRightClose, PanelRightOpen} from "lucide-react";

// Disable SSR to prevent "indexedDB is not defined" error
const Dashboard = dynamic(() => import("@/components/abi/dashboard"), {
    ssr: false,
    loading: () => (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <div className="animate-pulse font-mono text-zinc-500">Initializing...</div>
        </div>
    )
});


export default function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <main className="min-h-screen">
            <div className="flex h-screen w-full overflow-hidden bg-black">
                <div className="relative flex-1 overflow-y-auto">
                    {/* Toggle Button - Floating on the right edge */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="absolute right-4 top-4 z-50 h-8 w-8 border border-zinc-800 bg-zinc-900/50 backdrop-blur-md text-zinc-400 hover:text-white"
                    >
                        {isSidebarOpen ? <PanelRightClose size={18}/> : <PanelRightOpen size={18}/>}
                    </Button>

                    <Dashboard/>
                </div>
                <aside
                    className={`transition-all duration-300 ease-in-out border-l border-zinc-800 bg-zinc-950 
          ${isSidebarOpen ? "w-80" : "w-0 opacity-0 invisible"}`}
                >
                    <div className="w-80 h-full"> {/* Maintain width inside the clip */}
                        <HistorySidebar/>
                    </div>
                </aside>
            </div>
      </main>
  );
}