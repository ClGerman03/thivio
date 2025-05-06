/**
 * Storage Service for Lexiroo
 * Handles localStorage operations with proper error handling and type safety
 */

// Storage keys
export const STORAGE_KEYS = {
  DEBATE_CONFIG: 'lexiroo_debate_config',
};

/**
 * Set data in localStorage with error handling
 * @param key Storage key
 * @param data Data to store
 * @returns boolean indicating success
 */
export const setStorageItem = <T>(key: string, data: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    return false;
  }
};

/**
 * Get data from localStorage with error handling and type safety
 * @param key Storage key
 * @param defaultValue Default value if key not found or error occurs
 * @returns The stored data or defaultValue
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 * @param key Storage key
 * @returns boolean indicating success
 */
export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all localStorage items related to the app
 * @returns boolean indicating success
 */
export const clearStorage = (): boolean => {
  try {
    // Clear only app-related items
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};
