'use client';


import TurnManagement from '../TurnManagement';

interface DebateTurnAreaProps {
  /**
   * Current active speaker ('ai', 'user', or null)
   */
  activeSpeaker: 'ai' | 'user' | null;
  
  /**
   * Function to change the active speaker
   */
  onChangeTurn: (speaker: string) => void;
  
  /**
   * Whether the user has recorded content waiting to be sent
   */
  hasRecordedContent: boolean;
  
  /**
   * Function to send the user's recorded intervention
   */
  onSend: (content: string) => void;
  
  /**
   * Function to discard the user's recorded intervention
   */
  onDiscard: () => void;
  
  /**
   * Whether the AI is generating a response
   */
  isAIGenerating?: boolean;
  
  /**
   * Current user message being typed
   */
  userMessage?: string;
  
  /**
   * Function to update the user message
   */
  setUserMessage?: (message: string) => void;
}

/**
 * Component that handles turn management for the debate
 * Includes turn change controls and status indicators
 */
export default function DebateTurnArea({
  activeSpeaker,
  onChangeTurn,
  hasRecordedContent,
  onSend,
  onDiscard,
  isAIGenerating = false,
  userMessage = '',
  setUserMessage = () => {}
}: DebateTurnAreaProps) {
  return (
    <div className="w-full flex justify-center my-4">
      <div className="flex items-center justify-center">
        <TurnManagement 
          activeSpeaker={activeSpeaker}
          onChangeTurn={onChangeTurn}
          hasRecordedContent={hasRecordedContent}
          onSend={onSend}
          onDiscard={onDiscard}
          isAIGenerating={isAIGenerating}
          userMessage={userMessage}
          setUserMessage={setUserMessage}
        />
      </div>
    </div>
  );
}
