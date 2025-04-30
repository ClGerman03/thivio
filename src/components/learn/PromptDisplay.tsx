'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptDisplayProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PromptDisplay({ documentId, isOpen, onClose }: PromptDisplayProps) {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Only fetch data when the modal is open
      setIsLoading(true);
      
      // In a real app, we would fetch this data from an API using the documentId
      setTimeout(() => {
        try {
          const savedPrompt = localStorage.getItem('lexiroo_prompt');
          const savedFileName = localStorage.getItem('lexiroo_filename');
          
          setPrompt(savedPrompt);
          setFileName(savedFileName);
        } catch (error) {
          console.error('Error retrieving prompt data:', error);
          // Set fallback data if localStorage isn't available
          setPrompt('Explain the main concepts and analyze the key arguments');
          setFileName('document.pdf');
        } finally {
          setIsLoading(false);
        }
      }, 600);
    }
  }, [documentId, isOpen]);

  // Close on escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside to close the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
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
              <div className="border-b border-gray-100 dark:border-gray-800 px-5 py-3 flex justify-between items-center">
                <h3 className="text-base font-light text-gray-800 dark:text-white">
                  Your Request Configuration
                </h3>
                <button
                  onClick={onClose}
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
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Prompt
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-sm text-gray-800 dark:text-white">
                        {prompt || 'No prompt specified'}
                      </div>
                    </div>
                    
                    {fileName && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Document
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                            <path d="M14 2v6h6"></path>
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{fileName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
