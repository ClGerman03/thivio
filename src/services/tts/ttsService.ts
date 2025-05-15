'use client';

/**
 * Servicio para Text-to-Speech utilizando Google Cloud TTS API
 * Este servicio maneja la conversión de texto a voz en Thivio
 */

// Los API endpoints de Google Cloud TTS
const TTS_API_ENDPOINT = '/api/tts'; // Endpoint de nuestra API Next.js

// Interfaz para las opciones de TTS
export interface TTSOptions {
  languageCode?: string;
  voiceName?: string;
  ssmlGender?: 'NEUTRAL' | 'MALE' | 'FEMALE';
  speakingRate?: number;
  pitch?: number;
}

/**
 * Reproduce texto como audio utilizando Google Cloud TTS
 * @param text Texto a reproducir
 * @param options Opciones de configuración para la voz
 * @returns Promesa que se resuelve cuando el audio termina de reproducirse
 */
export async function speakText(
  text: string, 
  options: TTSOptions = {}
): Promise<void> {
  try {
    if (!text || typeof window === 'undefined') return;

    // Usar valores por defecto si no se especifican
    const defaultOptions: TTSOptions = {
      languageCode: 'es-ES',
      ssmlGender: 'NEUTRAL',
      speakingRate: 1.0,
      pitch: 0,
      ...options
    };

    // Llamar al endpoint de nuestra API
    const response = await fetch(TTS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        ...defaultOptions
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en el servicio TTS: ${response.status} ${response.statusText}`);
    }

    // Obtener el audio como blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Crear y reproducir el elemento de audio
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); // Liberar recursos
        resolve();
      };
      
      audio.onerror = (err) => {
        URL.revokeObjectURL(audioUrl);
        reject(err);
      };
      
      audio.play().catch(reject);
    });
  } catch (error) {
    console.error('Error al reproducir texto con TTS:', error);
    throw error;
  }
}

/**
 * Detiene la reproducción de audio actual
 */
export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  
  // Detener todos los elementos de audio que están reproduciendo
  document.querySelectorAll('audio').forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

// Crear constante para exportación por defecto para evitar warning de ESLint
const ttsService = {
  speakText,
  stopSpeaking
};

export default ttsService;
