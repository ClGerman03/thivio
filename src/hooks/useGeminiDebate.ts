'use client';

import { useState, useCallback, useEffect } from 'react';
import { generateGeminiResponse, mockGeminiResponse } from '@/services/geminiService';
import { getTurnsByCount } from '@/components/debate/session/controls/DebateTurnStructure';

// Tipo para mensaje de debate
export interface DebateMessage {
  id: string;
  speaker: 'user' | 'opponent';
  content: string;
  topic: string;
  turnType: string;
  timestamp: number;
}

// Tipo para la configuración del debate
interface DebateConfig {
  id?: string;
  topic: string;
  topics?: string[];
  debateFormat: string;
  turnCount: number;
  opponent: string;
  positions: Record<string, string>;
}

/**
 * Hook personalizado para manejar la interacción con Gemini AI en debates
 * 
 * @param debateConfig Configuración del debate
 * @returns Objeto con historial, estado y funciones para interactuar con Gemini
 */
export function useGeminiDebate(debateConfig: DebateConfig) {
  // Estado para el historial de mensajes
  const [history, setHistory] = useState<DebateMessage[]>([]);
  
  // Estados para la interacción con Gemini
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  // Cargar la API key desde env al montar el componente
  useEffect(() => {
    // Intentar obtener la API key
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    setApiKey(key);
    
    if (!key) {
      console.warn('No se encontró NEXT_PUBLIC_GEMINI_API_KEY en variables de entorno');
    }
  }, []);

  /**
   * Genera un ID único para mensajes
   */
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Obtiene el nombre completo del oponente basado en su ID
   */
  const getOpponentName = useCallback((opponentId: string): string => {
    const opponentMap: Record<string, string> = {
      'socrates': 'Socrates',
      'aristotle': 'Aristotle',
      'kant': 'Kant',
      'emily': 'Emily Carter',
      'marcus': 'Marcus Chen',
      'sophia': 'Sophia Martinez'
    };
    return opponentMap[opponentId] || 'AI';
  }, []);

  /**
   * Genera el input para Gemini basado en el estado actual del debate
   */
  const generateGeminiInput = useCallback((
    currentTopic: string,
    currentTurnType: string,
    currentTurnIndex: number
  ) => {
    // Filtrar historial para mostrar solo mensajes del tópico actual
    const topicHistory = history.filter(msg => msg.topic === currentTopic);
    
    return {
      debateConfig: {
        id: debateConfig.id || `debate-${Date.now()}`,
        format: debateConfig.debateFormat,
        turnStructure: getTurnsByCount(debateConfig.turnCount),
        totalTurns: debateConfig.turnCount,
        currentTurnIndex: currentTurnIndex,
        currentTurnType: currentTurnType
      },
      topic: {
        name: currentTopic,
        userPosition: debateConfig.positions[currentTopic] || ''
      },
      opponent: {
        id: debateConfig.opponent,
        name: getOpponentName(debateConfig.opponent)
      },
      context: {
        documents: [], // Se puede implementar después para incluir contenido de learning
        files: []
      },
      history: topicHistory.map(msg => ({
        speaker: msg.speaker,
        content: msg.content,
        topic: msg.topic,
        turnType: msg.turnType
      }))
    };
  }, [history, debateConfig, getOpponentName]);

  /**
   * Solicita una respuesta a Gemini 
   */
  const getAIResponse = useCallback(async (
    currentTopic: string,
    currentTurnType: string,
    currentTurnIndex: number,
    userMessage: string
  ): Promise<string> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Primero agregar el mensaje del usuario al historial
      const userMsg: DebateMessage = {
        id: generateMessageId(),
        speaker: 'user',
        content: userMessage,
        topic: currentTopic,
        turnType: currentTurnType,
        timestamp: Date.now()
      };
      
      setHistory(prev => [...prev, userMsg]);
      
      // Preparar input para Gemini
      const geminiInput = generateGeminiInput(
        currentTopic,
        currentTurnType,
        currentTurnIndex
      );
      
      console.log('Input para Gemini:', geminiInput);
      
      // Obtener respuesta: intentar con la API real o usar mock si no hay API key
      let response;
      if (apiKey) {
        response = await generateGeminiResponse(geminiInput, apiKey);
      } else {
        console.warn('Usando respuesta mock debido a falta de API key');
        response = await mockGeminiResponse(geminiInput);
      }
      
      // Agregar respuesta de la IA al historial
      const aiMsg: DebateMessage = {
        id: generateMessageId(),
        speaker: 'opponent',
        content: response,
        topic: currentTopic,
        turnType: currentTurnType,
        timestamp: Date.now()
      };
      
      setHistory(prev => [...prev, aiMsg]);
      
      return response;
    } catch (err: any) {
      const errorMessage = `Error al generar respuesta: ${err.message}`;
      console.error(errorMessage);
      setError(errorMessage);
      return '';
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, generateGeminiInput, generateMessageId]);

  // Exportar valores y funciones del hook
  return {
    history,
    isGenerating,
    error,
    getAIResponse,
    clearHistory: () => setHistory([])
  };
}

export default useGeminiDebate;
