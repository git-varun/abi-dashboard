'use client';
import dynamic from 'next/dynamic';

const TiersScreen = dynamic(() => import('@/components/screens/TiersScreen'), { ssr: false });

export default function TiersPage() {
    return <TiersScreen />;
}
