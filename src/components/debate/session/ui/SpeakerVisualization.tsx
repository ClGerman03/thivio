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
  
  /**
   * Input mode for user (voice or text)
   */
  userInputMode?: 'voice' | 'text';
  
  /**
   * Function to toggle user input mode
   */
  onToggleInputMode?: () => void;
  
  /**
   * Texto transcrito del audio del usuario
   */
  transcribedText?: string;
  
  /**
   * Indica si se está procesando la transcripción de audio
   */
  isTranscribing?: boolean;
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
  aiResponseContent = '',
  userInputMode = 'text',
  onToggleInputMode = () => {},
  transcribedText = '',
  isTranscribing = false
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
            {textMode ? (
              <AIResponseVisualizer 
                isActive={true} 
                isThinking={isAIThinking} 
                content={aiResponseContent}
                opponentName={opponentName} 
              />
            ) : (
              <div className="relative">
                {/* Visualizador de audio de la IA */}
                <AIVisualizer 
                  isActive={isAISpeaking} 
                  isThinking={isAIThinking} 
                  opponentName={opponentName} 
                />
                
                {/* Mostramos el texto de la respuesta como un complemento visual */}
                {aiResponseContent && (
                  <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm max-w-lg mx-auto overflow-auto max-h-60">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {aiResponseContent}
                    </p>
                  </div>
                )}
              </div>
            )}
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
            <div className="max-w-xl mx-auto w-full">
              {/* Input mode selector */}
              <div className="flex justify-center mb-4">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shadow-sm">
                  <button
                    onClick={onToggleInputMode}
                    className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${userInputMode === 'text' 
                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                      </svg>
                      Text
                    </span>
                  </button>
                  
                  <button
                    onClick={onToggleInputMode}
                    className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${userInputMode === 'voice' 
                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <path d="M12 19v4"></path>
                        <path d="M8 23h8"></path>
                      </svg>
                      Voice
                    </span>
                  </button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {userInputMode === 'text' ? (
                  <motion.div
                    key="text-input"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="w-full"
                  >
                    <TextInputVisualizer 
                      isActive={true} 
                      value={userMessage}
                      onChange={setUserMessage}
                      onSend={onSendMessage}
                      isAIGenerating={isAIThinking}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="voice-input"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="w-full"
                  >
                    <UserVisualizer 
                      isActive={isRecording} 
                      onActivate={onToggleMicrophone}
                      transcribedText={transcribedText}
                      isTranscribing={isTranscribing} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
