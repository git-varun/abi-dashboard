import {CheckCircle, Loader2} from "lucide-react";

interface CardHeaderContentProps {
    name: string;
    isWrite: boolean;
    isSuccess: boolean;
    isConfirming: boolean;
    isLoading?: boolean;
}

export const CardHeaderContent = ({name, isWrite, isSuccess, isConfirming, isLoading}: CardHeaderContentProps) => (
    <div className="flex items-center justify-between font-mono text-sm uppercase tracking-tight">
        <span className={isWrite ? "text-[#9d009d]" : "text-[#0046dd]"}>
            {isLoading ? <span className="inline-block h-4 w-24 bg-[#e2e2e2] animate-pulse" /> : name}
        </span>
        <div className="flex items-center gap-2">
            {isConfirming && <Loader2 className="h-3 w-3 animate-spin text-zinc-500"/>}
            {isSuccess && <CheckCircle className="h-4 w-4 text-emerald-500"/>}
        </div>
    </div>
);