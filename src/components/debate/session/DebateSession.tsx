'use client';

import { createContext, useState, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIVisualizer from './ai/AIVisualizer';
import UserVisualizer from './user/UserVisualizer';
import TurnManagement from './TurnManagement';
import DebateInterventions from './interventions/DebateInterventions';
import DebateTopicsList from './controls/DebateTopicsList';

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
  setCurrentTopic: (topic: string) => void;
  currentTopicIndex: number;
  setCurrentTopicIndex: (index: number) => void;
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
    debateType: string;
    userRole: string;
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
  
  // Generate subtopics from the main debate topic
  const generateSubtopics = (mainTopic: string) => {
    // This is a simple example. In a real app, this might be more sophisticated or come from an API
    return [
      `Introduction to "${mainTopic}"`,
      `Key arguments for "${mainTopic}"`,
      `Counterarguments against "${mainTopic}"`,
      `Evidence analysis for "${mainTopic}"`,
      `Final conclusions on "${mainTopic}"`
    ];
  };
  
  const debateTopics = generateSubtopics(debateConfig.topic);
  const [currentTopic, setCurrentTopic] = useState<string>(debateTopics[0]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);

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
  }, [handleTurnChange]);

  // Función para descartar la intervención del usuario
  const handleDiscardUserIntervention = useCallback(() => {
    setHasRecordedContent(false);
  }, []);

  const handleAIFinishSpeaking = useCallback(() => {
    setIsAISpeaking(false);
  }, []);

  const handlePauseDebate = useCallback(() => {
    setIsPaused(prevState => {
      // Si vamos a pausar, detener la grabación
      if (!prevState) {
        setIsRecording(false);
      }
      return !prevState;
    });
  }, []);

  const handleTopicSelect = useCallback((topic: string, index: number) => {
    setCurrentTopic(topic);
    setCurrentTopicIndex(index);
  }, []);

  // Memorizar el context value para evitar recrearlo en cada render
  const contextValue = {
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
    setCurrentTopic,
    currentTopicIndex,
    setCurrentTopicIndex
  };

  return (
    <DebateContext.Provider value={contextValue}>
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 py-2">
        {/* Debate Interventions - Manages messages and notifications during the debate */}
        <DebateInterventions debateConfig={debateConfig} />

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
                isRecording={isRecording}
                hasRecordedContent={hasRecordedContent}
                onSend={handleSendUserIntervention}
                onDiscard={handleDiscardUserIntervention}
              />
            </div>
            
            {/* Current topic and topics list */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <span className="text-xs text-gray-400 font-light">Current Topic:</span>
                <h3 className="text-sm text-gray-600 dark:text-gray-300 font-light mt-1">
                  {currentTopic}
                </h3>
              </div>
              
              {/* Topics list button - moved to bottom */}
              <div className="mt-2">
                <DebateTopicsList 
                  topics={debateTopics} 
                  onTopicSelect={handleTopicSelect} 
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
