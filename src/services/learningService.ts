/**
 * Learning Service for Thivio
 * Handles operations related to user learnings with localStorage and IndexedDB
 */

import { setStorageItem, getStorageItem, STORAGE_KEYS } from './storageService';
import { storeFile, deleteFilesForLearning, getFilesForLearning, StoredFile } from './fileStorageService';

/**
 * Learning Content interface para representar el contenido de aprendizaje
 */
export interface LearningContent {
  text?: string;            // Texto ingresado por el usuario
  fileIds?: string[];      // IDs de archivos almacenados en IndexedDB
  fileNames?: string[];    // Nombres de archivos (para compatibilidad con versiones anteriores)
}

/**
 * Learning interface - modelo principal de datos de aprendizaje
 */
export interface Learning {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: 'analyzed' | 'processing' | 'pending';
  content?: LearningContent; // Contenido asociado al learning
}

/**
 * Get all user learnings from localStorage
 * @returns Array of Learning objects
 */
export const getAllLearnings = (): Learning[] => {
  return getStorageItem<Learning[]>(STORAGE_KEYS.USER_LEARNINGS, []);
};

/**
 * Get a specific learning by ID
 * @param id Learning ID
 * @returns Learning object or null if not found
 */
export const getLearningById = (id: string): Learning | null => {
  const learnings = getAllLearnings();
  return learnings.find(learning => learning.id === id) || null;
};

/**
 * Save a new learning or update an existing one
 * @param learning Learning object
 * @returns boolean indicating success
 */
export const saveLearning = (learning: Learning): boolean => {
  const learnings = getAllLearnings();
  const existingIndex = learnings.findIndex(l => l.id === learning.id);
  
  // Asegurar que siempre hay un campo content aunque esté vacío
  const learningToSave = {
    ...learning,
    content: learning.content || {},
    updatedAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    // Update existing learning
    learnings[existingIndex] = learningToSave;
  } else {
    // Add new learning
    learnings.push({
      ...learningToSave,
      createdAt: new Date().toISOString()
    });
  }
  
  return setStorageItem(STORAGE_KEYS.USER_LEARNINGS, learnings);
};

/**
 * Delete a learning by ID
 * @param id Learning ID
 * @returns boolean indicating success
 */
export const deleteLearning = async (id: string): Promise<boolean> => {
  const learnings = getAllLearnings();
  const filteredLearnings = learnings.filter(learning => learning.id !== id);
  
  if (filteredLearnings.length === learnings.length) {
    // No learning was removed
    return false;
  }
  
  // Limpiar archivos relacionados en IndexedDB
  try {
    await deleteFilesForLearning(id);
  } catch (error) {
    console.warn('Error al limpiar archivos relacionados:', error);
  }
  
  // Limpiar también datos antiguos del localStorage
  try {
    localStorage.removeItem(`doc_title_${id}`);
    localStorage.removeItem(`doc_subtitle_${id}`);
    localStorage.removeItem(`doc_text_${id}`);
    localStorage.removeItem(`doc_file_${id}`);
  } catch (error) {
    console.warn('Error al limpiar datos antiguos del localStorage:', error);
  }
  
  return setStorageItem(STORAGE_KEYS.USER_LEARNINGS, filteredLearnings);
};

/**
 * Create a new learning with basic information
 * @param id The ID of the learning (usually from URL)
 * @param title Initial title of the learning
 * @param initialContent Contenido inicial opcional
 * @returns The created Learning object
 */
export const createLearning = (
  id: string, 
  title: string = 'New Learning', 
  initialContent?: LearningContent
): Learning => {
  // Verificar si ya existe un learning con este ID
  const existingLearning = getLearningById(id);
  if (existingLearning) {
    // Si existe, actualizamos los datos necesarios
    let needsUpdate = false;
    
    if (existingLearning.title !== title) {
      existingLearning.title = title;
      needsUpdate = true;
    }
    
    // Si se proporcionó contenido inicial y el learning no tenía contenido
    if (initialContent && (!existingLearning.content || 
        (!existingLearning.content.text && initialContent.text) || 
        (!existingLearning.content.fileNames && initialContent.fileNames))) {
      existingLearning.content = {
        ...existingLearning.content,
        ...initialContent
      };
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      existingLearning.updatedAt = new Date().toISOString();
      saveLearning(existingLearning);
    }
    
    return existingLearning;
  }
  
  // Si no existe, crear uno nuevo
  const newLearning: Learning = {
    id,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending',
    content: initialContent || {}
  };
  
  // Guardamos el nuevo learning
  saveLearning(newLearning);
  
  return newLearning;
};

/**
 * Actualiza el contenido de un learning
 * @param id ID del learning
 * @param content Objeto con el contenido a actualizar
 * @returns El learning actualizado o null si no se encontró
 */
export const updateLearningContent = (id: string, content: Partial<LearningContent>): Learning | null => {
  const learning = getLearningById(id);
  if (!learning) return null;
  
  // Combinar el contenido existente con el nuevo
  const updatedContent: LearningContent = {
    ...learning.content,
    ...content
  };
  
  // Actualizar el learning con el contenido combinado
  const updatedLearning: Learning = {
    ...learning,
    content: updatedContent,
    status: 'processing', // Cambiar estado a procesando al actualizar contenido
    updatedAt: new Date().toISOString()
  };
  
  // Guardar el learning actualizado
  saveLearning(updatedLearning);
  
  return updatedLearning;
};

/**
 * Guarda un archivo en el almacenamiento y actualiza el learning con su referencia
 * @param learningId ID del learning al que pertenece el archivo
 * @param file Archivo a guardar
 * @returns El learning actualizado con la referencia al archivo
 */
export const addFileToLearning = async (learningId: string, file: File): Promise<Learning | null> => {
  try {
    const learning = getLearningById(learningId);
    if (!learning) return null;
    
    // Guardar el archivo en IndexedDB
    const storedFile = await storeFile(file, learningId);
    
    // Obtener los fileIds existentes o inicializar array vacío
    const existingFileIds = learning.content?.fileIds || [];
    
    // Obtener los fileNames existentes o inicializar array vacío (para compatibilidad)
    const existingFileNames = learning.content?.fileNames || [];
    
    // Actualizar el contenido del learning
    return updateLearningContent(learningId, {
      fileIds: [...existingFileIds, storedFile.id],
      fileNames: [...existingFileNames, storedFile.name]
    });
  } catch (error) {
    console.error('Error al añadir archivo al learning:', error);
    return null;
  }
};

/**
 * Agrega múltiples archivos al learning
 * @param learningId ID del learning
 * @param files Lista de archivos a agregar
 * @returns El learning actualizado con las referencias a los archivos
 */
export const addFilesToLearning = async (learningId: string, files: File[]): Promise<Learning | null> => {
  try {
    let currentLearning = getLearningById(learningId);
    if (!currentLearning) return null;
    
    // Procesar cada archivo secuencialmente para evitar problemas de concurrencia
    for (const file of files) {
      currentLearning = await addFileToLearning(learningId, file);
      if (!currentLearning) throw new Error('Error al procesar archivos');
    }
    
    return currentLearning;
  } catch (error) {
    console.error('Error al añadir múltiples archivos:', error);
    return null;
  }
};

/**
 * Obtiene los metadatos de los archivos asociados a un learning
 * @param learningId ID del learning
 * @returns Promesa que resuelve a un array de metadatos de archivos
 */
export const getLearningFiles = async (learningId: string): Promise<Array<Omit<StoredFile, 'content'>>> => {
  try {
    return await getFilesForLearning(learningId);
  } catch (error) {
    console.error('Error al obtener archivos del learning:', error);
    return [];
  }
};

/**
 * Marca un learning como analizado
 * @param id ID del learning
 * @returns El learning actualizado o null si no se encontró
 */
export const markLearningAsAnalyzed = (id: string): Learning | null => {
  const learning = getLearningById(id);
  if (!learning) return null;
  
  const updatedLearning: Learning = {
    ...learning,
    status: 'analyzed',
    updatedAt: new Date().toISOString()
  };
  
  saveLearning(updatedLearning);
  
  return updatedLearning;
};

/**
 * Migra los datos antiguos de localStorage al nuevo formato
 * @param id ID del learning
 * @returns El learning actualizado o null si no se pudo migrar
 */
export const migrateLegacyData = (id: string): Learning | null => {
  // Intentar obtener el learning existente
  const learning = getLearningById(id);
  
  // Verificar si ya tiene contenido
  if (learning && learning.content && 
      (learning.content.text || (learning.content.fileNames && learning.content.fileNames.length > 0))) {
    return learning; // Ya está migrado
  }
  
  // Recuperar datos antiguos
  const savedTitle = localStorage.getItem(`doc_title_${id}`);
  const savedText = localStorage.getItem(`doc_text_${id}`);
  const savedFileName = localStorage.getItem(`doc_file_${id}`);
  
  // Preparar contenido
  const content: LearningContent = {};
  if (savedText) content.text = savedText;
  if (savedFileName) content.fileNames = [savedFileName];
  
  if (!learning && !savedTitle && !savedText && !savedFileName) {
    return null; // No hay datos para migrar
  }
  
  // Si existe el learning, actualizamos su contenido
  if (learning) {
    return updateLearningContent(id, content);
  }
  
  // Si no existe pero hay datos, creamos uno nuevo
  return createLearning(id, savedTitle || 'Migrated Learning', content);
};
