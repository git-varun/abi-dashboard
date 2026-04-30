"use client";

import { Input } from "@/components/ui/input";
import { useId, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CardInputsProps {
    inputs: any[];
    onInputChange: (index: number, value: string) => void;
}

export const CardInputs = ({ inputs, onInputChange }: CardInputsProps) => {
    const baseId = useId();
    const [errors, setErrors] = useState<Record<number, string | null>>({});

    const validate = (type: string, value: string) => {
        if (!value) return null;

        // Handle Array types (e.g., address[], uint256[])
        if (type.endsWith('[]')) {
            if (!value.includes('[') || !value.includes(']')) {
                return 'Format as [val1, val2]';
            }
            return null; // Deep array validation can be added later
        }

        // Standard Integer Validation (uint256, int8, etc.)
        if (type.includes('int')) {
            if (!/^[-+]?[0-9]+$/.test(value)) return 'Must be a valid integer';
            try {
                BigInt(value); // Ensure it doesn't overflow JS number limits
            } catch {
                return 'Value too large for standard parsing';
            }
        }

        // Ethereum Address Validation
        if (type === 'address') {
            if (!/^0x[0-9a-fA-F]{40}$/.test(value)) return 'Invalid Ethereum address';
        }

        // Boolean Validation
        if (type === 'bool') {
            if (!/^(true|false)$/i.test(value)) return 'Must be true or false';
        }

        // Bytes Validation
        if (type.startsWith('bytes')) {
            if (!/^0x[0-9a-fA-F]*$/.test(value)) return 'Must be a valid hex (0x...)';
        }

        return null;
    };

    return (
        <div className="space-y-5 pt-4">
            {inputs.map((input: any, i: number) => {
                const id = `${baseId}-input-${i}`;
                const type = input?.type || 'string';
                const error = errors[i];
                const inputName = input?.name || `arg${i}`; // Handle the unnamed input edge case

                const handleChange = (val: string) => {
                    const err = validate(type, val);
                    setErrors((s) => ({ ...s, [i]: err }));
                    onInputChange(i, val);
                };

                return (
                    <div key={i} className="group relative space-y-1.5">
                        <div className="flex justify-between items-center px-0.5">
                            <label
                                htmlFor={id}
                                className="text-[10px] font-black text-[#737687] uppercase tracking-tighter group-focus-within:text-[#0046dd] transition-colors"
                            >
                                {inputName} <span className="text-[#c3c5d9] ml-1">({type})</span>
                            </label>

                            {/* Status Indicator */}
                            {!error && (
                                <CheckCircle2 className={`h-3 w-3 ${error === null ? 'text-emerald-500/50' : 'text-zinc-800'}`} />
                            )}
                        </div>

                        <div className="relative">
                            {type === 'bool' ? (
                                <select
                                    id={id}
                                    onChange={(e) => handleChange(e.target.value)}
                                    className={`w-full appearance-none border-2 ${error ? 'border-[#ba1a1a]' : 'border-black'} bg-white p-2.5 text-xs font-mono text-black outline-none focus:border-[#0046dd]`}
                                >
                                    <option value="">Select Boolean...</option>
                                    <option value="true">true</option>
                                    <option value="false">false</option>
                                </select>
                            ) : (
                                <div className="relative">
                                    <Input
                                        id={id}
                                        className={`border-2 ${error ? 'border-[#ba1a1a]' : 'border-black'} bg-white px-3 py-5 text-xs font-mono text-[#0046dd] transition-all placeholder:text-[#c3c5d9] focus:border-[#0046dd] focus:ring-0`}
                                        placeholder={type.endsWith('[]') ? '[val1, val2]' : `Enter ${type}...`}
                                        onChange={(e) => handleChange(e.target.value)}
                                    />
                                    {error && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {error && (
                            <p id={`${id}-err`} role="alert" className="flex items-center gap-1.5 px-1 text-[10px] font-bold text-[#ba1a1a]">
                                <span>{error}</span>
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};