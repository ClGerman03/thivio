'use client';

import { motion, AnimatePresence } from 'framer-motion';
import AIVisualizer from '../ai/AIVisualizer';
import UserVisualizer from '../user/UserVisualizer';
import TextInputVisualizer from '../text/TextInputVisualizer';
import AIResponseVisualizer from '../text/AIResponseVisualizer';

interface SpeakerVisualizationProps {
  /**
   * The currently active speaker ('ai', 'user', or null)
   */
  activeSpeaker: 'ai' | 'user' | null;
  
  /**
   * Whether the AI is currently speaking
   */
  isAISpeaking: boolean;
  
  /**
   * Whether the AI is thinking (processing response)
   */
  isAIThinking: boolean;
  
  /**
   * Name of the debate opponent
   */
  opponentName: string;
  
  /**
   * Whether the user is currently recording
   */
  isRecording: boolean;
  
  /**
   * Function to toggle microphone recording state
   */
  onToggleMicrophone: () => void;
  
  /**
   * Whether to use text mode for testing Gemini
   */
  textMode?: boolean;

  /**
   * Current user message text
   */
  userMessage?: string;

  /**
   * Function to update user message
   */
  setUserMessage?: (text: string) => void;

  /**
   * Function to send message
   */
  onSendMessage?: () => void;

  /**
   * Last AI response content
   */
  aiResponseContent?: string;
}

/**
 * Component that handles the visualization of the active speaker (AI or User)
 * Uses AnimatePresence for smooth transitions between speakers
 */
export default function SpeakerVisualization({
  activeSpeaker,
  isAISpeaking,
  isAIThinking,
  opponentName,
  isRecording,
  onToggleMicrophone,
  textMode = false,
  userMessage = '',
  setUserMessage = () => {},
  onSendMessage = () => {},
  aiResponseContent = ''
}: SpeakerVisualizationProps) {
  return (
    <div className="w-full flex justify-center mb-8">
      <AnimatePresence mode="wait">
        {textMode ? (
          // Modo texto para pruebas con Gemini
          <>
            {activeSpeaker === 'ai' && (
              <motion.div 
                key="ai-text-visualizer"
                className="w-full"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AIResponseVisualizer 
                  isActive={true} 
                  isThinking={isAIThinking} 
                  content={aiResponseContent}
                  opponentName={opponentName} 
                />
              </motion.div>
            )}
            
            {activeSpeaker === 'user' && (
              <motion.div 
                key="user-text-visualizer"
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TextInputVisualizer 
                  isActive={true} 
                  value={userMessage}
                  onChange={setUserMessage}
                  onSend={onSendMessage}
                  isAIGenerating={isAIThinking}
                />
              </motion.div>
            )}
          </>
        ) : (
          // Modo original con visualizadores de voz
          <>
            {activeSpeaker === 'ai' && (
              <motion.div 
                key="ai-visualizer"
                className="w-full"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AIVisualizer 
                  isActive={isAISpeaking} 
                  isThinking={isAIThinking} 
                  opponentName={opponentName} 
                />
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
                  onActivate={onToggleMicrophone} 
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
