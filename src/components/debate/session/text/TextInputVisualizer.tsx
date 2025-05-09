'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TextInputVisualizerProps {
  /**
   * Whether this component is active (user's turn)
   */
  isActive: boolean;
  
  /**
   * Current text in the input field
   */
  value: string;
  
  /**
   * Function to update the text value
   */
  onChange: (value: string) => void;
  
  /**
   * Function to handle sending the message
   */
  onSend: () => void;
  
  /**
   * Whether the AI is currently generating a response
   */
  isAIGenerating?: boolean;
}

/**
 * A simple text input visualizer for testing the debate functionality
 */
export default function TextInputVisualizer({
  isActive,
  value,
  onChange,
  onSend,
  isAIGenerating = false
}: TextInputVisualizerProps) {
  // Reference to the textarea element
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus the textarea when component becomes active
  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);
  
  // Adjust textarea height based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  
  // Listen for value changes to adjust height
  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-6">
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center mb-2">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tu turno
          </span>
        </div>
        
        <textarea
          ref={textareaRef}
          className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 
                    border border-gray-200 dark:border-gray-700 rounded-md
                    focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600
                    resize-none overflow-hidden"
          placeholder="Escribe tu argumento aquí..."
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!isActive || isAIGenerating}
          onInput={adjustTextareaHeight}
        />
        
        <div className="flex justify-end mt-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 
                      text-white text-sm rounded-md transition-colors duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center gap-2"
            onClick={onSend}
            disabled={!value.trim() || !isActive || isAIGenerating}
          >
            {isAIGenerating ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                <span>Enviar</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
