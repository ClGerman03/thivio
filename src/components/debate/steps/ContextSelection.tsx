'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getLearningById, Learning } from '@/services/learningService';
import { getFilesForLearning } from '@/services/fileStorageService';

type ContextSelectionProps = {
  selectedLearningId: string;
  onSelectLearning: (learningId: string) => void;
};

type ContextOption = 'current' | 'specific';

export default function ContextSelection({
  selectedLearningId,
  onSelectLearning,
}: ContextSelectionProps) {
  const [currentLearning, setCurrentLearning] = useState<Learning | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<ContextOption>('current');

  // Load the current learning
  useEffect(() => {
    async function loadLearningData() {
      setIsLoading(true);
      try {
        if (selectedLearningId) {
          const learning = getLearningById(selectedLearningId);
          setCurrentLearning(learning);
          setSelectedOption('current');
          
          // También pasamos el learningId para que se utilice en la creación del caché
          onSelectLearning(selectedLearningId);
          
          // Verificar si hay archivos almacenados
          const storedFiles = await getFilesForLearning(selectedLearningId);
          if (storedFiles.length > 0) {
            console.log(`Found ${storedFiles.length} stored files for learning ${selectedLearningId}`);
          }
        } else {
          // If no learning ID is provided, select the current option by default
          setSelectedOption('current');
          // Ensure learning ID is set to empty to indicate no context
          onSelectLearning('');
        }
      } catch (error) {
        console.error('Error loading learning:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadLearningData();
  }, [selectedLearningId, onSelectLearning]);

  // Determine content type (text, files, both)
  const getContentType = (learning: Learning): string => {
    const hasText = learning.content?.text;
    const hasFiles = learning.content?.fileNames && learning.content.fileNames.length > 0;
    
    if (hasText && hasFiles) return 'Text and files';
    if (hasText) return 'Text';
    if (hasFiles) return 'Files';
    return 'No content';
  };

  // Nota: función eliminada para resolver lint
  // const getContentPreview = (learning: Learning): string => { ... };

  // Format date to readable format
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      // Error capturado sin variable
      return 'Unknown date';
    }
  };



  return (
    <div className="max-w-xl py-2">
      <h5 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
        Debate context
      </h5>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-5 w-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Context selection options */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => {
                setSelectedOption('current');
                // If we have a learning ID, use it, otherwise set to empty string
                onSelectLearning(selectedLearningId || '');
              }}
              className={`
                text-xs px-4 py-2 rounded-full transition-all
                ${selectedOption === 'current' 
                  ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800' 
                  : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
              `}
            >
              Current context
            </button>
            <button
              disabled={true}
              className="text-xs px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              Specific context
              <span className="ml-1 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1 py-0.5 rounded-full">Coming soon</span>
            </button>
          </div>

          {/* Current learning content */}
          {selectedOption === 'current' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/30 border-0"
            >
              {currentLearning && currentLearning.content && (
                currentLearning.content.text || 
                (currentLearning.content.fileNames && currentLearning.content.fileNames.length > 0)
              ) ? (
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h6 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {currentLearning.title}
                    </h6>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
                      {getContentType(currentLearning)}
                    </span>
                  </div>
                  
                  {currentLearning.content?.text && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-1">Text:</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg max-h-36 overflow-y-auto">
                        {currentLearning.content.text}
                      </p>
                    </div>
                  )}
                  
                  {currentLearning.content?.fileNames && currentLearning.content.fileNames.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-1">Files:</p>
                      <div className="flex flex-wrap gap-1">
                        {currentLearning.content.fileNames.map((fileName, index) => (
                          <span key={index} className="text-[10px] bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            {fileName}
                          </span>
                        ))}
                      </div>
                      <div className="mt-1 text-[10px] text-blue-500 dark:text-blue-400">
                        Files will be used as context in the debate
                      </div>
                    </div>
                  )}
                  
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-4">
                    Updated: {formatDate(currentLearning.updatedAt)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p className="text-xs">
                    The debate will be conducted without additional context information, relying solely on the model&apos;s general knowledge.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
