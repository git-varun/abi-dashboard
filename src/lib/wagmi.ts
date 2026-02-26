// src/lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, sepolia, arbitrum } from 'wagmi/chains';
import { http } from 'wagmi';

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!ALCHEMY_KEY) {
  // Do not throw here; allow local development without an Alchemy key.
  // Consumers should set NEXT_PUBLIC_ALCHEMY_KEY for production to avoid rate limits.
  // Keeping a warning so developers notice the missing key.
   
  console.warn('NEXT_PUBLIC_ALCHEMY_KEY not set — falling back to public RPCs.');
}

const transports: any = {};
if (ALCHEMY_KEY) {
  transports[mainnet.id] = http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`);
  transports[polygon.id] = http(`https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`);
  transports[arbitrum.id] = http(`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`);
  transports[sepolia.id] = http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`);
}

export const config = getDefaultConfig({
  appName: 'ABI Explorer Pro',
  projectId: WALLET_CONNECT_PROJECT_ID || '',
  chains: [mainnet, polygon, arbitrum, sepolia],
  ssr: true,
  transports: Object.keys(transports).length ? transports : undefined,
});