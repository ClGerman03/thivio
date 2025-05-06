import { useState, useEffect } from 'react';
import { 
  DebateConfigData, 
  DEFAULT_DEBATE_CONFIG, 
  saveDebateConfig, 
  loadDebateConfig 
} from '@/services/debateService';

/**
 * Custom hook for managing debate configuration storage
 * Provides functions to save, load and update debate configuration
 * with automatic localStorage persistence
 */
export function useDebateStorage() {
  const [config, setConfig] = useState<DebateConfigData>(DEFAULT_DEBATE_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load config from localStorage on initial mount
  useEffect(() => {
    const storedConfig = loadDebateConfig();
    setConfig(storedConfig);
    setIsLoaded(true);
  }, []);

  // Save config to localStorage whenever it changes
  const updateConfig = (newConfig: Partial<DebateConfigData>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    saveDebateConfig(updatedConfig);
    return updatedConfig;
  };

  // Update a specific field in the config
  const updateField = <K extends keyof DebateConfigData>(
    key: K, 
    value: DebateConfigData[K]
  ) => {
    return updateConfig({ [key]: value } as Partial<DebateConfigData>);
  };

  // Reset config to defaults
  const resetConfig = () => {
    setConfig(DEFAULT_DEBATE_CONFIG);
    saveDebateConfig(DEFAULT_DEBATE_CONFIG);
    return DEFAULT_DEBATE_CONFIG;
  };

  return {
    config,
    isLoaded,
    updateConfig,
    updateField,
    resetConfig
  };
}

export default useDebateStorage;
