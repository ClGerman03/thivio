'use client';

import { useState, useCallback, useEffect } from 'react';
import { generateGeminiResponse, mockGeminiResponse } from '@/services/gemini';
import { getTurnsByCount } from '@/components/debate/session/controls/DebateTurnStructure';
// import { createContextCache } from '@/services/geminiCacheService';
import { getLearningById } from '@/services/learningService';
import { getFilesWithContent } from '@/services/fileStorageService';

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
  learningId?: string; // ID del learning asociado al debate para recuperar archivos
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
  
  // Estado para el caché de contexto (deshabilitado temporalmente)
  // const [contextCacheId, setContextCacheId] = useState<string | null>(null);
  // const [isCreatingCache, setIsCreatingCache] = useState<boolean>(false);
  // const [isCacheReady, setIsCacheReady] = useState<boolean>(false);
  
  // Estado para almacenar el contexto del learning
  const [learningContext, setLearningContext] = useState<{
    text: string | null;
    files: Array<{id: string; name: string; type: string; content: string}>
  }>({ text: null, files: [] });
  const [isLoadingContext, setIsLoadingContext] = useState<boolean>(false);
  const [isContextReady, setIsContextReady] = useState<boolean>(false);
  
  // Solo mostrar el log en modo de desarrollo y solo cuando sea necesario
  useEffect(() => {
    // Mostrar el log solo una vez al inicializar
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] useGeminiDebate inicializado con learningId: ${debateConfig.learningId} (id=${debateConfig.id})`);
    }
  }, [debateConfig.learningId, debateConfig.id]); // Solo se ejecuta si cambia el learningId o id

  // Cargar la API key desde env al montar el componente
  useEffect(() => {
    // Intentar obtener la API key
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    setApiKey(key);
    
    if (!key) {
      console.warn('No se encontró NEXT_PUBLIC_GEMINI_API_KEY en variables de entorno');
    }
  }, []);
  
  // Cargar el contexto del learning (texto y archivos)
  useEffect(() => {
    async function loadLearningContext() {
      if (!debateConfig.learningId) {
        // Si no hay learningId, marcamos el contexto como listo pero vacío
        console.log('No hay learningId, no se cargará contexto');
        setIsContextReady(true);
        return;
      }
      
      setIsLoadingContext(true);
      setIsContextReady(false);
      
      try {
        // Cargar datos del learning
        console.log(`Cargando contexto para learningId: ${debateConfig.learningId}`);
        const learning = getLearningById(debateConfig.learningId);
        
        if (!learning) {
          console.warn(`No se encontró learning con ID: ${debateConfig.learningId}`);
          setIsContextReady(true);
          setIsLoadingContext(false);
          return;
        }
        
        let contextText = null;
        
        if (learning?.content?.text) {
          console.log(`Contexto de texto encontrado: ${learning.content.text.substring(0, 50)}...`);
          contextText = learning.content.text;
        } else {
          console.log('No se encontró texto en el learning');
        }
        
        // Cargar archivos si hay fileIds disponibles
        let contextFiles: Array<{id: string; name: string; type: string; content: string}> = [];
        
        if (learning?.content?.fileIds && learning.content.fileIds.length > 0) {
          console.log(`Cargando ${learning.content.fileIds.length} archivos para contexto: ${JSON.stringify(learning.content.fileIds)}`);
          
          try {
            const files = await getFilesWithContent(learning.content.fileIds);
            contextFiles = files.map(file => ({
              id: file.id,
              name: file.name,
              type: file.type,
              content: file.content
            }));
            console.log(`${contextFiles.length} archivos cargados con contexto: ${contextFiles.map(f => f.name).join(', ')}`);
          } catch (fileError) {
            console.error('Error cargando archivos:', fileError);
          }
        } else if (learning?.content?.fileNames && learning.content.fileNames.length > 0) {
          // Si no tenemos fileIds pero tenemos fileNames (compatibilidad)
          console.log('Solo tenemos fileNames, no fileIds (modo de compatibilidad)');
        }
        
        const newContext = {
          text: contextText,
          files: contextFiles
        };
        
        console.log('Contexto cargado exitosamente:', {
          hasText: !!newContext.text,
          filesCount: newContext.files.length,
          fileNames: newContext.files.map(f => f.name)
        });
        
        setLearningContext(newContext);
      } catch (error) {
        console.error('Error al cargar el contexto del learning:', error);
      } finally {
        setIsLoadingContext(false);
        setIsContextReady(true);
      }
    }
    
    loadLearningContext();
  }, [debateConfig.learningId]);

  // Deshabilitamos temporalmente la creación de caché de contexto debido a problemas de CORS
  useEffect(() => {
    // Marcar siempre como listo para no bloquear el flujo
    // setIsCacheReady(true); // Comentado para resolver error de lint
    
    if (debateConfig.learningId && apiKey) {
      console.log(`Omitiendo creación de caché para learning: ${debateConfig.learningId} - usando contexto directo`);
    }
  }, [debateConfig.learningId, apiKey]);

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
        // Incluir texto del learning como documento si existe
        documents: learningContext.text ? [
          {
            text: learningContext.text,
            title: 'Learning Content'
          }
        ] : [],
        // Incluir archivos del learning si existen
        files: learningContext.files.map(file => ({
          name: file.name,
          mimeType: file.type,
          content: file.content,
          fileId: file.id
        })),
        // Nota: Temporalmente deshabilitada la funcionalidad de caché
      },
      history: topicHistory.map(msg => ({
        speaker: msg.speaker,
        content: msg.content,
        topic: msg.topic,
        turnType: msg.turnType
      }))
    };
  }, [history, debateConfig, getOpponentName, learningContext]);

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
      // Omitimos la espera del caché ya que está deshabilitado temporalmente
      // La función marcará isCacheReady como true inmediatamente
      
      // Esperar a que el contexto esté listo
      if (!isContextReady) {
        console.log('Esperando a que el contexto del learning esté cargado...');
        const maxContextWaitTime = 5000; // 5 segundos máximo de espera
        const startTime = Date.now();
        
        while (!isContextReady && (Date.now() - startTime < maxContextWaitTime)) {
          // Esperar 100ms antes de verificar nuevamente
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!isContextReady) {
          console.warn('Tiempo de espera agotado para la carga del contexto, continuando sin él');
        }
      }
      
      // Crear el mensaje del usuario
      const userMsg: DebateMessage = {
        id: generateMessageId(),
        speaker: 'user',
        content: userMessage,
        topic: currentTopic,
        turnType: currentTurnType,
        timestamp: Date.now()
      };
      
      // Verificar que el contexto está listo y disponible
      if (!isContextReady || isLoadingContext) {
        console.log('Atención: El contexto aún no está completamente cargado. Esperando...');
        // Esperar explícitamente a que el contexto esté listo
        const maxWaitTime = 2000; // 2 segundos máximo
        const startWaitTime = Date.now();
        while (!isContextReady || isLoadingContext) {
          // Esperar 50ms y verificar de nuevo
          await new Promise(resolve => setTimeout(resolve, 50));
          // Evitar espera infinita
          if (Date.now() - startWaitTime > maxWaitTime) {
            console.warn('Tiempo de espera agotado para la carga del contexto');
            break;
          }
        }
      }
      
      // Preparar input para Gemini incluyendo el mensaje del usuario actual
      const geminiInput = generateGeminiInput(
        currentTopic,
        currentTurnType,
        currentTurnIndex,
        userMsg
      );
      
      // Actualizar el historial con el mensaje del usuario
      setHistory(prev => [...prev, userMsg]);
      
      // Validación adicional del contexto (diagnóstico)
      console.log('Estado del contexto antes de enviar:', {
        isContextReady,
        learningTextLength: learningContext.text ? learningContext.text.length : 0,
        filesCount: learningContext.files.length,
        fileNames: learningContext.files.map(f => f.name)
      });
      
      // Log detallado del contexto que se enviará
      console.log('Input para Gemini:', geminiInput);
      // Logs mejorados para diagnóstico
      console.log('Contexto enviado a Gemini:', {
        documentCount: geminiInput.context.documents ? geminiInput.context.documents.length : 0,
        fileCount: geminiInput.context.files ? geminiInput.context.files.length : 0,
        hasCache: 'contextCacheId' in geminiInput.context ? !!geminiInput.context.contextCacheId : false,
        fileNames: geminiInput.context.files && geminiInput.context.files.length > 0 
          ? Array.from(geminiInput.context.files).map(file => {
              const fileObj = file as {name?: string};
              return fileObj.name || 'archivo sin nombre';
            }).join(', ') 
          : 'No hay archivos',
        documentText: geminiInput.context.documents && geminiInput.context.documents.length > 0 
          ? typeof geminiInput.context.documents[0] === 'object' && geminiInput.context.documents[0] !== null && 'text' in geminiInput.context.documents[0]
            ? String(geminiInput.context.documents[0].text).substring(0, 50) + '...' 
            : 'Formato de documento inválido'
          : 'No hay documentos'
      });
      
      console.log('Usando contexto directo (caché deshabilitado temporalmente)');
      
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
  }, [apiKey, generateGeminiInput, generateMessageId, isContextReady, isLoadingContext, learningContext.files, learningContext.text]);

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
