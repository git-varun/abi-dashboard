import { createPublicClient, http, Address, formatUnits } from 'viem';
import { SUPPORTED_CHAINS, getExplorerTxUrl } from './chain';

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
        const err = error as any;
        if (err?.walk) {
            const root = err.walk((e: any) => e.data?.name || e.shortMessage);
            if (root?.data?.name) errorMessage = root.data.name;
            else if (err.shortMessage) errorMessage = err.shortMessage.split('\n')[0];
        }
        return { success: false, reason: errorMessage || String(err?.message ?? error), tenderlyUrl };
    }
}
