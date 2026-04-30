"use client";

import dynamic from 'next/dynamic';

const DashboardScreen = dynamic(() => import('@/components/screens/DashboardScreen'), { ssr: false });

export default function DashboardPage() {
    return <DashboardScreen />;
}
