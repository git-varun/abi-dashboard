"use client";

import {Button} from "@/components/ui/button";
import {Loader2, Search, Zap} from "lucide-react";

interface CardActionsProps {
    isWrite: boolean;
    isLoading: boolean;
    onAction: () => void;
    disabled?: boolean;
}

export const CardActions = ({isWrite, isLoading, onAction, disabled}: CardActionsProps) => {
    return (
        <Button
            onClick={onAction}
            disabled={isLoading || disabled}
            className={`h-11 w-full font-black uppercase tracking-tighter transition-all border-2 border-black neo-shadow active:shadow-none active:translate-y-0.5 ${
                isWrite
                    ? "bg-[#c3f400] text-black hover:bg-[#abd600]"
                    : "bg-black text-white hover:bg-[#0046dd]"
            }`}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin"/>
            ) : (
                <div className="flex items-center gap-2">
                    {isWrite ? <Zap className="h-3 w-3 fill-current"/> : <Search className="h-3 w-3"/>}
                    <span>{isWrite ? "Execute Transaction" : "Read State"}</span>
                </div>
            )}
        </Button>
    );
};