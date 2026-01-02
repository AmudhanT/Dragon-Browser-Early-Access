import { useEffect } from 'react';
import { useDragon } from '../DragonContext';
import { BrowserViewMode } from '../types';

/**
 * DEPRECATED: Legacy redirect component
 * Kept only to avoid import errors
 */
const Settings = () => {
  const { navigateTo } = useDragon();

  useEffect(() => {
    // ✅ pass REQUIRED argument
    navigateTo(BrowserViewMode.SETTINGS);
  }, [navigateTo]);

  return null;
};

export default Settings;
