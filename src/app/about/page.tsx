"use client";

import dynamic from 'next/dynamic';

const AboutScreen = dynamic(() => import('@/components/screens/AboutScreen'), { ssr: false });

export default function AboutPage() {
    return <AboutScreen />;
}
