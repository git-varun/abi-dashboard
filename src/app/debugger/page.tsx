'use client';
import dynamic from 'next/dynamic';

const DebuggerScreen = dynamic(() => import('@/components/screens/DebuggerScreen'), { ssr: false });

export default function DebuggerPage() {
    return <DebuggerScreen />;
}
