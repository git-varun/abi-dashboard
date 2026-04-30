"use client";

import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/AppShell';

const Dashboard = dynamic(() => import('@/components/abi/dashboard'), { ssr: false });

export default function ContractsScreen() {
    return (
        <AppShell>
            <Dashboard />
        </AppShell>
    );
}
