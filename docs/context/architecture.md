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
| `/dashboard` | DashboardScreen | System overview, static charts (hardcoded data) |
| `/contracts` | ContractsScreen | ABI intake + function explorer |
| `/explorer` | ExplorerScreen | Read/Write explorer; requires contract loaded at `/contracts` |
| `/debugger` | DebuggerScreen | Simulation + gas estimation; requires contract loaded at `/contracts` |
| `/monitoring` | MonitoringScreen | Live chain telemetry (partial; block feed is static) |
| `/history` | HistoryScreen | IndexedDB contract visits + transaction log |
| `/tools` | ToolsScreen | All 9 dev tools in bento grid |
| `/settings` | SettingsScreen | Chain selector + RPC override (localStorage only; not wired to wagmi) |
| `/tiers` | TiersScreen | Feature tier marketing page (no enforcement) |

All page content components use `dynamic(..., { ssr: false })` (IndexedDB + wagmi).

**Dead code (not imported anywhere — safe to delete)**: `HubLayout.tsx`, `LeftOutline.tsx`, `RightRail.tsx`, `StatusBar.tsx`, `HistorySidebar.tsx`  
**Kept**: `CommandPalette.tsx` (mounted from `AppShell` TopNav ⌘K)

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
| `open-tool` | `{ toolId: string }` | ValueInspector, CommandPalette, pipeline.prefill | ⚠ NO LISTENER — RightRail removed; piping is a no-op |
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
