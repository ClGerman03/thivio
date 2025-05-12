/**
 * Servicio para gestionar el caché de contexto de Gemini
 * Permite almacenar documentos grandes en caché para reducir costos y mejorar rendimiento
 */

import { getFilesForLearning } from './fileStorageService';

// Duración por defecto del caché (en minutos)
const DEFAULT_CACHE_EXPIRATION_MINUTES = 60;

/**
 * Interfaz para el resultado de creación de caché
 */
interface ContextCacheResult {
  cacheId: string;
  expirationTime: string;
  contentSize: number;
}

/**
 * Interfaz para las opciones de configuración del caché
 */
interface ContextCacheOptions {
  expirationMinutes?: number;
}

/**
 * Crea un caché de contexto para los archivos asociados con un learning
 * @param learningId ID del learning cuyos archivos se almacenarán en caché
 * @param apiKey API key de Gemini
 * @param options Opciones de configuración del caché
 * @returns Información del caché creado o null si hubo un error
 */
export async function createContextCache(
  learningId: string,
  apiKey: string,
  options: ContextCacheOptions = {}
): Promise<ContextCacheResult | null> {
  try {
    // Obtener archivos almacenados para el learning
    const filesMetadata = await getFilesForLearning(learningId);
    
    if (!filesMetadata || filesMetadata.length === 0) {
      console.log('No hay archivos para almacenar en caché');
      return null;
    }
    
    // Configurar tiempo de expiración
    const expirationMinutes = options.expirationMinutes || DEFAULT_CACHE_EXPIRATION_MINUTES;
    const expirationTime = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();
    
    // Preparar cuerpo de la solicitud
    const formData = new FormData();
    
    // Obtener el contenido completo de los archivos
    const fileIds = filesMetadata.map(file => file.id);
    const filesWithContent = await import('./fileStorageService').then(module => module.getFilesWithContent(fileIds));
    
    // Agregar cada archivo al caché
    for (const file of filesWithContent) {
      // Crear un Blob con el contenido del archivo y su tipo MIME
      const blob = new Blob([file.content], { type: file.type || 'application/octet-stream' });
      // Agregar el archivo al FormData con un nombre único
      formData.append(`files`, blob, file.name);
    }
    
    // Construir URL para la API de Gemini Context Cache
    const url = `https://generativelanguage.googleapis.com/v1beta/contextCaches?key=${apiKey}`;
    
    // Configurar opciones de expiración
    const metadata = {
      expirationTime: expirationTime,
    };
    formData.append('metadata', JSON.stringify(metadata));
    
    // Realizar la solicitud para crear el caché
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear caché de contexto: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    return {
      cacheId: result.name,
      expirationTime: result.expirationTime,
      contentSize: result.contentSize || 0
    };
  } catch (error) {
    console.error('Error en createContextCache:', error);
    return null;
  }
}

/**
 * Actualiza el tiempo de expiración de un caché de contexto existente
 * @param cacheId ID del caché a actualizar
 * @param apiKey API key de Gemini
 * @param expirationMinutes Nuevos minutos hasta expiración (desde ahora)
 * @returns true si se actualizó correctamente, false en caso contrario
 */
export async function updateContextCacheExpiration(
  cacheId: string,
  apiKey: string,
  expirationMinutes = DEFAULT_CACHE_EXPIRATION_MINUTES
): Promise<boolean> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/${cacheId}?key=${apiKey}`;
    
    const expirationTime = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expirationTime: expirationTime
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al actualizar caché: ${response.status} - ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error en updateContextCacheExpiration:', error);
    return false;
  }
}

/**
 * Elimina un caché de contexto
 * @param cacheId ID del caché a eliminar
 * @param apiKey API key de Gemini
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export async function deleteContextCache(
  cacheId: string,
  apiKey: string
): Promise<boolean> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/${cacheId}?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al eliminar caché: ${response.status} - ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error en deleteContextCache:', error);
    return false;
  }
}
