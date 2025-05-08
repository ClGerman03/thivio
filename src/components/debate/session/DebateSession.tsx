'use client';


import InterventionPopup from './interventions/InterventionPopup';
import { DebateProvider } from '@/context/DebateContext';
import { useDebateState } from '@/hooks/useDebateState';
import { useDebateInterventions } from '@/hooks/useDebateInterventions';
import { useDebateSummary } from '@/hooks/useDebateSummary';

// Importar componentes UI
import SpeakerVisualization from './ui/SpeakerVisualization';
import DebateInfo from './ui/DebateInfo';
import DebateControlsArea from './ui/DebateControlsArea';
import DebateTurnArea from './ui/DebateTurnArea';

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
    opponentName
  } = debateState;
  
  // Interventions and messaging
  const { 
    interventions,
    showTurnPopup, 
    turnPopupText, 
    closePopup,
    sendUserIntervention, 
    discardUserIntervention 
  } = useDebateInterventions(debateState, debateConfig);
  
  // Debate summary generator
  const { generateTextSummary } = useDebateSummary(interventions, debateConfig);
  
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
              isAIThinking={isAIThinking}
              opponentName={opponentName}
              isRecording={isRecording}
              onToggleMicrophone={handleToggleMicrophone}
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
            
            {/* Turn management component */}
            <DebateTurnArea
              activeSpeaker={activeSpeaker} 
              onChangeTurn={(speaker: string) => {
                // Conversión segura a 'user' | 'ai'
                if (speaker === 'user' || speaker === 'ai') {
                  handleTurnChange(speaker);
                }
              }}
              hasRecordedContent={hasRecordedContent}
              onSend={sendUserIntervention}
              onDiscard={discardUserIntervention}
            />
            
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
    </DebateProvider>
  );
}
