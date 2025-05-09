'use client';

import { useState, useCallback, useEffect } from 'react';
import InterventionPopup from './interventions/InterventionPopup';
import TurnConfirmationPopup from './interventions/TurnConfirmationPopup';
import { DebateProvider } from '@/context/DebateContext';
import { useDebateState } from '@/hooks/useDebateState';
import { useDebateInterventions } from '@/hooks/useDebateInterventions';
import { useDebateSummary } from '@/hooks/useDebateSummary';
import { useGeminiDebate } from '@/hooks/useGeminiDebate';

// Importar componentes UI
import SpeakerVisualization from './ui/SpeakerVisualization';
import DebateInfo from './ui/DebateInfo';
import DebateControlsArea from './ui/DebateControlsArea';
import DebateTurnArea from './ui/DebateTurnArea';

// Constante para modo de prueba con texto (simplificado)
const TEXT_MODE_ENABLED = true; // Cambiar a false para usar el modo de voz

// Types imported from context

type DebateSessionProps = {
  debateConfig: {
    topic: string;
    topics?: string[];
    debateFormat: string;
    turnCount: number;
    opponent: string;
    positions: Record<string, string>;
  };
  onDebateEnd: () => void;
};

export default function DebateSession({ debateConfig, onDebateEnd }: DebateSessionProps) {
  // Use our custom hooks to manage state and logic
  const debateState = useDebateState(debateConfig);
  
  // Estado para el texto del usuario
  const [userMessage, setUserMessage] = useState('');
  
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
    error: geminiError,
    getAIResponse,
    clearHistory
  } = useGeminiDebate(debateConfig);
  
  // Interventions and messaging (mantenemos temporalmente para compatibilidad)
  const { 
    interventions,
    showTurnPopup, 
    turnPopupText, 
    closePopup,
    discardUserIntervention,
    sendUserIntervention: originalSendUserIntervention,
    setTurnPopupText,
    setShowTurnPopup
  } = useDebateInterventions(debateState, debateConfig);
  
  // Debate summary generator
  const { generateTextSummary } = useDebateSummary(interventions, debateConfig);
  
  // Estado para controlar el popup de confirmación de cambio de turno
  const [showTurnConfirmation, setShowTurnConfirmation] = useState(false);

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
      // Mostrar popup para AI
      closePopup();
      setTurnPopupText(`${opponentName} está pensando sobre "${currentTopic}"...`);
      setShowTurnPopup(true);
      
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
      closePopup();
      
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
        
        if (!TEXT_MODE_ENABLED) {
          // En modo voz, cambiar automáticamente
          handleTurnChange('user');
          nextTurn();
          
          // Mostrar popup para el turno del usuario
          const popupText = `Tu turno! Habla sobre "${currentTopic}" - ${currentTurnName}`;
          setTurnPopupText(popupText);
          setShowTurnPopup(true);
        } else {
          // En modo texto, mostrar confirmación para cambiar de turno
          setShowTurnConfirmation(true);
        }
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
      
      // Mostrar popup de error
      setTurnPopupText(`Hubo un error. Por favor intenta de nuevo.`);
      setShowTurnPopup(true);
    }
  }, [currentTopic, currentTurnName, currentTurnIndex, getAIResponse, handleTurnChange, 
      nextTurn, opponentName, setIsAIThinking, setIsAISpeaking, setHasRecordedContent,
      closePopup, setTurnPopupText, setShowTurnPopup]);
  
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
            
            {/* Turn management component - oculto en modo texto */}
            {!TEXT_MODE_ENABLED && (
              <DebateTurnArea
                activeSpeaker={activeSpeaker} 
                onChangeTurn={(speaker: string) => {
                  // Conversión segura a 'user' | 'ai'
                  if (speaker === 'user' || speaker === 'ai') {
                    handleTurnChange(speaker);
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
            )}
            
            {/* Controls for debate */}
            <DebateControlsArea
              topics={debateConfig.topics || [debateConfig.topic]}
              onTopicSelect={handleTopicSelect}
              turnCount={debateConfig.turnCount}
              onGenerateSummary={generateTextSummary}
              onDebateEnd={() => {
                console.log('Finalizando debate desde DebateSession');
                onDebateEnd();
              }}
            />
          </div>
        </div>
      </div>

      {/* Popup de intervención para cambios de turno */}
      <InterventionPopup 
        isVisible={showTurnPopup}
        onClose={closePopup}
        text={turnPopupText}
      />

      {/* Popup de confirmación para cambio de turno después de recibir respuesta de Gemini */}
      <TurnConfirmationPopup
        isVisible={showTurnConfirmation}
        onConfirm={() => {
          // Confirmar el cambio de turno
          handleTurnChange('user');
          nextTurn();
          setShowTurnConfirmation(false);
          
          // Mostrar popup para el turno del usuario
          const popupText = `Tu turno! Escribe sobre "${currentTopic}" - ${currentTurnName}`;
          setTurnPopupText(popupText);
          setShowTurnPopup(true);
        }}
        onCancel={() => {
          // Cancelar el cambio de turno (simplemente cerrar el popup)
          setShowTurnConfirmation(false);
        }}
        text={`¿Deseas continuar al siguiente turno? Acabas de recibir una respuesta para "${currentTopic}"`}
      />
    </DebateProvider>
  );
}
