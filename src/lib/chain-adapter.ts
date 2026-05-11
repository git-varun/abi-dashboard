/**
 * ChainAdapter: Abstraction layer for chain-agnostic operations
 * Supports both EVM and Solana chains
 */

export type ChainType = 'evm' | 'solana';

export interface ChainConfig {
  // Universal
  id: string; // e.g., '1', '137', 'solana-mainnet'
  name: string; // e.g., 'Ethereum', 'Solana'
  chainType: ChainType;
  nativeSymbol: string; // 'ETH', 'MATIC', 'SOL'
  isTestnet: boolean;

  // EVM-specific
  chainId?: number; // e.g., 1, 137
  rpcUrl?: string;
  explorerUrl?: string;
  alchemySubdomain?: string;

  // Solana-specific
  solanaCluster?: 'mainnet-beta' | 'devnet' | 'testnet'; // default: 'mainnet-beta'
}

export class ChainAdapter {
  /**
   * Registry of all supported chains
   */
  private static readonly CHAINS: Record<string, ChainConfig> = {
    // EVM Chains
    'ethereum': {
      id: '1',
      name: 'Ethereum',
      chainType: 'evm',
      chainId: 1,
      nativeSymbol: 'ETH',
      isTestnet: false,
      explorerUrl: 'https://etherscan.io',
      alchemySubdomain: 'eth-mainnet',
      rpcUrl: 'https://eth.rpc.blxrbdn.com',
    },
    'polygon': {
      id: '137',
      name: 'Polygon',
      chainType: 'evm',
      chainId: 137,
      nativeSymbol: 'MATIC',
      isTestnet: false,
      explorerUrl: 'https://polygonscan.com',
      alchemySubdomain: 'polygon-mainnet',
      rpcUrl: 'https://polygon.rpc.blxrbdn.com',
    },
    'arbitrum': {
      id: '42161',
      name: 'Arbitrum',
      chainType: 'evm',
      chainId: 42161,
      nativeSymbol: 'ETH',
      isTestnet: false,
      explorerUrl: 'https://arbiscan.io',
      alchemySubdomain: 'arb-mainnet',
      rpcUrl: 'https://arbitrum.rpc.blxrbdn.com',
    },
    'base': {
      id: '8453',
      name: 'Base',
      chainType: 'evm',
      chainId: 8453,
      nativeSymbol: 'ETH',
      isTestnet: false,
      explorerUrl: 'https://basescan.org',
      alchemySubdomain: 'base-mainnet',
      rpcUrl: 'https://base.rpc.blxrbdn.com',
    },
    'optimism': {
      id: '10',
      name: 'Optimism',
      chainType: 'evm',
      chainId: 10,
      nativeSymbol: 'ETH',
      isTestnet: false,
      explorerUrl: 'https://optimistic.etherscan.io',
      alchemySubdomain: 'opt-mainnet',
      rpcUrl: 'https://optimism.rpc.blxrbdn.com',
    },
    'bsc': {
      id: '56',
      name: 'BNB Chain',
      chainType: 'evm',
      chainId: 56,
      nativeSymbol: 'BNB',
      isTestnet: false,
      explorerUrl: 'https://bscscan.com',
      rpcUrl: 'https://bsc.rpc.blxrbdn.com',
    },
    'sepolia': {
      id: '11155111',
      name: 'Sepolia',
      chainType: 'evm',
      chainId: 11155111,
      nativeSymbol: 'ETH',
      isTestnet: true,
      explorerUrl: 'https://sepolia.etherscan.io',
      alchemySubdomain: 'eth-sepolia',
      rpcUrl: 'https://eth-sepolia.rpc.blxrbdn.com',
    },

    // Solana Chains
    'solana-mainnet': {
      id: 'solana-mainnet',
      name: 'Solana',
      chainType: 'solana',
      solanaCluster: 'mainnet-beta',
      nativeSymbol: 'SOL',
      isTestnet: false,
      explorerUrl: 'https://solscan.io',
      rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
    },
    'solana-devnet': {
      id: 'solana-devnet',
      name: 'Solana Devnet',
      chainType: 'solana',
      solanaCluster: 'devnet',
      nativeSymbol: 'SOL',
      isTestnet: true,
      explorerUrl: 'https://explorer.solana.com',
      rpcUrl: 'https://api.devnet.solana.com',
    },
  };

  /**
   * Get chain configuration by ID
   */
  static getChain(chainId: string | number): ChainConfig | null {
    const key = typeof chainId === 'number' ? chainId.toString() : chainId;
    return Object.values(ChainAdapter.CHAINS).find(c => c.id === key) || null;
  }

  /**
   * Get all supported chains
   */
  static getAllChains(): ChainConfig[] {
    return Object.values(ChainAdapter.CHAINS);
  }

  /**
   * Get EVM chains only
   */
  static getEvmChains(): ChainConfig[] {
    return Object.values(ChainAdapter.CHAINS).filter(c => c.chainType === 'evm');
  }

  /**
   * Get Solana chains only
   */
  static getSolanaChains(): ChainConfig[] {
    return Object.values(ChainAdapter.CHAINS).filter(c => c.chainType === 'solana');
  }

  /**
   * Check if chain is EVM-compatible
   */
  static isEvm(chainId: string | number): boolean {
    const chain = ChainAdapter.getChain(chainId);
    return chain?.chainType === 'evm';
  }

  /**
   * Check if chain is Solana
   */
  static isSolana(chainId: string | number): boolean {
    const chain = ChainAdapter.getChain(chainId);
    return chain?.chainType === 'solana';
  }

  /**
   * Get explorer URL for address
   */
  static getExplorerAddressUrl(
    chainId: string | number,
    address: string,
  ): string {
    const chain = ChainAdapter.getChain(chainId);
    if (!chain) return '';

    if (chain.chainType === 'evm') {
      return `${chain.explorerUrl}/address/${address}`;
    } else if (chain.chainType === 'solana') {
      return `${chain.explorerUrl}/address/${address}`;
    }
    return '';
  }

  /**
   * Get explorer URL for transaction
   */
  static getExplorerTxUrl(chainId: string | number, txHash: string): string {
    const chain = ChainAdapter.getChain(chainId);
    if (!chain) return '';

    if (chain.chainType === 'evm') {
      return `${chain.explorerUrl}/tx/${txHash}`;
    } else if (chain.chainType === 'solana') {
      return `${chain.explorerUrl}/tx/${txHash}`;
    }
    return '';
  }

  /**
   * Get RPC URL for chain
   */
  static getRpcUrl(chainId: string | number): string {
    const chain = ChainAdapter.getChain(chainId);
    return chain?.rpcUrl || '';
  }

  /**
   * Get native symbol for chain
   */
  static getNativeSymbol(chainId: string | number): string {
    const chain = ChainAdapter.getChain(chainId);
    return chain?.nativeSymbol || '';
  }

  /**
   * Check if chain is testnet
   */
  static isTestnet(chainId: string | number): boolean {
    const chain = ChainAdapter.getChain(chainId);
    return chain?.isTestnet ?? false;
  }

  /**
   * Get display name for chain
   */
  static getDisplayName(chainId: string | number): string {
    const chain = ChainAdapter.getChain(chainId);
    return chain?.name || `Unknown Chain`;
  }
}

// Export singleton instance for convenience
export const chainAdapter = ChainAdapter;
