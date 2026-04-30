'use client';
import dynamic from 'next/dynamic';

const MonitoringScreen = dynamic(() => import('@/components/screens/MonitoringScreen'), { ssr: false });

export default function MonitoringPage() {
    return <MonitoringScreen />;
}
