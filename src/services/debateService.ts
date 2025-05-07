/**
 * Debate Service for Lexiroo
 * Manages debate configuration persistence and retrieval
 */

import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storageService';

// Define el tipo para los debates guardados
export type StoredDebate = DebateConfigData & {
  createdAt: string;
};

/**
 * Type definition for debate configuration
 */
export type DebateConfigData = {
  id: string; // ID único del debate
  topic: string;
  topics: string[];
  positions: Record<string, string>;
  opponent: string;
  debateFormat: string;
  turnCount: number;
  debateName: string;
  timestamp?: number;
  learningId: string; // ID del learning relacionado (requerido)
};

/**
 * Default debate configuration
 */
export const DEFAULT_DEBATE_CONFIG: DebateConfigData = {
  id: '', // ID vacío por defecto, debe ser asignado cuando se crea un debate
  topic: '',
  topics: [],
  positions: {},
  opponent: '',
  debateFormat: 'turn-based',
  turnCount: 3,
  debateName: '',
  learningId: '',
};

/**
 * Save debate configuration to localStorage
 * @param config Debate configuration to save
 * @returns boolean indicating success
 */
export const saveDebateConfig = (config: DebateConfigData): boolean => {
  // Asegurarse de que hay un ID válido
  if (!config.id) {
    console.warn('saveDebateConfig - ¡Advertencia! Guardando configuración sin ID');
    return false;
  }
  
  // Crear clave específica para este debate
  const debateSpecificKey = `${STORAGE_KEYS.DEBATE_CONFIG}_${config.id}`;
  
  const configWithTimestamp = {
    ...config,
    timestamp: Date.now(),
  };
  
  // Guardar la configuración con el ID específico del debate para no sobrescribir otros debates
  const result = setStorageItem(debateSpecificKey, configWithTimestamp);
  
  // También actualizamos un registro de todos los debates activos para poder recuperarlos después
  const activeDebateIds = getStorageItem<string[]>('active_debate_ids', []);
  if (!activeDebateIds.includes(config.id)) {
    activeDebateIds.push(config.id);
    setStorageItem('active_debate_ids', activeDebateIds);
  }
  
  console.log(`saveDebateConfig - Debate ${config.id} guardado correctamente`);
  return result;
};

/**
 * Guarda un debate completo en el almacenamiento
 * @param config Configuración del debate
 * @param learningId ID del learning relacionado (opcional)
 * @returns El ID del debate guardado
 */
export const saveCompletedDebate = (config: DebateConfigData, learningId?: string): string => {
  // Obtener debates guardados existentes
  const savedDebates = getSavedDebates();
  console.log('Debates existentes antes de guardar:', savedDebates);
  
  // Usar el ID existente del debate, o generar uno nuevo si no existe
  const debateId = config.id || `debate-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const newDebate: StoredDebate = {
    ...config,
    id: debateId, // Mantener el ID existente o usar el nuevo
    learningId: learningId || config.learningId, // Usar el learningId proporcionado o mantener el actual
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
  };
  
  console.log('Nuevo debate a guardar:', newDebate);
  console.log('Learning ID relacionado:', newDebate.learningId);
  
  // Verificar si ya existe un debate con este ID
  const existingIndex = savedDebates.findIndex(debate => debate.id === debateId);
  
  if (existingIndex >= 0) {
    // Actualizar el debate existente
    savedDebates[existingIndex] = newDebate;
    console.log('Actualizando debate existente en índice:', existingIndex);
  } else {
    // Añadir el nuevo debate a la lista
    savedDebates.push(newDebate);
    console.log('Añadiendo nuevo debate a la lista');
  }
  
  // Guardar la lista actualizada
  const saveResult = setStorageItem(STORAGE_KEYS.SAVED_DEBATES, savedDebates);
  console.log('Resultado de guardar debates:', saveResult, 'Total debates guardados:', savedDebates.length);
  
  return debateId;
};

/**
 * Obtiene todos los debates guardados
 * @returns Array de debates guardados
 */
export const getSavedDebates = (): StoredDebate[] => {
  // Inspeccionar directamente localStorage para depurar
  try {
    console.log('getSavedDebates - Inspeccionando localStorage directamente');
    const rawData = localStorage.getItem(STORAGE_KEYS.SAVED_DEBATES);
    console.log('getSavedDebates - Datos crudos en localStorage:', rawData);
    
    // Si hay datos, intentar mostrarlos parseados para diagnóstico
    if (rawData) {
      try {
        const parsedData = JSON.parse(rawData);
        console.log('getSavedDebates - Datos parseados:', parsedData);
        console.log('getSavedDebates - ¿Es un array?', Array.isArray(parsedData));
        console.log('getSavedDebates - Longitud:', Array.isArray(parsedData) ? parsedData.length : 'N/A');
      } catch (parseError) {
        console.error('getSavedDebates - Error al parsear datos:', parseError);
      }
    }
  } catch (error) {
    console.error('getSavedDebates - Error al acceder a localStorage directamente:', error);
  }
  
  // Obtener los debates usando la función estándar
  const debates = getStorageItem<StoredDebate[]>(STORAGE_KEYS.SAVED_DEBATES, []);
  console.log('getSavedDebates - Total debates encontrados con getStorageItem:', debates.length);
  
  // Verificación adicional de los datos
  if (debates.length > 0) {
    console.log('getSavedDebates - Primer debate:', debates[0]);
    console.log('getSavedDebates - IDs de learnings relacionados:', debates.map(d => d.learningId));
  }
  
  return debates;
};

/**
 * Obtiene los debates relacionados con un learning específico
 * @param learningId ID del learning
 * @returns Array de debates relacionados con el learning
 */
export const getDebatesByLearningId = (learningId: string): StoredDebate[] => {
  console.log(`getDebatesByLearningId - Buscando debates para learning ID: ${learningId}`);
  
  // Combinar debates de ambas fuentes: los completados y los activos
  const relatedDebates: StoredDebate[] = [];
  
  // 1. Buscar en los debates completados (SAVED_DEBATES)
  const savedDebates = getSavedDebates();
  const savedRelatedDebates = savedDebates.filter(debate => debate.learningId === learningId);
  console.log(`getDebatesByLearningId - Encontrados ${savedRelatedDebates.length} debates completados`);
  relatedDebates.push(...savedRelatedDebates);
  
  // 2. Buscar en los debates activos usando sus IDs individuales
  const activeDebateIds = getStorageItem<string[]>('active_debate_ids', []);
  console.log(`getDebatesByLearningId - Verificando ${activeDebateIds.length} debates activos`);
  
  for (const debateId of activeDebateIds) {
    const debateKey = `${STORAGE_KEYS.DEBATE_CONFIG}_${debateId}`;
    const debate = getStorageItem<DebateConfigData | undefined>(debateKey, undefined);
    
    // Si el debate existe y pertenece al learning solicitado
    if (debate && debate.learningId === learningId) {
      console.log(`getDebatesByLearningId - Encontrado debate activo: ${debate.id}`);
      // Convertir a StoredDebate añadiendo createdAt si no existe
      const storedDebate: StoredDebate = {
        ...debate,
        createdAt: debate.timestamp ? new Date(debate.timestamp).toISOString() : new Date().toISOString()
      };
      relatedDebates.push(storedDebate);
    }
  }
  
  console.log(`getDebatesByLearningId - Total de debates encontrados: ${relatedDebates.length}`);
  return relatedDebates;
};

/**
 * Load debate configuration from localStorage
 * @param debateId Optional debate ID to load specific configuration
 * @returns The stored debate configuration or default if not found
 */
export const loadDebateConfig = (debateId?: string): DebateConfigData => {
  if (debateId) {
    // Cargar la configuración específica para este debate
    const debateSpecificKey = `${STORAGE_KEYS.DEBATE_CONFIG}_${debateId}`;
    console.log(`loadDebateConfig - Cargando configuración para debate ${debateId}`);
    const config = getStorageItem<DebateConfigData>(debateSpecificKey, DEFAULT_DEBATE_CONFIG);
    return config;
  } else {
    // Si no se proporciona un ID, intentar cargar los debates activos
    const activeDebateIds = getStorageItem<string[]>('active_debate_ids', []);
    console.log('loadDebateConfig - Debates activos:', activeDebateIds);
    
    // Retornar el debate más reciente o el valor por defecto
    if (activeDebateIds.length > 0) {
      const mostRecentDebateId = activeDebateIds[activeDebateIds.length - 1];
      const debateSpecificKey = `${STORAGE_KEYS.DEBATE_CONFIG}_${mostRecentDebateId}`;
      return getStorageItem<DebateConfigData>(debateSpecificKey, DEFAULT_DEBATE_CONFIG);
    }
    
    return DEFAULT_DEBATE_CONFIG;
  }
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
  console.log('getTopicPosition - Configuración cargada:', config);
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
