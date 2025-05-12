'use client';

import { useRef, useEffect } from 'react';
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
    <div className="w-full py-2">
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          className="w-full p-3.5 bg-gray-100/70 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 text-sm
                    border-none rounded-xl
                    focus:outline-none focus:ring-0
                    resize-none overflow-hidden
                    placeholder:text-gray-400/80 dark:placeholder:text-gray-500/70"
          placeholder="Type your argument here..."
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!isActive || isAIGenerating}
          onInput={adjustTextareaHeight}
        />
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`absolute right-3 bottom-3 px-3 py-1.5 
                     ${value.trim() ? 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-800' : 'bg-gray-400/80'} 
                     text-white text-xs font-medium rounded-full 
                     transition-all duration-200
                     disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center gap-1.5`}
          onClick={onSend}
          disabled={!value.trim() || !isActive || isAIGenerating}
          aria-label="Send message"
        >
          {isAIGenerating ? (
            <>
              <div className="w-3 h-3 border border-white/80 border-t-transparent rounded-full animate-spin"></div>
              <span className="sr-only">Processing...</span>
            </>
          ) : (
            <>
              <svg
                width="12"
                height="12"
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
              <span>Send</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
