import { useMemo } from "react";

export interface AbiEntry {
  type: string;
  name?: string;
  inputs?: any[];
  outputs?: any[];
  stateMutability?: string;
  constant?: boolean;
  payable?: boolean;
  anonymous?: boolean;
}

export interface AbiParseResult {
  parsedAbi: AbiEntry[] | null;
  readFunctions: AbiEntry[];
  writeFunctions: AbiEntry[];
  error: string | null;
  diagnostics?: string[];
}

/**
 * Normalizes legacy and edge-case ABIs into a modern, standard format.
 */
export const normalizeAbiEntry = (item: any, index: number): AbiEntry | null => {
  // Edge Case: Completely null or non-object entries in the array
  if (!item || typeof item !== "object") return null;

  // Edge Case: Handling non-function types (Events, Errors, Fallbacks)
  // We keep them in parsedAbi but exclude them from our UI function lists later
  const entry: AbiEntry = { ...item };

  if (entry.type === "function") {
    // 1. Name Validation: Critical for UI mapping
    if (!entry.name) {
      entry.name = `unnamedFunction_${index}`;
    }

    // 2. Input Normalization: Handle unnamed inputs (common in old ERC20s)
    entry.inputs = (entry.inputs || []).map((input: any, i: number) => ({
      ...input,
      name: input.name || `arg${i}`,
      type: input.type || "uint256", // Defaulting to avoid crash, though usually indicates bad ABI
    }));

    // 3. State Mutability: Standardizing Legacy (constant/payable) to modern
    if (!entry.stateMutability) {
      if (entry.constant) entry.stateMutability = "view";
      else if (entry.payable) entry.stateMutability = "payable";
      else entry.stateMutability = "nonpayable";
    }
  }

  return entry;
};

export function useAbiParser(rawAbi: string): AbiParseResult {
  return useMemo(() => {
    const diagnostics: string[] = [];

    // 1. Pre-flight check
    const trimmed = rawAbi?.trim();
    if (!trimmed) {
      return { parsedAbi: null, readFunctions: [], writeFunctions: [], error: null };
    }

    let parsed: any[];

    // 2. JSON Parsing with try/catch
    try {
      const data = JSON.parse(trimmed);
      // Handle the "Etherscan result wrapper" edge case:
      // sometimes users paste the whole {status, message, result} object
      parsed = Array.isArray(data) ? data : (data.result && Array.isArray(JSON.parse(data.result)) ? JSON.parse(data.result) : data);

      if (!Array.isArray(parsed)) {
        throw new Error("ABI must be a JSON array");
      }
    } catch (err: any) {
      return {
        parsedAbi: null,
        readFunctions: [],
        writeFunctions: [],
        error: err.message.includes("Unexpected token") ? "Invalid JSON: Check for trailing commas or hidden characters" : err.message
      };
    }

    // 3. Normalization and Categorization
    const normalizedAbi: AbiEntry[] = [];
    const readFunctions: AbiEntry[] = [];
    const writeFunctions: AbiEntry[] = [];

    parsed.forEach((item, idx) => {
      const entry = normalizeAbiEntry(item, idx);
      if (!entry) {
        diagnostics.push(`Index ${idx}: Entry is null or invalid object.`);
        return;
      }

      normalizedAbi.push(entry);

      if (entry.type === "function") {
        const sm = entry.stateMutability;
        if (sm === "view" || sm === "pure") {
          readFunctions.push(entry);
        } else {
          writeFunctions.push(entry);
        }
      }
    });

    // 4. Final Validation: Did we find anything useful?
    if (normalizedAbi.length > 0 && readFunctions.length === 0 && writeFunctions.length === 0) {
      diagnostics.push("ABI parsed successfully but contains no functions (only events/errors).");
    }

    return {
      parsedAbi: normalizedAbi,
      readFunctions,
      writeFunctions,
      error: null,
      diagnostics: diagnostics.length ? diagnostics : undefined,
    };
  }, [rawAbi]);
}