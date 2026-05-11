import { createPublicClient, http, Address, formatUnits } from 'viem';
import { SUPPORTED_CHAINS } from './chain';

function getChain(chainId: number) {
    return SUPPORTED_CHAINS.find(c => c.id === chainId) ?? SUPPORTED_CHAINS[0];
}

export async function simulateTransaction(
    targetAddress: Address,
    abi: unknown[],
    functionName: string,
    args: unknown[],
    userAddress: Address,
    chainId: number
) {
    const chain = getChain(chainId);
    const client = createPublicClient({ chain, transport: http() });
    const tenderlyUrl = `https://dashboard.tenderly.co/tx/${chain.name.toLowerCase()}/0x0/simulate-from-abi?address=${targetAddress}&network=${chainId}`;

    if (!/^0x[0-9a-fA-F]{40}$/.test(String(targetAddress))) {
        return { success: false, reason: 'Invalid target address', tenderlyUrl };
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(String(userAddress))) {
        return { success: false, reason: 'Invalid user address', tenderlyUrl };
    }

    try {
        await client.simulateContract({ address: targetAddress, abi, functionName, args, account: userAddress });

        const gasUnits = await client.estimateContractGas({ address: targetAddress, abi, functionName, args, account: userAddress });
        const gasPrice = await client.getGasPrice();

        const totalWei = BigInt(gasUnits) * BigInt(gasPrice);
        const decimals = (chain.nativeCurrency?.decimals as number) ?? 18;

        return {
            success: true,
            tenderlyUrl,
            gasDetails: {
                totalNative: formatUnits(totalWei, decimals),
                symbol: chain.nativeCurrency.symbol,
            },
        };
    } catch (error: unknown) {
        let errorMessage = 'Execution Reverted';
        if (error && typeof error === 'object' && 'walk' in error && typeof error.walk === 'function') {
            const err = error as { walk: (cb: (e: unknown) => unknown) => unknown, shortMessage?: string };
            const root = err.walk((e: unknown) => {
                const errObj = e as Record<string, unknown>;
                const data = errObj?.data as Record<string, unknown> | undefined;
                return data?.name || errObj?.shortMessage;
            }) as (Record<string, unknown> & { data?: { name?: string } }) | null;
            
            if (root?.data?.name) errorMessage = root.data.name;
            else if (err.shortMessage) errorMessage = err.shortMessage.split('\n')[0];
        }
        const finalMessage = error instanceof Error ? error.message : String(error);
        return { success: false, reason: errorMessage || finalMessage, tenderlyUrl };
    }
}
