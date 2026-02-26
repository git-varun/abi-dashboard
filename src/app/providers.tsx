"use client";

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    const [queryClient] = React.useState(() => new QueryClient());

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // 2. Prevent the "jump" by not rendering anything until the client is ready
    if (!mounted) return null;

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()} modalSize="compact">
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}