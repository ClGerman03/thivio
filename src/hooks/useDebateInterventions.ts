'use client';

import { useState, useCallback } from 'react';

interface Intervention {
  speaker: 'user' | 'ai';
  position: string;
  content: string;
  topic: string;
  turn: number;
}

interface DebateConfig {
  positions: Record<string, string>;
}

/**
 * Custom hook for managing debate interventions, including user recordings,
 * AI responses, and turn change popups
 * 
 * @param debateState Core state from useDebateState
 * @param debateConfig Debate configuration
 * @returns Intervention functions and state
 */
export function useDebateInterventions(
  debateState: {
    handleTurnChange: (speaker: 'user' | 'ai') => void;
    nextTurn: () => void;
    currentTopic: string;
    currentTurnIndex: number;
    opponentName: string;
    setIsAIThinking: (isThinking: boolean) => void;
    setIsAISpeaking: (isSpeaking: boolean) => void;
    setHasRecordedContent: (hasContent: boolean) => void;
  },
  debateConfig: DebateConfig
) {
  // Store interventions for generating summaries
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  
  // Popup state for turn changes
  const [showTurnPopup, setShowTurnPopup] = useState(false);
  const [turnPopupText, setTurnPopupText] = useState('');
  
  // Handle sending a user intervention and transitioning to AI
  const sendUserIntervention = useCallback(() => {
    const { 
      handleTurnChange, 
      nextTurn, 
      currentTopic, 
      currentTurnIndex,
      opponentName,
      setIsAIThinking,
      setIsAISpeaking,
      setHasRecordedContent 
    } = debateState;
    
    // Reset recorded content flag
    setHasRecordedContent(false);
    
    // In a real implementation, capture actual user speech
    const userContent = "User's intervention content";
    
    // Add to interventions history
    setInterventions(prev => [
      ...prev,
      {
        speaker: 'user',
        position: debateConfig.positions.user || 'For',
        content: userContent,
        topic: currentTopic,
        turn: currentTurnIndex
      }
    ]);
    
    // Change to AI speaker
    handleTurnChange('ai');
    
    // Advance to next turn
    nextTurn();
    
    // Show popup for AI's turn
    setTurnPopupText(`Now it's ${opponentName}'s turn to speak on the topic: "${currentTopic}"`);
    setShowTurnPopup(true);
    
    // Simulate AI thinking and speaking
    setIsAIThinking(true);
    
    setTimeout(() => {
      // AI response simulation
      const aiContent = `AI's response to the user's intervention on topic: ${currentTopic}`;
      
      // AI finished thinking and starts speaking
      setIsAIThinking(false);
      setIsAISpeaking(true);
      
      // Add AI intervention to history
      setInterventions(prev => [
        ...prev,
        {
          speaker: 'ai',
          position: debateConfig.positions.ai || 'Against',
          content: aiContent,
          topic: currentTopic,
          turn: currentTurnIndex
        }
      ]);
      
      // AI finishes speaking after delay
      setTimeout(() => {
        setIsAISpeaking(false);
        handleTurnChange('user');
        
        // Show popup for user's turn
        setTurnPopupText(`Your turn! Speak about "${currentTopic}" from your perspective.`);
        setShowTurnPopup(true);
      }, 3000);
    }, 2000);
  }, [debateState, debateConfig.positions]);
  
  // Discard user's recorded content without sending
  const discardUserIntervention = useCallback(() => {
    debateState.setHasRecordedContent(false);
  }, [debateState]);
  
  // Close the turn change popup
  const closePopup = useCallback(() => {
    setShowTurnPopup(false);
  }, []);
  
  return {
    // Intervention list for summaries
    interventions,
    
    // Popup state
    showTurnPopup,
    turnPopupText,
    closePopup,
    
    // Action handlers
    sendUserIntervention,
    discardUserIntervention
  };
}
