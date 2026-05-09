# Architecture

## Layout

```
AppShell (neobrutalist, light theme)
├── TopNav (fixed h-20, logo + nav links + ConnectButton + ⌘K)
├── SideNav (fixed left w-64, 5 nav items, active = lime bg + neo-shadow)
└── main (ml-64 mt-20 p-8)
    └── {page content}

CommandPalette (overlay z-[100], triggered from TopNav ⌘K button)
```

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | redirect | → `/dashboard` |
| `/dashboard` | DashboardScreen | System overview, live IndexedDB metrics, session log |
| `/workspace` | WorkspaceScreen | ABI intake + inline DashboardExplorer when contract loaded |
| `/contracts` | redirect | → `/workspace` (backward compat) |
| `/explorer` | redirect | → `/workspace` (backward compat) |
| `/debugger` | DebuggerScreen | Simulation + gas estimation; requires contract in workspace store |
| `/events` | EventsScreen | Live contract event watcher via viem watchContractEvent |
| `/compare` | CompareScreen | Paste two ABIs side-by-side; diff shows added / removed / unchanged entries |
| `/monitoring` | MonitoringScreen | Live gas prices, live block feed via watchBlocks, ETH price |
| `/history` | HistoryScreen | IndexedDB contract visits + transaction log; live log panel wired to real data |
| `/tools` | ToolsScreen | All 9 dev tools in bento grid; FREQUENTLY USED buttons scroll to tool |
| `/settings` | SettingsScreen | Chain selector (wired to useSwitchChain) + RPC override |
| `/tiers` | redirect | → `/about` |
| `/about` | AboutScreen | Project info, routes reference, shortcuts, tech stack |

All page content components use `dynamic(..., { ssr: false })` (IndexedDB + wagmi).

**Kept**: `CommandPalette.tsx` (mounted from `AppShell` TopNav ⌘K), `ToolDrawer.tsx` (listens for `open-tool` events from ValueInspector)

## State Architecture

Three separate React contexts, intentionally layered:

| Context | Location | Contains |
|---------|----------|---------|
| `WorkspaceContext` | `store/workspace.ts` | Raw mutable state: address, abiInput, contractName, isProxy, isLoaded, isFetching |
| `WorkspaceComputedContext` | `store/workspace.ts` | Derived: parsedAbi, readFunctions, writeFunctions, error, diagnostics |
| `PipelineContext` | `store/pipeline.ts` | prefill(toolId, value) / consume(toolId) for tool-to-tool piping |

`WorkspaceComputedProvider` must be a child of `WorkspaceProvider` (calls `useWorkspace()` + `useAbiParser()`).

## Event Bus (Custom Events)

Used to cross context boundaries without prop drilling:

| Event | Payload | Fired by | Handled by |
|-------|---------|----------|-----------|
| `open-tool` | `{ toolId: string }` | ValueInspector, CommandPalette, pipeline.prefill | ToolDrawer (mounted in AppShell) |
| `load-contract` | `{ address, abi, name }` | CommandPalette (history select) | DashboardIntake |
| `history-updated` | none | db.ts (addToHistory, deleteHistoryItem) | HistoryScreen |

## Routing

Multi-route app (App Router). All routes use `dynamic(..., { ssr: false })` to prevent IndexedDB / wagmi errors. See Routes table above.

## Data Flow

```
Etherscan V2 (server action) ──→ workspace.abiInput
                                        ↓
                               useAbiParser (useMemo)
                                        ↓
                        WorkspaceComputedContext
                          ↙              ↘
                LeftOutline          DashboardExplorer
             (function index)        (function cards)
```
