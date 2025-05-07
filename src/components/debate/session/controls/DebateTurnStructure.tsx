'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebateContext } from '@/context/DebateContext';

/**
 * Get the array of turn names based on the number of turns
 * @param turnCount Number of turns in the debate (3 or 5)
 * @returns Array of turn names
 */
export const getTurnsByCount = (turnCount: number): string[] => {
  return turnCount === 5 
    ? [
        "Initial Position",
        "Rebuttal or Counterargument",
        "Response to Rebuttal",
        "Final Expansion",
        "Closing Reflection"
      ]
    : [
        "Initial Position",
        "Rebuttal or Counterargument",
        "Closing Reflection"
      ];
};

interface DebateTurnStructureProps {
  /**
   * Number of turns in the debate
   */
  turnCount: number;
}

/**
 * Component that shows the structure of turns in a debate session
 */
export default function DebateTurnStructure({ 
  turnCount
}: DebateTurnStructureProps) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { currentTurnIndex } = useDebateContext();
  
  // Define turn structures based on turnCount
  const turns = getTurnsByCount(turnCount);
  
  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };
  
  return (
    <div className="relative">
      {/* Button to toggle turn structure popup */}
      <button 
        onClick={togglePopup}
        className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-50/70 hover:bg-gray-100 
                 text-gray-700 font-light flex items-center transition-all"
        aria-label="View debate turn structure"
      >
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="mr-1"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        <span>Structure ({turnCount} turns)</span>
      </button>
      
      {/* Turn structure modal popup */}
      <AnimatePresence>
        {isPopupVisible && (
          <motion.div
            className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsPopupVisible(false);
              }
            }}
          >
            {/* Modal */}
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-sm overflow-hidden z-50"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="border-b border-gray-100 dark:border-gray-800 px-5 py-3 flex justify-between items-center">
                <h3 className="text-base font-light text-gray-800 dark:text-white">
                  Debate Structure
                </h3>
                <button
                  onClick={() => setIsPopupVisible(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="px-5 py-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  This is a {turnCount}-turn debate with the following structure:
                </div>
                <ol className="space-y-2 mb-3">
                  {turns.map((turn, index) => {
                    // Determine if this turn is active
                    const isCompleted = index < currentTurnIndex;
                    const isCurrent = index === currentTurnIndex;
                    const isUpcoming = index > currentTurnIndex;
                    
                    return (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className={`
                          flex items-center p-2 rounded-md text-sm
                          ${isCompleted ? 'text-gray-400 bg-gray-50/50 dark:bg-gray-800/20' : ''}
                          ${isCurrent ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-normal' : 'font-light'}
                          ${isUpcoming ? 'text-gray-700 dark:text-gray-300' : ''}
                        `}
                      >
                        <div className="w-6 h-6 inline-flex items-center justify-center mr-3 text-xs rounded-full
                          ${isCompleted ? 'bg-green-100/50 text-green-500' : ''}
                          ${isCurrent ? 'bg-blue-100/50 text-blue-500' : ''}
                          ${isUpcoming ? 'bg-gray-100/50 text-gray-500' : ''}">
                          {isCompleted ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <div>{turn}</div>
                        </div>
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-blue-100/50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </motion.li>
                    );
                  })}
                </ol>
                <div className="text-xs text-gray-400 mt-4">
                  <p>These are the types of arguments in the debate structure.</p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3 flex justify-end">
                <button
                  onClick={() => setIsPopupVisible(false)}
                  className="px-4 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
