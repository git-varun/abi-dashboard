# APIs & External Services

## Etherscan V2

- **Endpoint**: `https://api.etherscan.io/v2/api`
- **Key env var**: `ETHERSCAN_API_KEY`
- **Used in**: `src/app/actions/abi.ts` (server action)
- **Actions**: `contract/getsourcecode`, `contract/getabi`
- **Multi-chain**: pass `chainid` param — works for all supported chains

## Alchemy

- **Purpose**: Storage slot probing for proxy detection
- **Server key**: `ALCHEMY_API_KEY` (server-side only, never exposed)
- **Client key**: `NEXT_PUBLIC_ALCHEMY_KEY` (for wagmi RPC transports)
- **Subdomain map**: `src/lib/chain.ts → CHAIN_ALCHEMY_SUBDOMAIN`

## CoinGecko (free tier)

- **Endpoint**: `https://api.coingecko.com/api/v3/simple/price`
- **Used in**: `src/lib/prices.ts`
- **Cache**: 60s in-memory, shared across all callers
- **Rate limit**: free tier ~30 req/min — cache prevents hitting it

## 4byte.directory

- **Endpoint**: `https://www.4byte.directory/api/v1/signatures/?hex_signature={selector}`
- **Used in**: `src/components/tools/FourByteSelector.tsx`
- **Client-side fetch** (no API key required)

## Tenderly (link only)

- Not called directly — link generated in `src/lib/simulate.ts`
- Format: `https://dashboard.tenderly.co/tx/{chain}/0x0/simulate-from-abi?address={addr}&network={chainId}`

## WalletConnect

- **Key env var**: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **Used in**: `src/lib/wagmi.ts` via RainbowKit `getDefaultConfig`

## Supported Chains

See `src/lib/chain.ts → SUPPORTED_CHAINS`:
`mainnet (1), polygon (137), arbitrum (42161), base (8453), optimism (10), bsc (56), sepolia (11155111)`
