'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
// Importaciones de popups eliminadas temporalmente
import { DebateProvider } from '@/context/DebateContext';
import { useDebateState } from '@/hooks/useDebateState';
import { useDebateInterventions } from '@/hooks/useDebateInterventions';
import { useDebateSummary } from '@/hooks/useDebateSummary';
import { useGeminiDebate, DebateMessage } from '@/hooks/useGeminiDebate';
// Cambiamos a Kokoro TTS en lugar de Google Cloud TTS
import { useKokoroTTS } from '@/hooks/useKokoroTTS';

// Importar componentes UI
import SpeakerVisualization from './ui/SpeakerVisualization';
import DebateInfo from './ui/DebateInfo';
import DebateControlsArea from './ui/DebateControlsArea';
import DebateTurnArea from './ui/DebateTurnArea';

// Constante para modo de prueba con texto (simplificado)
const TEXT_MODE_ENABLED = false; // Cambiar a false para usar el modo de voz

// Types imported from context

type DebateSessionProps = {
  debateConfig: {
    id?: string; // ID único del debate
    topic: string;
    topics?: string[];
    debateFormat: string;
    turnCount: number;
    opponent: string;
    positions: Record<string, string>;
    learningId?: string; // ID del learning asociado para usar como contexto
  };
  onDebateEnd: (debateHistory?: DebateMessage[]) => void; // Modificado para aceptar el historial
  onConfigClick?: () => void; // Nueva función para volver a la configuración
};

export default function DebateSession({ debateConfig, onDebateEnd, onConfigClick }: DebateSessionProps) {
  // Use our custom hooks to manage state and logic
  const debateState = useDebateState(debateConfig);
  
  // Hook para Kokoro TTS
  const { speak, cancel, isSpeaking } = useKokoroTTS();
  
  // Estado del mensaje del usuario actual (modo texto)
  const [userMessage, setUserMessage] = useState<string>('');
  
  // Asegurarnos de que tenemos toda la configuración necesaria para el debate
  // Usamos useMemo para evitar recrear este objeto en cada renderizado
  const completeDebateConfig = useMemo(() => {
    console.log('DebateSession configuración inicializada con learningId:', debateConfig.learningId);
    return {
      ...debateConfig,
      // Asegurarnos de que ID sea único, pero que no cambie en cada renderizado
      id: debateConfig.id || `debate-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      // Convertir topic a array de topics si no existe
      topics: debateConfig.topics || [debateConfig.topic],
    };
  }, [debateConfig]); // Solo se recrea si debateConfig cambia
  
  // Estado para controlar el modo de entrada del usuario (texto o voz)
  const [userInputMode, setUserInputMode] = useState<'text' | 'voice'>('text');
  
  // Función para alternar entre modos de entrada
  const toggleInputMode = useCallback(() => {
    setUserInputMode(prev => prev === 'text' ? 'voice' : 'text');
  }, []);
  
  // Extract state for easier access in this component
  const {
    activeSpeaker,
    isAISpeaking,
    isAIThinking,
    isRecording,
    hasRecordedContent,
    currentTopic,
    currentTopicIndex,
    currentTurnIndex,
    currentTurnName,
    handleToggleMicrophone,
    handleTurnChange,
    opponentName,
    nextTurn,
    setIsAIThinking,
    setIsAISpeaking,
    setHasRecordedContent
  } = debateState;
  
  // Estado para mensajes generados por Gemini
  const {
    history,
    isGenerating,
    // error: geminiError, // No utilizado
    getAIResponse
    // clearHistory      // No utilizado
  } = useGeminiDebate(completeDebateConfig);
  
  // Interventions and messaging (mantenemos temporalmente para compatibilidad)
  const { 
    // interventions,     // No utilizado actualmente
    // showTurnPopup,    // No utilizado
    // turnPopupText,    // No utilizado
    // closePopup,       // No utilizado en el contexto actual
    discardUserIntervention,
    // sendUserIntervention: originalSendUserIntervention, // No utilizado
    setTurnPopupText,
    setShowTurnPopup
  } = useDebateInterventions(debateState, debateConfig);
  
  // Efecto para reproducir respuestas de IA por voz si no estamos en modo texto
  useEffect(() => {
    // Buscamos la última respuesta de la IA
    if (history.length > 0 && !TEXT_MODE_ENABLED && activeSpeaker === 'ai') {
      const lastMessage = history[history.length - 1];
      
      // Si es un mensaje del oponente, reproducir con TTS
      if (lastMessage?.speaker === 'opponent' && lastMessage.content) {
        console.log('Reproduciendo respuesta AI con Kokoro TTS:', lastMessage.content.substring(0, 50) + '...');
        speak(lastMessage.content, {
          voice: 'am_michael', // Voz masculina (opciones: af_bella, am_adam, am_michael, af_nicole, etc.)
          speed: 1.0 // Velocidad normal
        });
      }
    }
    
    // Cancelar TTS cuando cambiamos de hablante o si activamos modo texto
    if ((activeSpeaker !== 'ai' || TEXT_MODE_ENABLED) && isSpeaking) {
      cancel();
    }
  }, [history, activeSpeaker, speak, cancel, isSpeaking]);
  
  // Efecto para actualizar isAISpeaking basado en TTS
  useEffect(() => {
    if (!TEXT_MODE_ENABLED) {
      setIsAISpeaking(isSpeaking);
    }
  }, [isSpeaking, setIsAISpeaking]);
  
  // Utilizamos el hook reimplementado para generar el resumen textual
  const { generateTextSummary } = useDebateSummary(
    debateConfig,
    // Pasamos el historial actual de mensajes del debate
    history
  );
  
  // Estado para controlar el cambio de turno - Popups eliminados temporalmente

  // Handler para enviar mensaje del usuario a Gemini
  const sendUserIntervention = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Guardar mensaje del usuario
    setUserMessage(content);
    setHasRecordedContent(false);
    
    // Cambiar el turno a la IA
    handleTurnChange('ai');
    setIsAIThinking(true);
    
    try {
      // No mostramos popups para la AI - eliminados temporalmente
      console.log(`${opponentName} está pensando sobre "${currentTopic}"...`);
      
      console.log(`Enviando mensaje a Gemini: "${content}" sobre ${currentTopic} en turno ${currentTurnName}`);
      
      // Obtener respuesta de Gemini
      const response = await getAIResponse(
        currentTopic,
        currentTurnName,
        currentTurnIndex,
        content
      );
      
      console.log(`Respuesta de Gemini: "${response.substring(0, 100)}..."`);
      
      // La IA comienza a "hablar"
      setIsAIThinking(false);
      setIsAISpeaking(true);
      
      // Limpiar el mensaje del usuario para el siguiente turno
      if (TEXT_MODE_ENABLED) {
        setUserMessage('');
      }
      
      // Esperar un tiempo para simular que la IA está hablando
      // Tiempo proporcional a la longitud de la respuesta
      const speakingTime = TEXT_MODE_ENABLED ? 500 : Math.min(Math.max(response.length * 15, 2000), 5000);
      
      setTimeout(() => {
        // La IA termina de hablar
        setIsAISpeaking(false);
        
        // En ningún modo cambiamos automáticamente al usuario
        // El usuario siempre debe usar el botón "Tomar turno" cuando esté listo
        console.log(`La IA ha terminado de responder. Puedes tomar el turno cuando estés listo.`);
        
        // Opcionalmente mostrar un mensaje indicativo para el usuario
        const popupText = `${opponentName} ha terminado. Cuando estés listo, presiona "Tomar turno" para continuar con "${currentTopic}" - ${currentTurnName}`;
        setTurnPopupText(popupText);
        setShowTurnPopup(true);
        
        // Cerramos automáticamente el popup después de unos segundos
        setTimeout(() => {
          setShowTurnPopup(false);
        }, 5000);
      }, speakingTime);
      
    } catch (error) {
      console.error('Error al obtener respuesta de Gemini:', error);
      setIsAIThinking(false);
      setIsAISpeaking(false);
      handleTurnChange('user');
      
      // Limpiar el mensaje del usuario para el siguiente intento
      if (TEXT_MODE_ENABLED) {
        setUserMessage('');
      }
      
      // Mostrar mensaje de error en consola
      console.error(`Hubo un error al obtener respuesta de Gemini. Por favor intenta de nuevo.`);
    }
  }, [currentTopic, currentTurnName, currentTurnIndex, getAIResponse, handleTurnChange, 
      opponentName, setIsAIThinking, setIsAISpeaking, setHasRecordedContent,
      /* nextTurn y closePopup omitidos porque no se usan dentro de esta función callback */
      setTurnPopupText, setShowTurnPopup]);
  
  // Topic selection handler
  const handleTopicSelect = (topic: string, index: number) => {
    debateState.selectTopic(index);
  };

  // Create the value for the context provider
  // Convertimos explícitamente los tipos para que coincidan con DebateContextType
  const contextValue = {
    ...debateState,
    // Convertir tipos explícitamente
    activeSpeaker: debateState.activeSpeaker,
    setActiveSpeaker: (speaker: string | null) => {
      // Conversión segura a 'user' | 'ai' | null
      if (speaker === 'user' || speaker === 'ai' || speaker === null) {
        debateState.setActiveSpeaker(speaker);
      }
    }
  };
  
  return (
    <DebateProvider value={contextValue}>
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 py-2">
        <div className="flex flex-col space-y-5">
          <div className="flex flex-col items-center">
            {/* Speaker visualization component */}
            <SpeakerVisualization
              activeSpeaker={activeSpeaker}
              isAISpeaking={isAISpeaking}
              isAIThinking={isAIThinking || isGenerating}
              opponentName={opponentName}
              isRecording={isRecording}
              onToggleMicrophone={handleToggleMicrophone}
              textMode={TEXT_MODE_ENABLED}
              userMessage={userMessage}
              setUserMessage={setUserMessage}
              onSendMessage={() => {
                if (userMessage.trim()) {
                  void sendUserIntervention(userMessage);
                }
              }}
              aiResponseContent={history.length > 0 
                ? history[history.length - 1]?.speaker === 'opponent' 
                  ? history[history.length - 1].content 
                  : ''
                : ''}
              userInputMode={userInputMode}
              onToggleInputMode={toggleInputMode}
            />
            
            {/* Current topic information with rounded background */}
            <DebateInfo
              currentTopic={currentTopic}
              currentTopicIndex={currentTopicIndex}
              totalTopics={debateConfig.topics?.length || 1}
              currentTurnName={currentTurnName}
              currentTurnIndex={currentTurnIndex}
              totalTurns={debateConfig.turnCount}
            />
            
            {/* Turn management component - ahora visible en todos los modos */}
            <DebateTurnArea
              activeSpeaker={activeSpeaker} 
              onChangeTurn={(speaker: string) => {
                // Conversión segura a 'user' | 'ai'
                if (speaker === 'user' || speaker === 'ai') {
                  // Verificamos si estamos cambiando de la IA al usuario para avanzar al turno siguiente
                  const isChangingFromAIToUser = activeSpeaker === 'ai' && speaker === 'user';
                  
                  // Cambiamos el hablante activo
                  handleTurnChange(speaker);
                  
                  // Si estamos cambiando de la IA al usuario, avanzamos al siguiente turno
                  if (isChangingFromAIToUser && TEXT_MODE_ENABLED) {
                    console.log('Avanzando al siguiente turno después de que el usuario tomó el turno');
                    nextTurn();
                  }
                }
              }}
              hasRecordedContent={hasRecordedContent}
              onSend={(content: string) => {
                void sendUserIntervention(content); // Usar void para indicar que ignoramos la Promise
              }}
              onDiscard={discardUserIntervention}
              isAIGenerating={isGenerating || isAIThinking}
              userMessage={userMessage}
              setUserMessage={setUserMessage}
            />
            
            {/* Controls for debate */}
            <DebateControlsArea
              topics={debateConfig.topics || [debateConfig.topic]}
              onTopicSelect={handleTopicSelect}
              turnCount={debateConfig.turnCount}
              onGenerateSummary={generateTextSummary}
              onDebateEnd={() => {
                console.log('Finalizando debate desde DebateSession');
                console.log('Historial de debate a pasar:', history.length, 'mensajes');
                // Pasar el historial completo al finalizar
                onDebateEnd(history);
              }}
              onConfigClick={onConfigClick}
            />
          </div>
        </div>
      </div>

      {/* Popups eliminados temporalmente */}
    </DebateProvider>
  );
}
