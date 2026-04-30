"use client";

import dynamic from 'next/dynamic';

const HistoryScreen = dynamic(() => import('@/components/screens/HistoryScreen'), { ssr: false });

export default function HistoryPage() {
    return <HistoryScreen />;
}
