'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebateContext } from '../DebateSession';
import { useBackButton } from '@/hooks/useBackButton';

interface DebateTopicsListProps {
  /**
   * List of topics for the debate
   */
  topics: string[];
  
  /**
   * Callback when a topic is selected
   */
  onTopicSelect?: (topic: string, index: number) => void;
}

export default function DebateTopicsList({ topics, onTopicSelect }: DebateTopicsListProps) {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { isPaused } = useDebateContext();
  
  // Usar el hook para capturar el botón volver
  useBackButton(isPopupVisible, () => setIsPopupVisible(false));
  
  const handleTopicClick = (topic: string, index: number) => {
    if (index <= currentTopicIndex + 1) { // Allow selecting current or next topic only
      setCurrentTopicIndex(index);
      if (onTopicSelect) {
        onTopicSelect(topic, index);
      }
      // Close popup after selection
      setIsPopupVisible(false);
    }
  };
  
  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };
  
  // Close on escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPopupVisible) {
        setIsPopupVisible(false);
      }
    };

    if (isPopupVisible) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isPopupVisible]);

  // Handle click outside to close the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsPopupVisible(false);
    }
  };
  
  return (
    <div className="relative">
      {/* Button to toggle topics popup */}
      <button 
        onClick={togglePopup}
        className="text-xs px-2 py-1 rounded-md bg-gray-50/70 hover:bg-gray-100 
                 text-gray-700 font-light flex items-center transition-all"
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
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span>Topics</span>
      </button>
      
      {/* Topics modal popup */}
      <AnimatePresence>
        {isPopupVisible && (
          <motion.div
            className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
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
                  Debate Topics
                </h3>
                <button
                  onClick={() => setIsPopupVisible(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  aria-label="Close modal"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="text-xs font-light text-gray-500 mb-3">
                  Select a topic to progress through the debate
                </div>
                <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {topics.map((topic, index) => {
                    // Determine topic status
                    const isCompleted = index < currentTopicIndex;
                    const isCurrent = index === currentTopicIndex;
                    const isNext = index === currentTopicIndex + 1;
                    const isLocked = index > currentTopicIndex + 1;
                    
                    return (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.05 * index }}
                        className={`text-sm p-3 rounded-lg cursor-pointer transition-all
                          ${isCompleted ? 'text-gray-400 bg-gray-50/50 dark:bg-gray-800/20' : ''}
                          ${isCurrent ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-normal' : 'font-light'}
                          ${isNext ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/20' : ''}
                          ${isLocked ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''}
                          ${!isLocked ? 'hover:scale-[1.01]' : ''}
                        `}
                        onClick={isLocked ? undefined : () => handleTopicClick(topic, index)}
                      >
                        <div className="flex items-center">
                          <span className="w-6 h-6 inline-flex items-center justify-center mr-3 text-xs rounded-full
                                          ${isCompleted ? 'bg-green-100/50 text-green-500' : ''}
                                          ${isCurrent ? 'bg-blue-100/50 text-blue-500' : ''}
                                          ${isNext ? 'bg-gray-100/50 text-gray-500' : ''}
                                          ${isLocked ? 'bg-gray-100/30 text-gray-300' : ''}">
                            {isCompleted ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </span>
                          {topic}
                          {isCurrent && (
                            <span className="ml-2 text-xs bg-blue-100/50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                          {isNext && (
                            <span className="ml-2 text-xs bg-gray-100/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                              Next
                            </span>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
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
