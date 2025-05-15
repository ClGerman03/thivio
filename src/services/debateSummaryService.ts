/**
 * Debate Summary Service para Thivio
 * Gestiona el almacenamiento y carga de resúmenes de debates
 */

import { setStorageItem, getStorageItem, STORAGE_KEYS } from './storageService';
import { DebateSummaryData } from '@/services/gemini';

// Usamos la clave definida en STORAGE_KEYS para mantener consistencia

/**
 * Interfaz para datos de resumen de debate con metadatos
 */
export interface DebateSummaryWithMetadata {
  id: string;             // ID del debate al que pertenece este resumen
  debateId: string;       // ID del debate (referencia explícita como redundancia)
  learningId: string;     // ID del learning asociado (si aplica)
  createdAt: string;      // Fecha de creación del resumen
  debateName: string;     // Nombre del debate
  debateTopic: string;    // Tema principal del debate
  summaryData: DebateSummaryData;  // Datos del resumen generado por Gemini
}

/**
 * Guarda un resumen de debate en localStorage
 * @param summaryData Resumen generado por Gemini
 * @param debateId ID del debate asociado
 * @param debateConfig Configuración del debate para metadata
 * @returns boolean indicando si se guardó correctamente
 */
export const saveDebateSummary = (
  summaryData: DebateSummaryData, 
  debateId: string,
  metadata: {
    learningId?: string;
    debateName?: string;
    debateTopic?: string;
  }
): boolean => {
  try {
    // Validación de datos de entrada
    if (!summaryData) {
      console.error('Error al guardar resumen: summaryData es null o undefined');
      return false;
    }

    if (!debateId) {
      console.error('Error al guardar resumen: debateId es requerido');
      return false;
    }

    console.log('Guardando resumen para debate:', {
      debateId,
      learningId: metadata.learningId,
      dataPresente: !!summaryData
    });
    
    // Obtenemos todos los resúmenes existentes
    const existingSummaries = getAllDebateSummaries();
    
    // Creamos el nuevo objeto de resumen con metadatos
    const summaryWithMetadata: DebateSummaryWithMetadata = {
      id: `summary-${debateId}`, // ID único para el resumen
      debateId,                 // ID del debate asociado
      learningId: metadata.learningId || '',
      createdAt: new Date().toISOString(),
      debateName: metadata.debateName || 'Debate sin nombre',
      debateTopic: metadata.debateTopic || 'Tema sin especificar',
      summaryData               // Datos del resumen de Gemini
    };
    
    // Buscamos si ya existe un resumen para este debate
    const existingIndex = existingSummaries.findIndex(s => s.debateId === debateId);
    
    if (existingIndex >= 0) {
      // Actualizar resumen existente
      existingSummaries[existingIndex] = summaryWithMetadata;
      console.log(`Actualizando resumen existente para debate ${debateId}`);
    } else {
      // Agregar nuevo resumen
      existingSummaries.push(summaryWithMetadata);
      console.log(`Agregando nuevo resumen para debate ${debateId}`);
    }
    
    // Guardar en localStorage
    const result = setStorageItem(STORAGE_KEYS.DEBATE_SUMMARIES, existingSummaries);
    console.log(`Resumen de debate ${debateId} guardado correctamente:`, result);
    
    // Verificación adicional
    if (result) {
      const verificacion = hasDebateSummary(debateId);
      console.log(`Verificación después de guardar: ${verificacion ? 'Resumen encontrado' : 'Resumen NO encontrado'}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error al guardar resumen de debate:', error);
    return false;
  }
};

/**
 * Obtiene todos los resúmenes de debates guardados
 * @returns Array de resúmenes de debates con metadatos
 */
export const getAllDebateSummaries = (): DebateSummaryWithMetadata[] => {
  return getStorageItem<DebateSummaryWithMetadata[]>(STORAGE_KEYS.DEBATE_SUMMARIES, []);
};

/**
 * Obtiene un resumen de debate por su ID
 * @param debateId ID del debate
 * @returns Resumen del debate con metadatos o null si no existe
 */
export const getDebateSummaryByDebateId = (debateId: string): DebateSummaryWithMetadata | null => {
  const summaries = getAllDebateSummaries();
  return summaries.find(summary => summary.debateId === debateId) || null;
};

/**
 * Elimina un resumen de debate
 * @param debateId ID del debate
 * @returns boolean indicando si se eliminó correctamente
 */
export const deleteDebateSummary = (debateId: string): boolean => {
  try {
    const summaries = getAllDebateSummaries();
    const filteredSummaries = summaries.filter(summary => summary.debateId !== debateId);
    
    // Si no se eliminó ningún resumen
    if (filteredSummaries.length === summaries.length) {
      return false;
    }
    
    return setStorageItem(STORAGE_KEYS.DEBATE_SUMMARIES, filteredSummaries);
  } catch (error) {
    console.error('Error al eliminar resumen de debate:', error);
    return false;
  }
};

/**
 * Verifica si existe un resumen para un debate específico
 * @param debateId ID del debate
 * @returns boolean indicando si existe el resumen
 */
export const hasDebateSummary = (debateId: string): boolean => {
  return getDebateSummaryByDebateId(debateId) !== null;
};
