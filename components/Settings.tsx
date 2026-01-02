import React, { useEffect } from 'react';
import { useDragon } from '../DragonContext';
import { BrowserViewMode } from '../types';

/**
 * DEPRECATED: This component is legacy.
 * Settings logic is now handled in pages/Settings.tsx with flattened routing.
 * This file is kept as a placeholder to prevent import errors during migration.
 */
const Settings: React.FC = () => {
  const { navigateTo } = useDragon();

  // Auto-redirect if somehow mounted
  useEffect(() => {
    navigateTo(BrowserViewMode.SETTINGS);
  }, [navigateTo]);

  return null;
};

export default Settings;
