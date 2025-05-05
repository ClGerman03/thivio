'use client';

import { useState, useRef, useEffect } from 'react';

interface TextInputSectionProps {
  text: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function TextInputSection({ 
  text, 
  onChange, 
  placeholder = "Enter factual information about a topic you want to learn or explain key concepts you wish to understand..." 
}: TextInputSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-adjust textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  }, [text]);
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        Learning Context
      </p>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-none bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 resize-none text-xs text-gray-700 dark:text-gray-300 outline-none min-h-[100px]"
      />
      
      <div className="flex justify-end mt-1">
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {text.length} caracteres
        </div>
      </div>
    </div>
  );
}
