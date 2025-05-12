/**
 * Debate Service for Lexiroo
 * Manages debate configuration persistence and retrieval
 */

import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storageService';

// Define el tipo para los debates guardados
export type StoredDebate = DebateConfigData & {
  createdAt: string;
};

// Tipo para las referencias a debates completados
export type CompletedDebateReference = {
  id: string;
  timestamp: number;
  learningId: string;
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
  isCompleted?: boolean; // Indica si el debate ha sido completado
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
  isCompleted: false,
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
  console.log('Guardando debate completado. Debate actual:', config);
  
  // Usar el ID existente del debate, o generar uno nuevo si no existe
  const debateId = config.id || `debate-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = Date.now();
  
  // 1. Actualizar el debate original en su clave específica
  const updatedDebate: DebateConfigData = {
    ...config,
    id: debateId,
    learningId: learningId || config.learningId,
    isCompleted: true, // Marcar debate como completado
    timestamp: timestamp,
  };
  
  // Guardar el debate actualizado en su clave específica
  const debateKey = `${STORAGE_KEYS.DEBATE_CONFIG}_${debateId}`;
  const updateResult = setStorageItem(debateKey, updatedDebate);
  console.log(`Debate ${debateId} actualizado con isCompleted=true. Resultado:`, updateResult);
  
  // 2. Mantener una referencia al debate completado en SAVED_DEBATES
  // Estas referencias son más ligeras y evitan duplicación de datos
  const completedReference: CompletedDebateReference = {
    id: debateId,
    timestamp: timestamp,
    learningId: updatedDebate.learningId,
  };
  
  // Obtener referencias existentes
  const savedReferences = getStorageItem<CompletedDebateReference[]>(STORAGE_KEYS.SAVED_DEBATES, []);
  
  // Verificar si ya existe una referencia a este debate
  const existingIndex = savedReferences.findIndex(ref => ref.id === debateId);
  
  if (existingIndex >= 0) {
    // Actualizar la referencia existente
    savedReferences[existingIndex] = completedReference;
    console.log('Actualizando referencia existente');
  } else {
    // Añadir la nueva referencia
    savedReferences.push(completedReference);
    console.log('Añadiendo nueva referencia a debates completados');
  }
  
  // Guardar la lista actualizada de referencias
  const saveResult = setStorageItem(STORAGE_KEYS.SAVED_DEBATES, savedReferences);
  console.log('Referencias de debates completados guardadas:', saveResult);
  
  // Ya no es necesario eliminar de la lista de activos, ya que
  // el debate sigue en su clave original pero con isCompleted=true
  
  return debateId;
};

/**
 * Obtiene todos los debates guardados como completados
 * @returns Array de debates guardados
 */
export const getSavedDebates = (): StoredDebate[] => {
  console.log('getSavedDebates - Obteniendo debates completados');
  
  // Obtener las referencias a debates completados
  const completedReferences = getStorageItem<CompletedDebateReference[]>(STORAGE_KEYS.SAVED_DEBATES, []);
  console.log(`getSavedDebates - Encontradas ${completedReferences.length} referencias a debates completados`);
  
  // Array para almacenar los debates completos
  const debates: StoredDebate[] = [];
  
  // Cargar cada debate desde su ubicación individual
  for (const reference of completedReferences) {
    const debateKey = `${STORAGE_KEYS.DEBATE_CONFIG}_${reference.id}`;
    const debate = getStorageItem<DebateConfigData | undefined>(debateKey, undefined);
    
    if (debate) {
      // Convertir a StoredDebate añadiendo createdAt si es necesario
      const storedDebate: StoredDebate = {
        ...debate,
        createdAt: debate.timestamp ? new Date(debate.timestamp).toISOString() : new Date(reference.timestamp).toISOString()
      };
      debates.push(storedDebate);
    } else {
      console.warn(`getSavedDebates - No se encontró el debate ${reference.id} referenciado en SAVED_DEBATES`);
    }
  }
  
  console.log(`getSavedDebates - Total debates completados cargados: ${debates.length}`);
  
  // Verificación adicional de los datos para depuración
  if (debates.length > 0) {
    console.log('getSavedDebates - Primer debate completado:', debates[0]);
    console.log('getSavedDebates - IDs de learnings relacionados:', debates.map(d => d.learningId));
  }
  
  return debates;
};

/**
 * Obtiene los debates relacionados con un learning específico
 * @param learningId ID del learning
 * @returns Array de debates relacionados con el learning
 */
/**
 * Elimina un debate de la lista de debates activos
 * @param debateId ID del debate a eliminar
 */
export const removeDebateFromActiveList = (debateId: string): void => {
  // Obtener la lista actual de IDs de debates activos
  const activeDebateIds = getStorageItem<string[]>('active_debate_ids', []);
  
  // Filtrar el ID del debate que queremos eliminar
  const filteredIds = activeDebateIds.filter(id => id !== debateId);
  
  // Guardar la nueva lista sin el debate eliminado
  if (activeDebateIds.length !== filteredIds.length) {
    console.log(`removeDebateFromActiveList - Eliminando debate ${debateId} de debates activos`);
    setStorageItem('active_debate_ids', filteredIds);
  }
};

export const getDebatesByLearningId = (learningId: string): StoredDebate[] => {
  console.log(`getDebatesByLearningId - Buscando debates para learning ID: ${learningId}`);
  
  // Array para almacenar todos los debates relacionados
  const relatedDebates: StoredDebate[] = [];
  
  // Set para seguir los IDs de debates ya procesados
  const processedDebateIds = new Set<string>();
  
  // 1. Obtener todas las referencias a debates completados
  const completedReferences = getStorageItem<CompletedDebateReference[]>(STORAGE_KEYS.SAVED_DEBATES, []);
  const relatedReferences = completedReferences.filter(ref => ref.learningId === learningId);
  console.log(`getDebatesByLearningId - Encontradas ${relatedReferences.length} referencias a debates completados relacionados`);
  
  // 2. Obtener todos los IDs de debates (completados y activos)
  const allDebateIds = new Set<string>();
  
  // Añadir IDs de debates completados
  relatedReferences.forEach(ref => allDebateIds.add(ref.id));
  
  // Añadir IDs de debates activos
  const activeDebateIds = getStorageItem<string[]>('active_debate_ids', []);
  activeDebateIds.forEach(id => allDebateIds.add(id));
  
  // 3. Para cada ID, intentar cargar el debate y verificar si está relacionado
  console.log(`getDebatesByLearningId - Verificando ${allDebateIds.size} debates posibles`);
  
  for (const debateId of allDebateIds) {
    // Verificar que este debate no ya esté procesado
    if (!processedDebateIds.has(debateId)) {
      const debateKey = `${STORAGE_KEYS.DEBATE_CONFIG}_${debateId}`;
      const debate = getStorageItem<DebateConfigData | undefined>(debateKey, undefined);
      
      // Si el debate existe, está relacionado con el learning y no ha sido eliminado
      if (debate && debate.learningId === learningId) {
        // Decidir si incluirlo basado en su estado de completitud
        // Los debates completados tienen prioridad
        if (debate.isCompleted) {
          console.log(`getDebatesByLearningId - Encontrado debate completado: ${debate.id}`);
          const storedDebate: StoredDebate = {
            ...debate,
            createdAt: debate.timestamp ? new Date(debate.timestamp).toISOString() : new Date().toISOString()
          };
          relatedDebates.push(storedDebate);
        } else {
          // Solo incluir debates activos si no han sido completados
          console.log(`getDebatesByLearningId - Encontrado debate activo: ${debate.id}`);
          const storedDebate: StoredDebate = {
            ...debate,
            createdAt: debate.timestamp ? new Date(debate.timestamp).toISOString() : new Date().toISOString()
          };
          relatedDebates.push(storedDebate);
        }
        
        processedDebateIds.add(debateId);
      }
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
    learningId: config.learningId, // Incluir learningId para acceder al contexto
    id: config.id // Mantener el ID del debate
  };
};
