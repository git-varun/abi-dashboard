"use client";

import dynamic from 'next/dynamic';

const ContractsScreen = dynamic(() => import('@/components/screens/ContractsScreen'), { ssr: false });

export default function ContractsPage() {
    return <ContractsScreen />;
}
