'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { speakText, stopSpeaking, KokoroTTSOptions } from '@/services/tts/kokoroTtsService';

/**
 * Hook personalizado para manejar la funcionalidad de Kokoro Text-to-Speech
 * @returns Objeto con funciones y estado para interactuar con el servicio TTS
 */
export function useKokoroTTS() {
  // Estado para controlar si se está reproduciendo el audio
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  // Estado para controlar si hay un error
  const [error, setError] = useState<Error | null>(null);
  // Referencia al texto actual que se está reproduciendo
  const currentTextRef = useRef<string>('');

  // Función para reproducir texto como audio
  const speak = useCallback(async (
    text: string, 
    options: KokoroTTSOptions = {}
  ): Promise<void> => {
    try {
      // Si ya está hablando, detener primero
      if (isSpeaking) {
        stopSpeaking();
      }

      setError(null);
      currentTextRef.current = text;
      setIsSpeaking(true);

      await speakText(text, options);
      
      // Solo actualizar el estado si el texto no ha cambiado
      if (currentTextRef.current === text) {
        setIsSpeaking(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsSpeaking(false);
      console.error('Error al reproducir texto con Kokoro TTS:', err);
    }
  }, [isSpeaking]);

  // Función para detener la reproducción actual
  const cancel = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    currentTextRef.current = '';
  }, []);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    error
  };
}

export default useKokoroTTS;
