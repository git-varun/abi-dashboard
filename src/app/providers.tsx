"use client";

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { WorkspaceProvider, WorkspaceComputedProvider } from '@/store/workspace';
import { PipelineProvider } from '@/store/pipeline';

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    const [queryClient] = React.useState(() => new QueryClient());

    React.useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={lightTheme({ accentColor: '#0046dd', borderRadius: 'none' })} modalSize="compact">
                    <WorkspaceProvider>
                        <PipelineProvider>
                            <WorkspaceComputedProvider>
                                {children}
                            </WorkspaceComputedProvider>
                        </PipelineProvider>
                    </WorkspaceProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
