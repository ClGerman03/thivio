'use client';

/**
 * Servicio para Text-to-Speech utilizando Kokoro via Replicate
 * Kokoro es un modelo TTS de código abierto con 82 millones de parámetros
 */

// Endpoint para la API de Kokoro TTS
const TTS_API_ENDPOINT = '/api/tts-kokoro';

// Enum de voces disponibles en Kokoro
export enum KokoroVoice {
  // Voces femeninas americanas (af_)
  FEMALE_ALLOY = 'af_alloy',
  FEMALE_AOEDE = 'af_aoede',
  FEMALE_BELLA = 'af_bella',
  FEMALE_JESSICA = 'af_jessica',
  FEMALE_KORE = 'af_kore',
  FEMALE_NICOLE = 'af_nicole',
  FEMALE_NOVA = 'af_nova', 
  FEMALE_RIVER = 'af_river',
  FEMALE_SARAH = 'af_sarah',
  FEMALE_SKY = 'af_sky',
  
  // Voces masculinas americanas (am_)
  MALE_ADAM = 'am_adam',
  MALE_ECHO = 'am_echo',
  MALE_ERIC = 'am_eric',
  MALE_FENRIR = 'am_fenrir',
  MALE_LIAM = 'am_liam',
  MALE_MICHAEL = 'am_michael',
  MALE_ONYX = 'am_onyx',
  MALE_PUCK = 'am_puck',
  
  // Otras voces (británicas, italianas, etc.)
  FEMALE_ALICE_BRITISH = 'bf_alice',
  FEMALE_EMMA_BRITISH = 'bf_emma',
  FEMALE_SARA_ITALIAN = 'if_sara',
  MALE_NICOLA_ITALIAN = 'im_nicola'
}

// Interfaz para las opciones de TTS
export interface KokoroTTSOptions {
  voice?: string | KokoroVoice; // Voice ID to use
  speed?: number; // Velocidad de habla (0.5 = half speed, 2.0 = double speed)
}

/**
 * Reproduce texto como audio utilizando Kokoro TTS via Replicate
 * @param text Texto a reproducir
 * @param options Opciones de configuración para la voz
 * @returns Promesa que se resuelve cuando el audio termina de reproducirse
 */
export async function speakText(
  text: string,
  options: KokoroTTSOptions = {}
): Promise<void> {
  try {
    if (!text || typeof window === 'undefined') return;

    // Usar valores por defecto si no se especifican
    const defaultOptions: KokoroTTSOptions = {
      speed: 1.0,
      voice: KokoroVoice.MALE_MICHAEL, // Voz masculina en inglés americano
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
      throw new Error(`Error en el servicio TTS Kokoro: ${response.status} ${response.statusText}`);
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
    console.error('Error al reproducir texto con Kokoro TTS:', error);
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
const kokoroTtsService = {
  speakText,
  stopSpeaking
};

export default kokoroTtsService;
