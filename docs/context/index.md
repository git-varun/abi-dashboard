# ABI Workbench — Project Index

> Single source of truth for this codebase. Read this file before any other.
> Per `.claude/system-prompt.txt`: load only required context files below.

---

## Context Files

| File | Load when... |
|------|-------------|
| [overview.md](./overview.md) | Starting a new feature or orienting on the product |
| [architecture.md](./architecture.md) | Touching layout, routing, or state management |
| [tech-stack.md](./tech-stack.md) | Adding/upgrading dependencies |
| [apis.md](./apis.md) | Working on chain fetching, Etherscan, Alchemy, prices, simulation |
| [tools.md](./tools.md) | Adding or modifying a utility tool in the right rail |
| [constraints.md](./constraints.md) | Before any architectural decision |

---

## Quick Map

```
src/
  app/
    page.tsx              ← Redirects to /dashboard
    layout.tsx            ← Root layout: Space Grotesk font, ClientProviders, Toaster
    ClientProviders.tsx   ← Wagmi > RainbowKit > Workspace > Pipeline > Computed
    actions/abi.ts        ← Server action: fetch ABI from Etherscan V2
    providers.tsx         ← Re-exports ClientProviders (legacy shim)
    dashboard/page.tsx    ← Mounts DashboardScreen (ssr: false)
    workspace/page.tsx    ← Mounts WorkspaceScreen (ssr: false) — unified intake + explorer
    contracts/page.tsx    ← redirect → /workspace
    explorer/page.tsx     ← redirect → /workspace
    debugger/page.tsx     ← Mounts DebuggerScreen (ssr: false)
    events/page.tsx       ← Mounts EventsScreen (ssr: false) — live event watcher
    compare/page.tsx      ← Mounts CompareScreen (ssr: false) — ABI diff tool
    monitoring/page.tsx   ← Mounts MonitoringScreen (ssr: false)
    history/page.tsx      ← Mounts HistoryScreen (ssr: false)
    tools/page.tsx        ← Mounts ToolsScreen (ssr: false)
    settings/page.tsx     ← Mounts SettingsScreen (ssr: false)
    tiers/page.tsx        ← redirect → /about
    about/page.tsx        ← Mounts AboutScreen (ssr: false)
  store/
    workspace.tsx         ← Global contract state (address, abiInput, isLoaded…)
                            + WorkspaceComputedProvider (parsedAbi, readFunctions…)
    pipeline.tsx          ← Tool-to-tool value piping via prefill/consume
  lib/
    chain.ts              ← ALL chain configs: explorer URLs, Alchemy subdomains, faucets
    inspector.ts          ← Value type detection engine (address / timestamp / ETH…)
    db.ts                 ← IndexedDB via idb: contract_visit + transaction history
    simulate.ts           ← viem simulateContract + gas estimation
    prices.ts             ← CoinGecko price fetch with 60s cache
    wagmi.ts              ← wagmi config using chain.ts
  hooks/
    useAbiParser.ts       ← Parses raw ABI JSON; normalizes legacy formats
    useLiveChain.ts       ← Live gas/block/ETH price (polls every 12s / 60s)
    useCommandPalette.ts  ← ⌘K open/close state + keyboard listener
  components/
    layout/
      AppShell.tsx        ← Full shell: TopNav (fixed h-20) + SideNav (fixed w-64) + main
      CommandPalette.tsx  ← ⌘K overlay: search tools, functions, history
      HubLayout.tsx       ← DEAD CODE — superseded by AppShell; safe to delete
      LeftOutline.tsx     ← DEAD CODE — superseded by SideNav in AppShell; safe to delete
    screens/
      DashboardScreen.tsx  ← System overview, live IndexedDB metrics, session log
      WorkspaceScreen.tsx  ← Unified intake + DashboardExplorer (inline when contract loaded)
      DebuggerScreen.tsx   ← Simulation + gas estimation for write functions
      EventsScreen.tsx     ← Live contract event watcher via viem watchContractEvent
      CompareScreen.tsx    ← Paste two ABIs; useMemo diff shows added/removed/unchanged
      MonitoringScreen.tsx ← Real-time gas, live block feed via watchBlocks
      HistoryScreen.tsx    ← IndexedDB visits + paginated transaction log; live log wired to real data
      ToolsScreen.tsx      ← All 9 dev tools; FREQUENTLY USED buttons scroll to tool by id
      SettingsScreen.tsx   ← Chain selector (useSwitchChain) + RPC override
      AboutScreen.tsx      ← Project info, routes reference, shortcuts, tech stack
    inspector/
      ValueInspector.tsx  ← Hover tooltip with value interpretations + pipe buttons
                            Fires 'open-tool' event → handled by ToolDrawer
      SmartPastePill.tsx  ← Inline suggestion when paste is detected as a known type
    tools/
      registry.ts         ← Tool metadata: id, name, shortcut, inputTypes
      WeiConverter.tsx    ← Wei ↔ Gwei ↔ ETH + custom token decimals
      Keccak256.tsx       ← keccak256 of UTF-8 string or hex bytes
      TimestampConverter.tsx ← Unix ↔ human date + relative time
      HexDecConverter.tsx ← Hex ↔ Decimal ↔ Binary + bit analysis
      CalldataDecoder.tsx ← decodeFunctionData against loaded ABI
      FourByteSelector.tsx ← 4byte.directory lookup + keccak selector compute
      TokenFormatter.tsx  ← Raw uint256 ↔ human amount by decimals
      StorageSlot.tsx     ← simple / mapping / array slot calculator
      AddressChecksum.tsx ← EIP-55 checksum validate + convert
    abi/
      dashboard/index.tsx ← Orchestrates fetch + generate; reads/writes workspace store
      DashboardHeader.tsx ← Contract identity bar (reads workspace store)
      DashboardIntake.tsx ← Address + ABI input form (reads/writes workspace store)
      DashboardExplorer.tsx ← Read/Write tabs grid; function cards with id="fn-{name}"
      card/index.tsx      ← FunctionCard: inputs + simulate + execute + output
      card/hooks/useFunctionLogic.tsx ← Core write/read/simulate logic per function
      HistorySidebar.tsx  ← DEAD CODE — LeftOutline removed; safe to delete
```

---

## State Flow

```
User input
  → dispatch to WorkspaceContext
  → WorkspaceComputedProvider re-derives parsedAbi via useAbiParser
  → ExplorerScreen / DebuggerScreen read readFunctions / writeFunctions
  → DashboardExplorer reads readFunctions / writeFunctions
  → FunctionCard reads abi + address from props

Value output hovered
  → ValueInspector.inspect(value) → Interpretation[]
  → User clicks "pipe" → pipeline.prefill(toolId, value)
  → CustomEvent 'open-tool' fired
  → ToolDrawer listens → opens drawer with pre-filled tool

⌘K pressed
  → useCommandPalette.isOpen = true
  → CommandPalette searches tools + readFunctions + writeFunctions + history
  → Select function → scrollIntoView(fn-{name})
  → Select history → fires 'load-contract' event → DashboardIntake hydrates
  → Select tool → fires 'open-tool' → ToolDrawer opens
```

---

## Naming Conventions

- Tool IDs: camelCase (`wei`, `fourByte`, `storageSlot`)
- Custom events: kebab-case (`open-tool`, `load-contract`, `history-updated`)
- Store actions: SCREAMING_SNAKE (`SET_ADDRESS`, `SET_CONTRACT`, `RESET`)
- Component files: PascalCase, co-located with their concern
