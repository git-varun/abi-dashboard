import { Zap, Hash, Clock, Binary, FileCode, Search, Coins, Database, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ToolDef = {
    id: string;
    name: string;
    description: string;
    shortcut: string;
    icon: LucideIcon;
    inputTypes: string[];
    category: 'convert' | 'decode' | 'compute';
};

export const TOOLS: ToolDef[] = [
    { id: 'wei', name: 'Wei Converter', description: 'Wei ↔ Gwei ↔ ETH with token decimal support', shortcut: 'W', icon: Zap, inputTypes: ['eth_amount', 'decimal'], category: 'convert' },
    { id: 'keccak', name: 'Keccak256 Hasher', description: 'Hash strings, ABI signatures, and bytes', shortcut: 'K', icon: Hash, inputTypes: [], category: 'compute' },
    { id: 'timestamp', name: 'Timestamp Converter', description: 'Unix timestamp ↔ human-readable date', shortcut: 'T', icon: Clock, inputTypes: ['timestamp'], category: 'convert' },
    { id: 'hex', name: 'Hex ↔ Dec', description: 'Convert between hex, decimal, and binary', shortcut: 'H', icon: Binary, inputTypes: ['hex', 'decimal'], category: 'convert' },
    { id: 'calldata', name: 'Calldata Decoder', description: 'Decode raw calldata against any ABI', shortcut: 'C', icon: FileCode, inputTypes: [], category: 'decode' },
    { id: 'fourByte', name: '4-Byte Selector', description: 'Reverse-lookup function signatures', shortcut: 'F', icon: Search, inputTypes: ['selector'], category: 'decode' },
    { id: 'tokenFormatter', name: 'Token Formatter', description: 'Format raw uint256 by decimal places', shortcut: 'U', icon: Coins, inputTypes: ['eth_amount', 'decimal'], category: 'convert' },
    { id: 'storageSlot', name: 'Storage Slot', description: 'Calculate mapping and array storage slots', shortcut: 'S', icon: Database, inputTypes: [], category: 'compute' },
    { id: 'addressChecksum', name: 'Address Checksum', description: 'Validate and convert EIP-55 checksum', shortcut: 'A', icon: ShieldCheck, inputTypes: ['address'], category: 'decode' },
];

export function findTool(id: string): ToolDef | undefined {
    return TOOLS.find(t => t.id === id);
}
