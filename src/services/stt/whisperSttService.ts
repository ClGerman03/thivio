'use client';

/**
 * Servicio para Speech-to-Text utilizando Whisper via Replicate
 * Whisper es un modelo de reconocimiento de voz de OpenAI
 */

// Endpoint para la API de Whisper STT
const STT_API_ENDPOINT = '/api/stt-whisper';

// Interfaz para las opciones de STT
export interface WhisperSTTOptions {
  language?: string; // Código de idioma (e.g. 'en', 'es')
  prompt?: string;   // Texto para ayudar al modelo a entender el contexto
}

// Interfaz para los resultados de la transcripción
export interface TranscriptionResult {
  text: string;           // Texto completo transcrito
  segments: Array<{       // Segmentos individuales de la transcripción
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  language: string;       // Idioma detectado
}

/**
 * Transcribe una grabación de audio a texto utilizando Whisper via Replicate
 * @param audioBlob Blob de audio para transcribir
 * @param options Opciones de configuración para la transcripción
 * @returns Promesa que se resuelve con el resultado de la transcripción
 */
export async function transcribeAudio(
  audioBlob: Blob,
  options: WhisperSTTOptions = {}
): Promise<TranscriptionResult> {
  try {
    if (!audioBlob || typeof window === 'undefined') {
      throw new Error('No hay audio para transcribir o no estamos en el navegador');
    }

    // Crear un FormData para enviar el archivo de audio
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    // Agregar opciones si existen
    if (options.language) {
      formData.append('language', options.language);
    }
    
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }

    // Llamar al endpoint de nuestra API
    const response = await fetch(STT_API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error en el servicio STT Whisper: ${response.status} ${response.statusText}`);
    }

    // Obtener el resultado como JSON
    const result: TranscriptionResult = await response.json();
    return result;
  } catch (error) {
    console.error('Error al transcribir audio con Whisper STT:', error);
    throw error;
  }
}

// Crear constante para exportación por defecto para evitar warning de ESLint
const whisperSttService = {
  transcribeAudio
};

export default whisperSttService;
