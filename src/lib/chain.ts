import { mainnet, polygon, sepolia, arbitrum, base, optimism, bsc } from 'wagmi/chains';

export const SUPPORTED_CHAINS = [mainnet, polygon, arbitrum, base, optimism, bsc, sepolia];

export const CHAIN_NAMES: Record<number, string> = {
    1: 'Ethereum',
    10: 'Optimism',
    56: 'BNB Chain',
    137: 'Polygon',
    8453: 'Base',
    42161: 'Arbitrum',
    11155111: 'Sepolia',
};

export const CHAIN_EXPLORER_TX: Record<number, string> = {
    1: 'https://etherscan.io/tx/',
    10: 'https://optimistic.etherscan.io/tx/',
    56: 'https://bscscan.com/tx/',
    137: 'https://polygonscan.com/tx/',
    8453: 'https://basescan.org/tx/',
    42161: 'https://arbiscan.io/tx/',
    11155111: 'https://sepolia.etherscan.io/tx/',
};

export const CHAIN_EXPLORER_ADDRESS: Record<number, string> = {
    1: 'https://etherscan.io/address/',
    10: 'https://optimistic.etherscan.io/address/',
    56: 'https://bscscan.com/address/',
    137: 'https://polygonscan.com/address/',
    8453: 'https://basescan.org/address/',
    42161: 'https://arbiscan.io/address/',
    11155111: 'https://sepolia.etherscan.io/address/',
};

export const CHAIN_ALCHEMY_SUBDOMAIN: Record<number, string> = {
    1: 'eth-mainnet',
    10: 'opt-mainnet',
    137: 'polygon-mainnet',
    8453: 'base-mainnet',
    42161: 'arb-mainnet',
    11155111: 'eth-sepolia',
};

export const CHAIN_FAUCETS: Record<number, { name: string; url: string }[]> = {
    11155111: [
        { name: 'Alchemy Faucet', url: 'https://www.alchemy.com/faucets/ethereum-sepolia' },
        { name: 'QuickNode Faucet', url: 'https://faucet.quicknode.com/ethereum/sepolia' },
        { name: 'Sepolia Faucet', url: 'https://sepoliafaucet.com' },
    ],
    137: [
        { name: 'Polygon Faucet', url: 'https://faucet.polygon.technology' },
    ],
};

export const CHAIN_NATIVE_SYMBOL: Record<number, string> = {
    1: 'ETH', 10: 'ETH', 56: 'BNB', 137: 'MATIC', 8453: 'ETH', 42161: 'ETH', 11155111: 'ETH',
};

export function getExplorerTxUrl(chainId: number, hash: string): string {
    return `${CHAIN_EXPLORER_TX[chainId] ?? 'https://etherscan.io/tx/'}${hash}`;
}

export function getExplorerAddressUrl(chainId: number, address: string): string {
    return `${CHAIN_EXPLORER_ADDRESS[chainId] ?? 'https://etherscan.io/address/'}${address}`;
}

export function getAlchemySubdomain(chainId: number): string {
    return CHAIN_ALCHEMY_SUBDOMAIN[chainId] ?? 'eth-mainnet';
}

export function getChainName(chainId: number): string {
    return CHAIN_NAMES[chainId] ?? `Chain ${chainId}`;
}
