'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  }, []);
  
  const handleUpload = useCallback(() => {
    if (!file) return;
    
    setIsUploading(true);
    
    // En una app real, esto sería una llamada API para subir el archivo
    setTimeout(() => {
      console.log(`Subiendo archivo: ${file.name}`);
      setIsUploading(false);
      // router.push('/learn/mock-document-id');
    }, 2000);
  }, [file]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`border border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging 
            ? 'border-gray-300 bg-gray-50/50 dark:border-gray-600 dark:bg-gray-800/30' 
            : 'border-gray-200 dark:border-gray-800'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          {!file && (
            <>
              <div className="text-gray-300 dark:text-gray-700 mb-2">
                <DocumentIcon />
              </div>
              <p className="text-sm font-light text-gray-600 dark:text-gray-400 mb-1">
                Arrastra tu documento
              </p>
              <label className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-500 dark:hover:text-gray-400 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  onChange={handleFileChange}
                />
                o selecciona un archivo
              </label>
            </>
          )}
          
          {file && (
            <>
              <p className="text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                {file.name}
              </p>
              <button
                className="px-4 py-1 text-xs rounded-md bg-gray-800 dark:bg-white text-white dark:text-gray-900 inline-flex items-center gap-1 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent dark:border-gray-900 dark:border-t-transparent rounded-full animate-spin mr-1"></div>
                ) : null}
                <span className="font-light">{isUploading ? "Subiendo..." : "Subir"}</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Formatos: PDF, Word, TXT y MD
        </p>
      </div>
    </motion.div>
  );
}
