'use client';

import { useState, useCallback, useRef } from 'react';
import { transcribeAudio, WhisperSTTOptions, TranscriptionResult } from '@/services/stt/whisperSttService';

/**
 * Hook personalizado para manejar la funcionalidad de grabación de audio y transcripción con Whisper
 * @returns Objeto con funciones y estado para interactuar con el servicio STT
 */
export function useWhisperSTT() {
  // Estado para controlar si está grabando
  const [isRecording, setIsRecording] = useState<boolean>(false);
  // Estado para controlar si está transcribiendo
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  // Estado para almacenar el resultado de la transcripción
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  // Estado para controlar errores
  const [error, setError] = useState<Error | null>(null);
  // Estado para almacenar logs del proceso de Whisper
  const [whisperLogs, setWhisperLogs] = useState<string[]>([]);

  // Referencias para manejar la grabación
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  /**
   * Transcribe un blob de audio usando el servicio Whisper
   * @param audioBlob Blob de audio para transcribir
   * @param options Opciones de configuración para la transcripción
   */
  const transcribeAudioBlob = useCallback(async (
    audioBlob: Blob,
    options: WhisperSTTOptions = {}
  ): Promise<TranscriptionResult | null> => {
    try {
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('No hay audio para transcribir');
      }

      setIsTranscribing(true);
      setError(null);
      
      const logMessage = `Transcribiendo audio de ${audioBlob.size} bytes`;
      console.log(logMessage);
      setWhisperLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${logMessage}`]);
      
      // Usar el servicio de transcripción
      const result = await transcribeAudio(audioBlob, options);
      
      setTranscription(result);
      const completedMsg = `Transcripción completada: "${result.text}"`;
      console.log(completedMsg);
      setWhisperLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${completedMsg}`]);
      
      // Añadir información sobre segmentos si existen
      if (result.segments && result.segments.length > 0) {
        const segmentsLog = `Segmentos detectados: ${result.segments.length}, Idioma: ${result.language || 'no especificado'}`;
        console.log(segmentsLog);
        setWhisperLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${segmentsLog}`]);
      }
      
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      const errorMsg = `Error al transcribir audio: ${errorObj.message}`;
      console.error(errorMsg);
      setWhisperLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ❌ ${errorMsg}`]);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  /**
   * Detiene la grabación y, opcionalmente, transcribe el audio
   * @param transcribeAfterStop Si es true, transcribe automáticamente después de detener
   * @param options Opciones para la transcripción
   */
  const stopRecording = useCallback(async (
    transcribeAfterStop: boolean = false,
    options: WhisperSTTOptions = {}
  ) => {
    return new Promise<Blob | null>((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      // Configurar el evento para cuando termine la grabación
      mediaRecorderRef.current.onstop = async () => {
        // Detener todas las pistas de audio (liberar el micrófono)
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        
        // Crear el blob de audio con todos los chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        setIsRecording(false);
        const stopMsg = `Grabación detenida, tamaño: ${audioBlob.size} bytes`;
        console.log(stopMsg);
        setWhisperLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${stopMsg}`]);
        
        // Si se solicita transcripción automática
        if (transcribeAfterStop && audioBlob.size > 0) {
          await transcribeAudioBlob(audioBlob, options);
        }
        
        resolve(audioBlob);
      };

      // Detener la grabación
      mediaRecorderRef.current.stop();
    });
  }, [transcribeAudioBlob]); // Incluir transcribeAudioBlob como dependencia

  /**
   * Inicia la grabación de audio
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      
      // Solicitar permisos para el micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configurar el MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Configurar el evento para capturar los chunks de audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Iniciar la grabación
      mediaRecorder.start();
      setIsRecording(true);
      
      const startMsg = 'Grabación iniciada';
      console.log(startMsg);
      setWhisperLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${startMsg}`]);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      const errorMsg = `Error al iniciar la grabación: ${errorObj.message}`;
      console.error(errorMsg);
      setWhisperLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ❌ ${errorMsg}`]);
    }
  }, []);

  /**
   * Limpia la transcripción actual
   */
  const clearTranscription = useCallback(() => {
    setTranscription(null);
  }, []);

  /**
   * Limpia los logs de Whisper
   */
  const clearWhisperLogs = useCallback(() => {
    setWhisperLogs([]);
  }, []);

  return {
    // Estados
    isRecording,
    isTranscribing,
    transcription,
    error,
    whisperLogs,
    
    // Acciones
    startRecording,
    stopRecording,
    transcribeAudioBlob,
    clearTranscription,
    clearWhisperLogs
  };
}

export default useWhisperSTT;
