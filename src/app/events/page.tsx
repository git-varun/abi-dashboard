"use client";

import dynamic from 'next/dynamic';

const EventsScreen = dynamic(() => import('@/components/screens/EventsScreen'), { ssr: false });

export default function EventsPage() {
    return <EventsScreen />;
}
