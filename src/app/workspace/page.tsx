"use client";

import dynamic from 'next/dynamic';

const WorkspaceScreen = dynamic(() => import('@/components/screens/WorkspaceScreen'), { ssr: false });

export default function WorkspacePage() {
    return <WorkspaceScreen />;
}
