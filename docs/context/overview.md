# Overview

**ABI Workbench** — a professional smart contract interaction tool for blockchain developers.

## What It Does

1. **Load any contract** — paste an address and auto-fetch ABI from Etherscan (with EIP-1967 proxy detection), or paste ABI manually
2. **Explore functions** — read/write explorer with typed inputs, real-time validation, wallet execution
3. **Simulate before sending** — pre-flight simulation via viem; gas cost in native + INR; Tenderly trace link
4. **Utility tools** — 9 developer tools accessible from the right rail or ⌘K: Wei, Keccak256, Timestamp, Hex, Calldata Decoder, 4-Byte Selector, Token Formatter, Storage Slot, Address Checksum
5. **Value Inspector** — hover any output value to get intelligent interpretations and pipe directly into a tool
6. **History** — IndexedDB-persisted contract visits and transaction log, restored in left outline

## Target Users

Senior smart contract engineers who need a fast, keyboard-first workbench — not a tutorial-focused block explorer.

## Design Philosophy

- **One workspace, not tabs** — Hub & Rail layout keeps all tools accessible without navigation
- **Values are alive** — any rendered output can be inspected, copied, and piped to another tool
- **Keyboard-first** — ⌘K palette, function scroll-to, shortcut keys for every tool
- **Glass depth** — three-layer glassmorphism: black base → glass panels → elevated cards
