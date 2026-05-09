"use client";

import dynamic from 'next/dynamic';

const CompareScreen = dynamic(() => import('@/components/screens/CompareScreen'), { ssr: false });

export default function ComparePage() {
    return <CompareScreen />;
}
