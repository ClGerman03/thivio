'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextInputSection from './TextInputSection';
import FileUploadSection from './FileUploadSection';
import TextExamples from './TextExamples';

interface ContentInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSubmit: (files: File[]) => void;
  onTextSubmit: (text: string) => void;
  existingFileName?: string[] | string;
  existingText?: string;
}

export default function ContentInputModal({ 
  isOpen, 
  onClose, 
  onFileSubmit, 
  onTextSubmit, 
  existingFileName, 
  existingText 
}: ContentInputModalProps) {
  // File states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>(() => {
    if (!existingFileName) return [];
    if (Array.isArray(existingFileName)) return existingFileName;
    return [existingFileName];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Text state
  const [text, setText] = useState(existingText || '');
  
  // Actualizar los estados cuando cambian las props
  useEffect(() => {
    if (existingText) {
      setText(existingText);
    }
    
    if (existingFileName) {
      if (Array.isArray(existingFileName)) {
        setExistingFiles(existingFileName);
      } else {
        setExistingFiles([existingFileName]);
      }
    }
  }, [existingText, existingFileName]);
  
  // References
  const modalRef = useRef<HTMLDivElement>(null);
  
  // We removed the textareaRef focusing as it's now handled in TextInputSection
  
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Removed textarea auto-adjust as it's now handled in TextInputSection
  
  // All file handlers are now handled in FileUploadSection
  
  // Submit handler for both files and text
  const handleSubmit = async () => {
    const hasFiles = selectedFiles.length > 0 || existingFiles.length > 0;
    const hasText = text.trim().length > 0;
    
    if (!hasFiles && !hasText || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate processing (in a real app, this would be an API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Submit files if any
      if (hasFiles) {
        onFileSubmit(selectedFiles);
      }
      
      // Submit text if any
      if (hasText) {
        onTextSubmit(text);
      }
      
      // Clear state and close modal
      setSelectedFiles([]);
      setText('');
      onClose();
    } catch (error) {
      console.error('Error submitting content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Moved to FileUploadSection

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
            ref={modalRef}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-light text-gray-800 dark:text-white">
                  Add Learning Content
                </h3>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="flex-grow overflow-auto p-4">
                {/* Main content section - files and text together */}
                <div className="space-y-5">
                  {/* Text input section */}
                  <TextInputSection 
                    text={text}
                    onChange={setText}
                  />
                  
                  {/* Text examples section */}
                  <TextExamples onSelectExample={setText} />
                  
                  {/* Files section */}
                  <FileUploadSection
                    selectedFiles={selectedFiles}
                    existingFiles={existingFiles}
                    onFilesChange={setSelectedFiles}
                    onExistingFilesChange={setExistingFiles}
                  />
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end items-center gap-3">
                <button
                  onClick={onClose}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-4 py-2"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={(selectedFiles.length === 0 && existingFiles.length === 0 && !text.trim()) || isSubmitting}
                  className="text-sm text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-full disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>Save Content</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Input de archivo oculto */}
      {/* File input moved to FileUploadSection */}
    </AnimatePresence>
  );
}
