'use client';

import { motion } from 'framer-motion';

interface AIResponseVisualizerProps {
  /**
   * Whether the AI is active (AI's turn)
   */
  isActive: boolean;
  
  /**
   * Whether the AI is thinking/generating a response
   */
  isThinking: boolean;
  
  /**
   * The AI's response content
   */
  content: string;
  
  /**
   * Name of the opponent (e.g., "Aristotle")
   */
  opponentName: string;
}

/**
 * A simple text-based AI response visualizer for testing Gemini integration
 */
export default function AIResponseVisualizer({
  isActive,
  isThinking,
  content,
  opponentName
}: AIResponseVisualizerProps) {
  if (!isActive) return null;
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-6">
      <div className="w-full bg-gray-100 dark:bg-gray-850 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center mb-3">
          <div className={`w-3 h-3 rounded-full mr-2 ${isThinking ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'}`}></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            {opponentName}
            {isThinking && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  pensando
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                >
                  .
                </motion.span>
              </span>
            )}
          </span>
        </div>
        
        {isThinking ? (
          <div className="w-full p-4 bg-gray-50/70 dark:bg-gray-800/50 rounded-md flex items-center justify-center min-h-[100px]">
            <div className="flex space-x-2 justify-center items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full p-4 bg-gray-50/70 dark:bg-gray-800/50 rounded-md text-gray-800 dark:text-gray-200"
          >
            <p className="whitespace-pre-wrap">{content}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
