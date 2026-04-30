# Tools

All tools live in `src/components/tools/`. They are rendered inside `RightRail.tsx` via lazy `dynamic()` imports.

## Adding a New Tool

1. Create `src/components/tools/MyTool.tsx` — export a named `MyTool` component
2. Add entry to `src/components/tools/registry.ts → TOOLS[]`
3. Import and render it in `src/components/screens/ToolsScreen.tsx` inside the bento grid
4. (Optional) Add `inputTypes` to the registry entry so ValueInspector can offer it as a pipe target
5. (Optional) Add a detection case in `src/lib/inspector.ts` if the tool consumes a new value type

> Note: RightRail was removed. Tools no longer lazy-load into a side panel; they are statically rendered on `/tools`. The `prefilled` prop + pipeline piping mechanism exists in code but the `open-tool` event has no listener — see `gaps.md`.

## Tool Interface Contract

```tsx
interface ToolProps {
    prefilled?: unknown;  // value piped from ValueInspector — currently no-op (see gaps.md)
}
```

Tools still accept `prefilled` and initialize via `useEffect` — the contract is intact for when piping is restored.

## Current Tools

| ID | Component | Shortcut | Input Types |
|----|-----------|----------|------------|
| `wei` | WeiConverter | W | eth_amount, decimal |
| `keccak` | Keccak256 | K | — |
| `timestamp` | TimestampConverter | T | timestamp |
| `hex` | HexDecConverter | H | hex, decimal |
| `calldata` | CalldataDecoder | C | — |
| `fourByte` | FourByteSelector | F | selector |
| `tokenFormatter` | TokenFormatter | U | eth_amount, decimal |
| `storageSlot` | StorageSlot | S | — |
| `addressChecksum` | AddressChecksum | A | address |

## Value Inspector Integration

`src/lib/inspector.ts → inspect(value)` returns `Interpretation[]`. Each interpretation can have:
- `pipeTarget: string` — tool ID to open
- `pipeLabel: string` — button label shown in the tooltip

When user clicks "pipe": `pipeline.prefill(toolId, value)` → fires `open-tool` custom event → RightRail opens tool → tool calls `pipeline.consume(toolId)` on mount.
