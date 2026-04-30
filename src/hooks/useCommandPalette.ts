"use client";

import { useState, useEffect, useCallback } from 'react';

export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(v => !v), []);

    useEffect(() => {
        const onKeydown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKeydown);
        return () => window.removeEventListener('keydown', onKeydown);
    }, [toggle, close]);

    return { isOpen, open, close };
}
