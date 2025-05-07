'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackButton } from '@/hooks/useBackButton';

interface DebateReviewButtonProps {
  /**
   * Function to generate the debate summary
   */
  onGenerateSummary?: () => Promise<string>;
}

export default function DebateReviewButton({ onGenerateSummary }: DebateReviewButtonProps) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use back button hook to close modal on back navigation
  useBackButton(isPopupVisible, () => setIsPopupVisible(false));
  
  const togglePopup = async () => {
    if (!isPopupVisible && !summary && onGenerateSummary) {
      setIsLoading(true);
      try {
        const generatedSummary = await onGenerateSummary();
        setSummary(generatedSummary);
      } catch (error) {
        console.error('Error generating summary:', error);
        setSummary('No se pudo generar un resumen del debate.');
      } finally {
        setIsLoading(false);
      }
    }
    
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
      {/* Button to toggle review popup */}
      <button 
        onClick={togglePopup}
        className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-50/70 hover:bg-gray-100 
                 text-gray-700 font-light flex items-center transition-all"
        aria-label="View debate summary"
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
        <span>Summary</span>
      </button>
      
      {/* Summary modal popup */}
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
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md overflow-hidden z-50"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="border-b border-gray-100 dark:border-gray-800 p-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Debate Summary
                </h3>
              </div>
              
              {/* Content */}
              <div className="p-5">
                {isLoading ? (
                  <div className="flex flex-col items-center py-8">
                    <div className="w-10 h-10 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Generating summary...</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 max-h-[60vh] overflow-y-auto">
                    {summary || 'No summary is available for this debate yet.'}
                  </div>
                )}
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
