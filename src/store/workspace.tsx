"use client";

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { useAbiParser } from '@/hooks/useAbiParser';
import type { AbiParseResult } from '@/hooks/useAbiParser';

export type WorkspaceState = {
    address: string;
    abiInput: string;
    contractName: string;
    isProxy: boolean;
    implementationAddress?: string;
    isLoaded: boolean;
    isFetching: boolean;
    fetchStep: string | null;
};

export type WorkspaceAction =
    | { type: 'SET_ADDRESS'; address: string }
    | { type: 'SET_ABI_INPUT'; abiInput: string }
    | { type: 'SET_CONTRACT_NAME'; name: string }
    | { type: 'SET_FETCHING'; isFetching: boolean; fetchStep?: string | null }
    | { type: 'SET_CONTRACT'; address: string; abiInput: string; contractName: string; isProxy: boolean; implementationAddress?: string }
    | { type: 'SET_LOADED'; isLoaded: boolean }
    | { type: 'RESET' };

const initial: WorkspaceState = {
    address: '', abiInput: '', contractName: '',
    isProxy: false, implementationAddress: undefined,
    isLoaded: false, isFetching: false, fetchStep: null,
};

function reducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
    switch (action.type) {
        case 'SET_ADDRESS': return { ...state, address: action.address };
        case 'SET_ABI_INPUT': return { ...state, abiInput: action.abiInput };
        case 'SET_CONTRACT_NAME': return { ...state, contractName: action.name };
        case 'SET_FETCHING': return { ...state, isFetching: action.isFetching, fetchStep: action.fetchStep ?? state.fetchStep };
        case 'SET_CONTRACT': return {
            ...state,
            address: action.address, abiInput: action.abiInput, contractName: action.contractName,
            isProxy: action.isProxy, implementationAddress: action.implementationAddress,
        };
        case 'SET_LOADED': return { ...state, isLoaded: action.isLoaded };
        case 'RESET': return initial;
        default: return state;
    }
}

const WorkspaceCtx = createContext<{ state: WorkspaceState; dispatch: React.Dispatch<WorkspaceAction> } | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initial);
    return <WorkspaceCtx.Provider value={{ state, dispatch }}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
    const ctx = useContext(WorkspaceCtx);
    if (!ctx) throw new Error('useWorkspace must be inside WorkspaceProvider');
    return ctx;
}

const ComputedCtx = createContext<AbiParseResult | null>(null);

export function WorkspaceComputedProvider({ children }: { children: ReactNode }) {
    const { state } = useWorkspace();
    const computed = useAbiParser(state.abiInput);
    return <ComputedCtx.Provider value={computed}>{children}</ComputedCtx.Provider>;
}

export function useWorkspaceComputed(): AbiParseResult {
    const ctx = useContext(ComputedCtx);
    if (!ctx) throw new Error('useWorkspaceComputed must be inside WorkspaceComputedProvider');
    return ctx;
}
