'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ContentInputModal from './ContentInputModal';

// File icon for content option
const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

// Text icon for content option
const TextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="10" x2="3" y2="10"></line>
    <line x1="21" y1="6" x2="3" y2="6"></line>
    <line x1="21" y1="14" x2="3" y2="14"></line>
    <line x1="17" y1="18" x2="3" y2="18"></line>
  </svg>
);

// Content icon for combined option
const ContentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>
);

interface ContentOptionsProps {
  documentId: string;
  onFileUploaded?: (files: File[]) => void;
  onTextAdded?: (text: string) => void;
}

export default function ContentOptions({ documentId, onFileUploaded, onTextAdded }: ContentOptionsProps) {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [hasAddedText, setHasAddedText] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [savedText, setSavedText] = useState('');

  // Check if there are files or text when the component loads
  useEffect(() => {
    const savedFileName = localStorage.getItem(`doc_file_${documentId}`);
    const storedText = localStorage.getItem(`doc_text_${documentId}`);

    if (savedFileName) {
      setHasUploadedFile(true);
      setUploadedFileName(savedFileName);
    }

    if (storedText) {
      setHasAddedText(true);
      setSavedText(storedText);
    }
  }, [documentId]);

  const handleContentIconClick = () => {
    // Open the combined content modal
    setIsContentModalOpen(true);
  };

  const handleTextSubmit = (text: string) => {
    if (text.trim() === '') return;

    // Save to localStorage for persistence
    localStorage.setItem(`doc_text_${documentId}`, text);

    if (onTextAdded) {
      onTextAdded(text);
    }

    setHasAddedText(true);
  };

  const handleFileSubmit = (files: File[]) => {
    if (files.length === 0) return;

    const fileNames = files.map(file => file.name).join(', ');

    // Save file names to localStorage for persistence
    localStorage.setItem(`doc_file_${documentId}`, fileNames);

    if (onFileUploaded) {
      onFileUploaded(files);
    }

    setHasUploadedFile(true);
    setUploadedFileName(`${files.length} ${files.length === 1 ? 'file' : 'files'}`);
  };

  return (
    <div className="mt-8">
      <h3 className="text-sm font-light text-gray-600 dark:text-gray-400 mb-2">Add content to learn from</h3>

      <motion.div
        className="flex"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Combined content option with subtle indicator */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center justify-between px-4 py-2.5 rounded-full
                     cursor-pointer transition-colors
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     ${(hasUploadedFile || hasAddedText)
                       ? 'bg-gray-50 dark:bg-gray-800/70'
                       : 'bg-gray-50 dark:bg-gray-800/50'}`}
          onClick={handleContentIconClick}
        >
          <div className="flex items-center">
            <div className="flex items-center justify-center mr-2.5 text-gray-600 dark:text-gray-400">
              <ContentIcon />
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Add learning content
            </div>
          </div>

          {/* Content indicators with bubble counters */}
          {(hasUploadedFile || hasAddedText) && (
            <div className="flex items-center space-x-2">
              {/* File counter bubble */}
              {hasUploadedFile && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center h-5 min-w-5 px-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                >
                  <div className="flex items-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400 mr-0.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400">
                      {uploadedFileName.includes('files') ? parseInt(uploadedFileName.split(' ')[0]) : 1}
                    </span>
                  </div>
                </motion.div>
              )}
              
              {/* Text indicator bubble */}
              {hasAddedText && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center h-5 min-w-5 px-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                >
                  <div className="flex items-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400 mr-0.5">
                      <line x1="17" y1="10" x2="3" y2="10"></line>
                      <line x1="21" y1="6" x2="3" y2="6"></line>
                      <line x1="21" y1="14" x2="3" y2="14"></line>
                      <line x1="17" y1="18" x2="3" y2="18"></line>
                    </svg>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400">1</span>
                  </div>
                </motion.div>
              )}
              
              {/* Black dot indicator */}
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-300"
              />
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Combined modal for files and text */}
      <ContentInputModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onFileSubmit={handleFileSubmit}
        onTextSubmit={handleTextSubmit}
        existingFileName={uploadedFileName}
        existingText={savedText}
      />
    </div>
  );
}
