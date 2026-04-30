import { formatUnits } from 'viem';

export type ValueType =
    | 'eth_amount'
    | 'timestamp'
    | 'address'
    | 'bytes32_string'
    | 'selector'
    | 'tx_hash'
    | 'boolean'
    | 'hex'
    | 'decimal';

export type Interpretation = {
    type: ValueType;
    label: string;
    value: string;
    confidence: 'high' | 'medium' | 'low';
    pipeTarget?: string;
    pipeLabel?: string;
};

export function inspect(raw: unknown): Interpretation[] {
    const results: Interpretation[] = [];
    if (raw === undefined || raw === null) return results;

    const s = String(raw);

    if (typeof raw === 'boolean' || s === 'true' || s === 'false') {
        results.push({ type: 'boolean', label: 'Boolean', value: s, confidence: 'high' });
        return results;
    }

    // Ethereum address
    if (/^0x[0-9a-fA-F]{40}$/.test(s)) {
        results.push({ type: 'address', label: 'Address', value: s, confidence: 'high', pipeTarget: 'addressChecksum', pipeLabel: 'Validate Checksum' });
        return results;
    }

    // bytes32 / tx hash (64 hex chars)
    if (/^0x[0-9a-fA-F]{64}$/.test(s)) {
        results.push({ type: 'tx_hash', label: 'bytes32 / TX Hash', value: s, confidence: 'high' });
        try {
            const str = Buffer.from(s.slice(2), 'hex').toString('utf8').replace(/\0+$/, '');
            if (str && /^[\x20-\x7E]+$/.test(str)) {
                results.push({ type: 'bytes32_string', label: 'bytes32 as string', value: str, confidence: 'medium' });
            }
        } catch { /* ignore */ }
        return results;
    }

    // 4-byte function selector
    if (/^0x[0-9a-fA-F]{8}$/.test(s)) {
        results.push({ type: 'selector', label: '4-byte Selector', value: s, confidence: 'high', pipeTarget: 'fourByte', pipeLabel: 'Lookup Signature' });
        return results;
    }

    // Large number (bigint or numeric string)
    let num: bigint | null = null;
    try {
        if (typeof raw === 'bigint') num = raw;
        else if (/^\d+$/.test(s)) num = BigInt(s);
    } catch { /* ignore */ }

    if (num !== null) {
        const asNum = Number(num);

        // Unix timestamp range: 2010-01-01 to 2060-01-01
        if (asNum > 1262304000 && asNum < 2840140800 && num < BigInt(2 ** 32)) {
            const date = new Date(asNum * 1000);
            results.push({
                type: 'timestamp', label: 'Unix Timestamp',
                value: date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                confidence: 'medium',
                pipeTarget: 'timestamp', pipeLabel: 'Open in Timestamp Converter',
            });
        }

        // ETH (18 decimals)
        try {
            const asEth = formatUnits(num, 18);
            const asEthNum = parseFloat(asEth);
            if (asEthNum > 0 && asEthNum < 1_000_000_000) {
                results.push({
                    type: 'eth_amount', label: 'As ETH (18 dec)',
                    value: `${parseFloat(asEthNum.toPrecision(6))} ETH`,
                    confidence: asEthNum < 1_000_000 ? 'medium' : 'low',
                    pipeTarget: 'wei', pipeLabel: 'Open in Wei Converter',
                });
            }
        } catch { /* ignore */ }

        results.push({ type: 'decimal', label: 'Decimal', value: num.toString(), confidence: 'high' });
        results.push({
            type: 'hex', label: 'Hex',
            value: `0x${num.toString(16)}`,
            confidence: 'high',
            pipeTarget: 'hex', pipeLabel: 'Open in Hex Converter',
        });

        return results;
    }

    // Generic hex
    if (/^0x[0-9a-fA-F]+$/.test(s)) {
        results.push({ type: 'hex', label: 'Hex', value: s, confidence: 'high', pipeTarget: 'hex', pipeLabel: 'Open in Hex Converter' });
    }

    return results;
}
