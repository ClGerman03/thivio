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
   * Opcionalmente, se puede incluir un mensaje de usuario adicional que aún no esté en el historial
   */
  // Definir un tipo para la estructura de turnos
  type TurnStructure = {
    turnType: string;
    turnIndex: number;
  };

  // Definir el tipo de retorno de generateGeminiInput para evitar 'any'
  type GeminiInputType = {
    debateConfig: {
      id: string;
      format: string;
      turnStructure: TurnStructure[];
      totalTurns: number;
      currentTurnIndex: number;
      currentTurnType: string;
    };
    topic: {
      name: string;
      userPosition: string;
    };
    opponent: {
      id: string;
      name: string;
    };
    context: {
      documents: unknown[];
      files: unknown[];
    };
    history: {
      speaker: 'user' | 'opponent';
      content: string;
      topic: string;
      turnType: string;
    }[];
  };

  const generateGeminiInput = useCallback<(
    currentTopic: string,
    currentTurnType: string,
    currentTurnIndex: number,
    additionalUserMessage?: DebateMessage
  ) => GeminiInputType>((
    currentTopic: string,
    currentTurnType: string,
    currentTurnIndex: number,
    additionalUserMessage?: DebateMessage
  ) => {
    // Filtrar historial para mostrar solo mensajes del tópico actual
    let topicHistory = history.filter(msg => msg.topic === currentTopic);
    
    // Si hay un mensaje adicional que aún no está en el historial, agregarlo
    if (additionalUserMessage && additionalUserMessage.topic === currentTopic) {
      topicHistory = [...topicHistory, additionalUserMessage];
    }
    
    return {
      debateConfig: {
        id: debateConfig.id || `debate-${Date.now()}`,
        format: debateConfig.debateFormat,
        // Aseguramos que turnStructure tenga el formato correcto
        turnStructure: (getTurnsByCount(debateConfig.turnCount) || []).map(turn => {
          // Si ya es un objeto con la estructura correcta, lo devolvemos tal cual
          if (typeof turn === 'object' && turn !== null && 'turnType' in turn && 'turnIndex' in turn) {
            return turn as TurnStructure;
          }
          // Si es un string u otro tipo, lo convertimos al formato esperado
          return {
            turnType: String(turn),
            turnIndex: currentTurnIndex
          };
        }),
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
        documents: [] as unknown[], // Se puede implementar después para incluir contenido de learning
        files: [] as unknown[]
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
      // Crear el mensaje del usuario
      const userMsg: DebateMessage = {
        id: generateMessageId(),
        speaker: 'user',
        content: userMessage,
        topic: currentTopic,
        turnType: currentTurnType,
        timestamp: Date.now()
      };
      
      // Preparar input para Gemini incluyendo el mensaje del usuario actual
      // incluso antes de actualizar el estado (history) para evitar problemas de timing
      const geminiInput = generateGeminiInput(
        currentTopic,
        currentTurnType,
        currentTurnIndex,
        userMsg
      );
      
      // Actualizar el historial con el mensaje del usuario
      setHistory(prev => [...prev, userMsg]);
      
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? `Error al generar respuesta: ${error.message}`
        : 'Error desconocido al generar respuesta';
      
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
