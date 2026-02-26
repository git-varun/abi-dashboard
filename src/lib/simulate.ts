import { createPublicClient, http, Address, formatUnits } from 'viem';
import { mainnet, polygon, bsc, arbitrum, sepolia, base, optimism } from 'viem/chains';

const getChain = (chainId: number) => {
    const chains: Record<number, any> = {
        1: mainnet, 10: optimism, 56: bsc, 137: polygon, 8453: base, 42161: arbitrum, 11155111: sepolia,
    };
    return chains[chainId] || mainnet;
};

export async function simulateTransaction(
    targetAddress: Address,
    abi: any,
    functionName: string,
    args: any[],
    userAddress: Address,
    chainId: number
) {
    const chain = getChain(chainId);
    const client = createPublicClient({ chain, transport: http() });
    const tenderlyUrl = `https://dashboard.tenderly.co/tx/${chain.name.toLowerCase()}/0x0/simulate-from-abi?address=${targetAddress}&network=${chainId}`;

    try {
        // Basic address validation
        if (typeof targetAddress !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(String(targetAddress))) {
            return { success: false, reason: 'Invalid target address', tenderlyUrl };
        }

        if (typeof userAddress !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(String(userAddress))) {
            return { success: false, reason: 'Invalid user address', tenderlyUrl };
        }

        const { request } = await client.simulateContract({
            address: targetAddress,
            abi,
            functionName,
            args,
            account: userAddress,
        });

        const gasUnits = await client.estimateContractGas({
            address: targetAddress,
            abi,
            functionName,
            args,
            account: userAddress,
        });

        const gasPrice = await client.getGasPrice();

        // gasUnits and gasPrice are typically bigint; compute safely
        let totalWei: bigint;
        try {
            const u = typeof gasUnits === 'bigint' ? gasUnits : BigInt(gasUnits);
            const p = typeof gasPrice === 'bigint' ? gasPrice : BigInt(gasPrice);
            totalWei = u * p;
        } catch (e) {
            totalWei = BigInt(0);
        }

        const decimals = (chain.nativeCurrency && (chain.nativeCurrency.decimals as number)) || 18;

        return {
            success: true,
            tenderlyUrl,
            gasDetails: {
                totalNative: formatUnits(totalWei, decimals),
                symbol: chain.nativeCurrency.symbol
            }
        };
    } catch (error: any) {
        // PROFESSIONALLY HANDLE REVERT
        let errorMessage = "Execution Reverted";

        // Walk the error tree to find the custom error name (e.g., OwnableUnauthorizedAccount)
        if (error.walk) {
            const rootCause: any = error.walk((e: any) => e.data?.name || e.shortMessage);

            if (rootCause?.data?.name) {
                errorMessage = rootCause.data.name;
            } else if (error.shortMessage) {
                // Clean up viem's verbose message to just the first relevant line
                errorMessage = error.shortMessage.split('\n')[0];
            }
        }

        // We return a success: false object INSTEAD of throwing a console error
        return {
            success: false,
            reason: errorMessage || String(error?.message || error),
            tenderlyUrl
        };
    }
}