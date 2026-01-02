
import React from 'react';
import { useDragon } from '../DragonContext';
import { BrowserViewMode } from '../types';

/**
 * DEPRECATED: This component is legacy.
 * Settings logic is now handled in pages/Settings.tsx with flattened routing.
 * This file is kept as a placeholder to prevent import errors during migration.
 */
export const Settings: React.FC<any> = () => {
  const { navigateTo } = useDragon();
  
  // Auto-redirect if somehow mounted
  React.useEffect(() => {
    navigateTo(BrowserViewMode.SETTINGS);
  }, []);

  return null;
};
