'use client';

import { motion, AnimatePresence } from 'framer-motion';
import AIVisualizer from '../ai/AIVisualizer';
import UserVisualizer from '../user/UserVisualizer';

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
  onToggleMicrophone
}: SpeakerVisualizationProps) {
  return (
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
      </AnimatePresence>
    </div>
  );
}
