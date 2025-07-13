'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const pressedKey = event.key.toLowerCase();
    
    for (const shortcut of shortcuts) {
      const keyMatch = shortcut.key.toLowerCase() === pressedKey;
      const ctrlMatch = !!shortcut.ctrl === event.ctrlKey;
      const shiftMatch = !!shortcut.shift === event.shiftKey;
      const altMatch = !!shortcut.alt === event.altKey;
      const metaMatch = !!shortcut.meta === event.metaKey;
      
      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined shortcuts for common actions
export const commonShortcuts = {
  startCall: { key: 'Enter', description: 'Start voice call' },
  endCall: { key: 'Escape', description: 'End voice call' },
  mute: { key: 'm', description: 'Toggle mute' },
  reset: { key: 'r', ctrl: true, description: 'Reset session' },
  save: { key: 's', ctrl: true, description: 'Save session' },
  help: { key: '?', description: 'Show keyboard shortcuts' },
  training: { key: 't', description: 'Go to training' },
  dashboard: { key: 'd', description: 'Go to dashboard' },
  home: { key: 'h', description: 'Go to home' }
}; 