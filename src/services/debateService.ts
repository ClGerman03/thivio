/**
 * Debate Service for Lexiroo
 * Manages debate configuration persistence and retrieval
 */

import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storageService';

/**
 * Type definition for debate configuration
 */
export type DebateConfigData = {
  topic: string;
  topics: string[];
  positions: Record<string, string>;
  opponent: string;
  debateFormat: string;
  turnCount: number;
  timestamp?: number;
};

/**
 * Default debate configuration
 */
export const DEFAULT_DEBATE_CONFIG: DebateConfigData = {
  topic: '',
  topics: [],
  positions: {},
  opponent: '',
  debateFormat: 'turn-based',
  turnCount: 3,
};

/**
 * Save debate configuration to localStorage
 * @param config Debate configuration to save
 * @returns boolean indicating success
 */
export const saveDebateConfig = (config: DebateConfigData): boolean => {
  const configWithTimestamp = {
    ...config,
    timestamp: Date.now(),
  };
  return setStorageItem(STORAGE_KEYS.DEBATE_CONFIG, configWithTimestamp);
};

/**
 * Load debate configuration from localStorage
 * @returns The stored debate configuration or default if not found
 */
export const loadDebateConfig = (): DebateConfigData => {
  return getStorageItem<DebateConfigData>(STORAGE_KEYS.DEBATE_CONFIG, DEFAULT_DEBATE_CONFIG);
};

/**
 * Check if a saved debate configuration exists
 * @returns boolean indicating if configuration exists
 */
export const hasDebateConfig = (): boolean => {
  const config = loadDebateConfig();
  return config.topics.length > 0;
};

/**
 * Get a specific topic's position from the debate configuration
 * @param topic The topic to get position for
 * @returns The position or empty string if not found
 */
export const getTopicPosition = (topic: string): string => {
  const config = loadDebateConfig();
  return config.positions[topic] || '';
};

/**
 * Generate debate session data for API calls or rendering
 * @param config The debate configuration
 * @returns Formatted session data
 */
export const generateDebateSessionData = (config: DebateConfigData) => {
  // Si el tema principal no está definido, usar el primer tema del array
  const mainTopic = config.topic || config.topics[0] || '';
  
  return {
    topic: mainTopic,
    topics: config.topics,  // Mantener la lista completa de tópicos
    debateFormat: config.debateFormat,
    turnCount: config.turnCount,
    opponent: config.opponent,
    positions: config.positions,
  };
};
