"use client";

import dynamic from 'next/dynamic';

const ExplorerScreen = dynamic(() => import('@/components/screens/ExplorerScreen'), { ssr: false });

export default function ExplorerPage() {
    return <ExplorerScreen />;
}
