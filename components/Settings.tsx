import { useEffect } from 'react';
import { useDragon } from '../DragonContext';

/**
 * DEPRECATED: Legacy redirect component
 */
const Settings = () => {
  const { navigateTo } = useDragon();

  useEffect(() => {
    navigateTo(); // ✅ NO ARGUMENT
  }, [navigateTo]);

  return null;
};

export default Settings;
