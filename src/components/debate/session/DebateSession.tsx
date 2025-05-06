'use client';

import { createContext, useState, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIVisualizer from './ai/AIVisualizer';
import UserVisualizer from './user/UserVisualizer';
import TurnManagement from './TurnManagement';
import DebateTopicsList from './controls/DebateTopicsList';
import DebateTurnStructure from './controls/DebateTurnStructure';
import { useDebateTurns } from '@/hooks/useDebateTurns';

// Create debate context for sharing state between components
type DebateContextType = {
  activeSpeaker: string | null;
  setActiveSpeaker: (speaker: string | null) => void;
  isAISpeaking: boolean;
  setIsAISpeaking: (isActive: boolean) => void;
  isUserSpeaking: boolean;
  setIsUserSpeaking: (isActive: boolean) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  currentTopic: string;
  currentTopicIndex: number;
  currentTurnIndex: number;
  currentTurnName: string;
  nextTurn: () => void;
  selectTopic: (topicIndex: number) => void;
  // Propiedades para el temporizador de debate
  remainingTime?: number;
  setRemainingTime: (time: number) => void;
};

export const DebateContext = createContext<DebateContextType | null>(null);

export const useDebateContext = () => {
  const context = useContext(DebateContext);
  if (!context) {
    throw new Error('useDebateContext must be used within a DebateProvider');
  }
  return context;
};

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
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>('ai'); // Start with AI speaking
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(true);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasRecordedContent, setHasRecordedContent] = useState<boolean>(false); // Track if user has recorded content
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Acceder a los tópicos configurados por el usuario
  const debateTopics = debateConfig.topics || [debateConfig.topic];
  
  // Estado para el temporizador de debate
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Usar el hook de gestión de turnos
  const { 
    currentTopicIndex, 
    currentTurnIndex, 
    currentTopic,
    currentTurnName,
    nextTurn,
    selectTopic,
    // Comentamos esta variable para evitar el warning de linting
    // isDebateCompleted
  } = useDebateTurns(
    debateTopics, 
    debateConfig.turnCount, 
    () => {
      console.log('Debate completed! All topics and turns finished.');
      // Podríamos realizar acciones adicionales al finalizar el debate
    }
  );

  // Usar useCallback para evitar recrear funciones en cada render
  const handleTurnChange = useCallback((speaker: string) => {
    setActiveSpeaker(speaker);
    setIsAISpeaking(speaker === 'ai');
    setIsUserSpeaking(speaker === 'user');
  }, []);

  // Función para toggle del micrófono (separada del turno)
  const handleToggleMicrophone = useCallback(() => {
    if (!isPaused) {
      // Si está grabando y se detiene, marcar que hay contenido grabado
      if (isRecording) {
        setHasRecordedContent(true);
      }
      setIsRecording(prevState => !prevState);
    }
  }, [isPaused, isRecording]);

  // Función para enviar la intervención del usuario y cambiar turno
  const handleSendUserIntervention = useCallback(() => {
    setHasRecordedContent(false);
    handleTurnChange('ai');
    
    // Avanzar al siguiente turno cuando el usuario envía su intervención
    nextTurn();
  }, [handleTurnChange, nextTurn]);

  // Función para descartar la intervención del usuario
  const handleDiscardUserIntervention = useCallback(() => {
    setHasRecordedContent(false);
  }, []);

  // Eliminamos las funciones no utilizadas handleAIFinishSpeaking y handlePauseDebate
  // para evitar warnings de linting

  // Función para cambiar de tema actual
  const handleTopicSelect = useCallback((topic: string, index: number) => {
    selectTopic(index);
  }, [selectTopic]);

  // Datos contextuales del debate
  const debateContextValue: DebateContextType = {
    activeSpeaker,
    setActiveSpeaker,
    isAISpeaking,
    setIsAISpeaking,
    isUserSpeaking,
    setIsUserSpeaking,
    isRecording,
    setIsRecording,
    isPaused,
    setIsPaused,
    currentTopic,
    currentTopicIndex,
    currentTurnIndex,
    currentTurnName,
    nextTurn,
    selectTopic,
    // Añadimos las propiedades para el temporizador
    remainingTime,
    setRemainingTime,
  };

  return (
    <DebateContext.Provider value={debateContextValue}>
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 py-2">
        <div className="flex flex-col space-y-5">
          {/* Central content area with visualizers, turn management and topic info */}
          <div className="flex flex-col items-center">
            {/* Speaker visualization section - conditional rendering based on active speaker */}
            <div className="w-full flex justify-center mb-8">
              <AnimatePresence mode="wait">
                {activeSpeaker === 'ai' && (
                  <motion.div 
                    key="ai-visualizer"
                    className="w-full"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AIVisualizer isActive={isAISpeaking} />
                  </motion.div>
                )}
                
                {activeSpeaker === 'user' && (
                  <motion.div 
                    key="user-visualizer"
                    className="w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <UserVisualizer 
                      isActive={isRecording} 
                      onActivate={handleToggleMicrophone} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Turn management with stop button */}
            <div className="mb-6">
              <TurnManagement 
                activeSpeaker={activeSpeaker} 
                onChangeTurn={handleTurnChange}
                hasRecordedContent={hasRecordedContent}
                onSend={handleSendUserIntervention}
                onDiscard={handleDiscardUserIntervention}
              />
            </div>
            
            {/* Current topic and topics list */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <span className="text-xs text-gray-400 font-light">Current Topic ({currentTopicIndex + 1}/{debateTopics.length}):</span>
                <h3 className="text-sm text-gray-600 dark:text-gray-300 font-light mt-1">
                  {currentTopic}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="font-medium">{currentTurnName}</span>
                  <span className="ml-1 opacity-60">(Turn {currentTurnIndex + 1} of {debateConfig.turnCount})</span>
                </p>
              </div>
              
              {/* Controls row - Topics list and Debate structure */}
              <div className="mt-2 flex gap-2 justify-center">
                <DebateTopicsList 
                  topics={debateTopics} 
                  onTopicSelect={handleTopicSelect} 
                />
                
                <DebateTurnStructure 
                  turnCount={debateConfig.turnCount} 
                />
              </div>
              
              {/* End debate button */}
              <div className="mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onDebateEnd}
                  className="px-4 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                  aria-label="End debate"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                  <span>Finalizar debate</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DebateContext.Provider>
  );
}
