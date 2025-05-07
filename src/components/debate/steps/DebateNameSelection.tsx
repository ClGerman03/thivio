'use client';

import { useState, useEffect, useMemo } from 'react';

type DebateNameSelectionProps = {
  /**
   * Current debate name
   */
  debateName: string;
  
  /**
   * Callback for updating the debate name
   */
  onNameChange: (name: string) => void;
};

export default function DebateNameSelection({
  debateName,
  onNameChange,
}: DebateNameSelectionProps) {
  const [name, setName] = useState(debateName || '');
  const [error, setError] = useState('');
  
  // Update parent component when name changes
  useEffect(() => {
    onNameChange(name);
  }, [name, onNameChange]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // Simple validation
    if (value.length > 50) {
      setError('Debate name should be less than 50 characters');
    } else {
      setError('');
    }
  };
  
  // Generate a placeholder suggestion that remains fixed during component lifecycle
  const placeholder = useMemo(() => {
    const suggestions = [
      'Ethical implications of AI in education',
      'Climate change solutions debate',
      'Democracy in the digital age',
      'Philosophy of mind discussion',
      'Economic inequality debate'
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }, []);
  
  return (
    <div className="w-full max-w-xl mx-auto pt-8">
      <div className="relative">
        <input
          id="debateName"
          type="text"
          value={name}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-0 py-2 text-xl font-light
                    text-gray-800 dark:text-gray-200 bg-transparent
                    border-b border-gray-200 dark:border-gray-700
                    focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
                    transition-colors"
          aria-describedby="debateNameError"
        />
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-20"></div>
        
        {error && (
          <p id="debateNameError" className="mt-2 text-xs text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
        
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Enter a memorable name for your debate
        </p>
      </div>
    </div>
  );
}
