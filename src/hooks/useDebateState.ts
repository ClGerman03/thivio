'use client';

import { useState, useMemo } from 'react';
import { useDebateTurns } from './useDebateTurns';

interface OpponentInfo {
  id: string;
  name: string;
}

interface DebateConfig {
  topic: string;
  topics?: string[];
  debateFormat: string;
  turnCount: number;
  opponent: string;
  positions: Record<string, string>;
}

/**
 * Custom hook for managing the overall state of a debate session
 * 
 * @param debateConfig The configuration for the debate
 * @returns Object containing all debate state and functions
 */
export function useDebateState(debateConfig: DebateConfig) {
  // Basic activity states
  const [activeSpeaker, setActiveSpeaker] = useState<'user' | 'ai' | null>('ai');
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(true);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasRecordedContent, setHasRecordedContent] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Timer for debate
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  // Get debate topics from configuration
  const debateTopics = debateConfig.topics || [debateConfig.topic];
  
  // Use the existing turn management hook
  const {
    currentTopicIndex,
    currentTurnIndex,
    currentTopic,
    currentTurnName,
    nextTurn,
    selectTopic,
  } = useDebateTurns(
    debateTopics,
    debateConfig.turnCount,
    () => {
      console.log('Debate completed! All topics and turns finished.');
    }
  );
  
  // Get opponent info
  const opponentName = useMemo(() => {
    // List of possible opponents
    const philosopherOpponents: OpponentInfo[] = [
      { id: 'socrates', name: 'Socrates' },
      { id: 'aristotle', name: 'Aristotle' },
      { id: 'kant', name: 'Kant' }
    ];
    
    const regularOpponents: OpponentInfo[] = [
      { id: 'emily', name: 'Emily Carter' },
      { id: 'marcus', name: 'Marcus Chen' },
      { id: 'sophia', name: 'Sophia Martinez' }
    ];
    
    // Search in both lists
    const allOpponents = [...philosopherOpponents, ...regularOpponents];
    const opponent = allOpponents.find(o => o.id === debateConfig.opponent);
    
    // Return opponent name or default
    return opponent?.name || 'AI';
  }, [debateConfig.opponent]);
  
  // Handler for changing the active speaker
  const handleTurnChange = (speaker: 'user' | 'ai') => {
    setActiveSpeaker(speaker);
    setIsAISpeaking(speaker === 'ai');
    setIsUserSpeaking(speaker === 'user');
  };
  
  // Handler for toggling microphone
  const handleToggleMicrophone = () => {
    if (!isPaused) {
      if (isRecording) {
        setHasRecordedContent(true);
      }
      setIsRecording(prevState => !prevState);
    }
  };
  
  return {
    // State
    activeSpeaker,
    setActiveSpeaker,
    isAISpeaking,
    setIsAISpeaking,
    isAIThinking, 
    setIsAIThinking,
    isUserSpeaking,
    setIsUserSpeaking,
    isRecording,
    setIsRecording,
    hasRecordedContent,
    setHasRecordedContent,
    isPaused,
    setIsPaused,
    remainingTime,
    setRemainingTime,
    
    // Turn and topic management
    currentTopic,
    currentTopicIndex,
    currentTurnIndex,
    currentTurnName,
    nextTurn,
    selectTopic,
    
    // Opponent info
    opponentName,
    
    // Handlers
    handleTurnChange,
    handleToggleMicrophone,
  };
}
