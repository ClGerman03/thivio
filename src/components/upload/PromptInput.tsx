'use client';

import { useState, KeyboardEvent, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PromptInputProps {
  onSubmit?: (prompt: string) => void;
  onFileUpload?: (file: File) => void;
}

export default function PromptInput({ onSubmit, onFileUpload }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    
    setIsSubmitting(true);
    
    if (onSubmit) {
      onSubmit(prompt);
    }
    
    // In a real app, this would be an API call
    setTimeout(() => {
      setIsSubmitting(false);
      // We don't clear the prompt so the user can see what they sent
    }, 1000);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Ajustar automáticamente la altura del textarea con límite máximo
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Restablecer la altura para calcular correctamente
    textarea.style.height = 'auto';
    
    // Establecer la altura basada en el contenido, con límite máximo
    const minHeight = 80; // altura mínima en píxeles
    const maxHeight = 160; // altura máxima en píxeles
    
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight
    );
    
    textarea.style.height = `${newHeight}px`;
    
    // Activar/desactivar overflow basado en si hemos alcanzado el límite
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [prompt]);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Process the file upload
      if (onFileUpload) {
        setIsUploading(true);
        
        // In a real app, this would be an API call to upload the file
        setTimeout(() => {
          onFileUpload(selectedFile);
          console.log(`Uploading file: ${selectedFile.name}`);
          setIsUploading(false);
        }, 2000);
      }
    }
  }, [onFileUpload]);
  
  const openFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <motion.div
      className="w-full mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-2">
        <h3 className="text-sm font-light text-gray-500 dark:text-gray-400 opacity-75 ml-1">
          Learning Context
        </h3>
      </div>

      <div className="relative rounded-xl bg-gray-50 dark:bg-gray-800/30 p-1.5">
        <textarea
          ref={textareaRef}
          className="w-full px-3 py-3 text-sm bg-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none rounded-xl min-h-[80px]"
          placeholder="What do you want to learn?"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {/* File upload button */}
          <button
            type="button"
            onClick={openFileInput}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full transition-colors relative"
            aria-label="Upload file"
            title="Upload document"
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent dark:border-gray-500 dark:border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={handleFileChange}
            />
          </button>
          
          {/* Character count */}
          {prompt.length > 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {prompt.length}
            </div>
          )}
          
          {/* Send button */}
          <button
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full transition-colors disabled:opacity-40 disabled:hover:text-gray-400 dark:disabled:hover:text-gray-500"
            onClick={handleSubmit}
            disabled={!prompt.trim() || isSubmitting}
            aria-label="Add context"
            title="Add learning context"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent dark:border-gray-500 dark:border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"></path>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
              </svg>
            )}
          </button>
        </div>
        
        {file && (
          <div className="mt-2 px-3 py-1 text-xs flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-md">
            <span className="text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
            {isUploading ? (
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">Uploading...</span>
            ) : (
              <button 
                onClick={() => setFile(null)} 
                className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Remove file"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Provide details to focus your learning experience
        </p>
      </div>
    </motion.div>
  );
}
