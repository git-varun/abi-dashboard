import {CheckCircle, Loader2} from "lucide-react";

export const CardHeaderContent = ({name, isWrite, isSuccess, isConfirming, isLoading}: any) => (
    <div className="flex items-center justify-between font-mono text-sm uppercase tracking-tight">
        <span className={isWrite ? "text-orange-500" : "text-blue-500"}>
            {isLoading ? <span className="inline-block h-4 w-24 rounded bg-zinc-800 animate-pulse" /> : name}
        </span>
        <div className="flex items-center gap-2">
            {isConfirming && <Loader2 className="h-3 w-3 animate-spin text-zinc-500"/>}
            {isSuccess && <CheckCircle className="h-4 w-4 text-emerald-500"/>}
        </div>
    </div>
);