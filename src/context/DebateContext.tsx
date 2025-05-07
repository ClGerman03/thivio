'use client';

import { createContext, useContext, ReactNode } from 'react';

/**
 * Interface for the debate context that will be shared across components
 */
export interface DebateContextType {
  // Speaker states
  activeSpeaker: string | null;
  setActiveSpeaker: (speaker: string | null) => void;
  
  // AI states
  isAISpeaking: boolean;
  setIsAISpeaking: (isActive: boolean) => void;
  isAIThinking: boolean;
  setIsAIThinking: (isThinking: boolean) => void;
  
  // User states
  isUserSpeaking: boolean;
  setIsUserSpeaking: (isActive: boolean) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  
  // Debate flow states
  currentTopic: string;
  currentTopicIndex: number;
  currentTurnIndex: number;
  currentTurnName: string;
  
  // Actions
  nextTurn: () => void;
  selectTopic: (topicIndex: number) => void;
  
  // Timer state
  remainingTime?: number;
  setRemainingTime: (time: number) => void;
  
  // Opponent info
  opponentName: string;
}

/**
 * Default values for the context
 * These will be overridden by the provider
 */
const defaultContextValue: DebateContextType = {
  activeSpeaker: null,
  setActiveSpeaker: () => {},
  isAISpeaking: false,
  setIsAISpeaking: () => {},
  isAIThinking: false,
  setIsAIThinking: () => {},
  isUserSpeaking: false,
  setIsUserSpeaking: () => {},
  isRecording: false,
  setIsRecording: () => {},
  isPaused: false,
  setIsPaused: () => {},
  currentTopic: '',
  currentTopicIndex: 0,
  currentTurnIndex: 0,
  currentTurnName: '',
  nextTurn: () => {},
  selectTopic: () => {},
  remainingTime: 0,
  setRemainingTime: () => {},
  opponentName: 'AI',
};

export const DebateContext = createContext<DebateContextType>(defaultContextValue);

/**
 * Custom hook to use the debate context
 * @returns The debate context
 */
export const useDebateContext = () => {
  const context = useContext(DebateContext);
  if (!context) {
    throw new Error('useDebateContext must be used within a DebateProvider');
  }
  return context;
};

interface DebateProviderProps {
  children: ReactNode;
  value: DebateContextType;
}

/**
 * Provider component for the debate context
 */
export const DebateProvider = ({ children, value }: DebateProviderProps) => {
  return (
    <DebateContext.Provider value={value}>
      {children}
    </DebateContext.Provider>
  );
};
