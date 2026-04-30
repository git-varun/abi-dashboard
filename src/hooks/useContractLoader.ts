"use client";

import { useWorkspace, useWorkspaceComputed } from '@/store/workspace';
import { useChainId } from 'wagmi';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';
import { fetchUniversalAbi } from '@/app/actions/abi';
import { addToHistory } from '@/lib/db';
import React from 'react';

export function useContractLoader() {
    const { state, dispatch } = useWorkspace();
    const { error } = useWorkspaceComputed();
    const chainId = useChainId();

    const handleFetch = async (): Promise<void> => {
        if (!state.address) { toast.error('Enter a contract address'); return; }
        dispatch({ type: 'SET_FETCHING', isFetching: true, fetchStep: 'Fetching source...' });

        const t1 = window.setTimeout(() => dispatch({ type: 'SET_FETCHING', isFetching: true, fetchStep: 'Detecting proxy...' }), 700);
        const t2 = window.setTimeout(() => dispatch({ type: 'SET_FETCHING', isFetching: true, fetchStep: 'Loading implementation ABI...' }), 1500);

        try {
            const result = await fetchUniversalAbi(state.address, chainId);
            window.clearTimeout(t1);
            window.clearTimeout(t2);

            if (result.success) {
                dispatch({
                    type: 'SET_CONTRACT',
                    address: state.address,
                    abiInput: result.abi,
                    contractName: result.contractName,
                    isProxy: !!result.isProxy,
                    implementationAddress: result.implementationAddress,
                });
                toast.success(`Found: ${result.contractName}`);
                if (result.isProxy) {
                    toast.info('Proxy detected', {
                        description: `Logic loaded from ${result.implementationAddress?.slice(0, 10)}...`,
                        icon: React.createElement(Zap, { className: 'text-purple-400' }),
                    });
                }
            } else {
                dispatch({ type: 'SET_CONTRACT_NAME', name: 'Unverified Contract' });
                toast.info('Contract not verified — paste ABI manually below');
            }
        } catch {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            toast.error('Network error during fetch');
        } finally {
            dispatch({ type: 'SET_FETCHING', isFetching: false, fetchStep: null });
        }
    };

    const handleGenerate = async (): Promise<void> => {
        if (error) return;
        try {
            await addToHistory({
                type: 'contract_visit',
                address: state.address,
                name: state.contractName || `0x${state.address.slice(2, 8)}`,
                abi: state.abiInput,
                chainId,
                isProxy: state.isProxy,
                implementationAddress: state.implementationAddress,
            });
        } catch { /* fail silently */ }
        dispatch({ type: 'SET_LOADED', isLoaded: true });
    };

    return { handleFetch, handleGenerate };
}
