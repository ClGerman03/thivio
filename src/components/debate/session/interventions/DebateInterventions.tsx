'use client';

import { useState, useEffect } from 'react';
import MessageOverlay from '@/components/shared/MessageOverlay';
import { useDebateContext } from '../DebateSession';

export type InterventionType = 
  | 'welcome' 
  | 'topic-intro'
  | 'turn-change' 
  | 'topic-change' 
  | 'conclusion' 
  | 'rule' 
  | 'tip';

interface DebateInterventionsProps {
  debateConfig: {
    topic: string;
    debateType: string;
    userRole: string;
  };
}

/**
 * Component responsible for showing interventions during the debate,
 * such as welcome messages, turn changes, topic changes, etc.
 */
export default function DebateInterventions({ debateConfig }: DebateInterventionsProps) {
  const [intervention, setIntervention] = useState<InterventionType | null>('welcome');
  const [message, setMessage] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const { activeSpeaker, isPaused, currentTopic } = useDebateContext();
  
  // Initial welcome and topic introduction sequence
  useEffect(() => {
    // Show brief welcome message
    if (intervention === 'welcome') {
      setTitle('Welcome');
      setMessage(`Let's start a debate on "${debateConfig.topic}".`);
      
      // After showing the welcome message, show topic introduction
      const timer = setTimeout(() => {
        showIntervention('topic-intro', 'First Topic', currentTopic);
      }, 3000); // Short welcome message displayed for 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [intervention, debateConfig, currentTopic]);
  
  // Watch for turn changes
  useEffect(() => {
    if (activeSpeaker && !isPaused) {
      // If there's a turn change, show an intervention
      const speakerName = activeSpeaker === 'ai' ? 'AI' : 'Your';
      
      // Don't show this message for the first turn (already covered by the welcome message)
      if (intervention !== 'welcome' && intervention !== 'topic-intro') {
        showIntervention('turn-change', 'Turn change', 
          `${speakerName} turn to speak. ${
            activeSpeaker === 'ai' ? 'Listen carefully.' : 'Present your arguments clearly.'
          }`);
      }
    }
  }, [activeSpeaker, isPaused, intervention]);
  
  const showIntervention = (type: InterventionType, newTitle: string, newMessage: string) => {
    setIntervention(type);
    setTitle(newTitle);
    setMessage(newMessage);
    
    // For some types of interventions, we can auto-dismiss after some time
    if (type === 'turn-change' || type === 'tip') {
      setTimeout(() => {
        setIntervention(null);
      }, type === 'turn-change' ? 1000 : 4000); 
    }
  };
  
  // Mapping intervention types to MessageOverlay variants
  const getVariantForType = (type: InterventionType): 'info' | 'warning' | 'tip' | 'rule' => {
    switch (type) {
      case 'welcome':
      case 'conclusion':
      case 'topic-intro':
        return 'info';
      case 'rule':
        return 'rule';
      case 'tip':
        return 'tip';
      case 'turn-change':
      case 'topic-change':
        return 'info';
      default:
        return 'info';
    }
  };
  
  // Determine which button text to show based on intervention type
  const getContinueButtonText = (type: InterventionType | null): string => {
    if (!type) return 'Continue';
    
    switch (type) {
      case 'topic-intro':
        return 'Start';
      case 'conclusion':
        return 'Finish';
      default:
        return 'Continue';
    }
  };
  
  return (
    <MessageOverlay
      isVisible={intervention !== null}
      onDismiss={() => setIntervention(null)}
      title={title}
      variant={intervention ? getVariantForType(intervention) : 'info'}
      // Only auto-dismiss certain types of messages
      autoDismissAfterMs={
        intervention === 'turn-change' ? 1000 : 
        intervention === 'tip' ? 4000 : undefined
      }
      // Show continue button for welcome, topic-intro and conclusion interventions
      showContinueButton={intervention === 'welcome' || intervention === 'topic-intro' || intervention === 'conclusion'}
      continueButtonText={getContinueButtonText(intervention)}
    >
      {intervention === 'topic-intro' ? (
        <div className="space-y-3">
          <p>{message}</p>
          <p className="text-sm font-normal mt-3">Are you ready to discuss this topic?</p>
        </div>
      ) : (
        <p>{message}</p>
      )}
    </MessageOverlay>
  );
}
