# Constraints

## Hard Constraints

- **No SSR for Dashboard** — IndexedDB is browser-only. Dashboard is loaded via `dynamic(..., { ssr: false })`. Never move IndexedDB calls to server components.
- **`ALCHEMY_API_KEY` is server-only** — used in `src/app/actions/abi.ts` (server action). Never import it in client components.
- **`WorkspaceComputedProvider` must be inside `WorkspaceProvider`** — calls `useWorkspace()`. Violating this throws at runtime.
- **`WorkspaceProvider` and `PipelineProvider` must be inside `WagmiProvider`** — tools use wagmi hooks; providers are inside the wagmi tree.
- **Tool components must NOT be SSR'd** — all tool imports in `ToolsScreen.tsx` are client-side; do not move them to server components. Previously enforced via RightRail dynamic imports; now enforced by the `"use client"` directive on `ToolsScreen`.

## Soft Constraints

- **Don't call CoinGecko more than once per 60s** — the cache in `prices.ts` enforces this. Don't bypass it.
- **Don't call 4byte.directory from the server** — it's a public API with no key; call it client-side only.
- **Chain configs live in `chain.ts` only** — no inline `Record<number, string>` maps for explorer URLs, chain names, or RPC subdomains anywhere else.
- **History events must dispatch `history-updated`** — all db.ts write functions do this. Don't skip it or the UI won't refresh.
- **Function cards must have `id="fn-{name}"`** — LeftOutline and CommandPalette scroll to functions using this. The DashboardExplorer wraps each card with this id.

## Environment Variables

| Variable | Side | Required | Purpose |
|----------|------|----------|---------|
| `ETHERSCAN_API_KEY` | server | yes (rate limit) | Etherscan V2 ABI fetch |
| `ALCHEMY_API_KEY` | server | recommended | Proxy slot probing |
| `NEXT_PUBLIC_ALCHEMY_KEY` | client | recommended | Wagmi RPC transports |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | client | yes (prod) | RainbowKit WalletConnect |

## Known Limitations

- CalldataDecoder requires a contract ABI to be loaded first — it uses `parsedAbi` from the workspace store
- StorageSlot tool only handles `address` and `uint` mapping keys; struct keys are not supported
- Gas estimation in StatusBar is always Ethereum mainnet (hardcoded in `useLiveChain.ts`)
