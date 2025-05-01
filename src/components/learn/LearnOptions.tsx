'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Iconos sencillos
const SummaryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
    <path d="M14 2v6h6"></path>
    <path d="M16 13H8"></path>
    <path d="M16 17H8"></path>
    <path d="M10 9H8"></path>
  </svg>
);

const DebateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
    <path d="M8 9h8"></path>
    <path d="M8 13h6"></path>
  </svg>
);

type LearnOptionsProps = {
  documentId: string;
};

export default function LearnOptions({ documentId }: LearnOptionsProps) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsLoading(true);

    // Generate a unique ID for the new debate or summary
    // In a real app, this would come from an API response after creating the resource
    const generateUniqueId = () => {
      return `${option}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    
    const newId = generateUniqueId();
    
    // In a real application, we would make an API call to create the resource
    // and associate it with the source document
    setTimeout(() => {
      setIsLoading(false);
      
      // Route to the appropriate page based on the option selected
      if (option === 'debate') {
        router.push(`/debates/${newId}`);
      } else if (option === 'summary') {
        router.push(`/summaries/${newId}`);
      }
      
      console.log(`Created new ${option} with ID: ${newId} for document: ${documentId}`);
    }, 1500);
  };

  const options = [
    {
      id: 'summary',
      title: 'Generate Summary',
      description: 'Get a concise overview of key points and main ideas',
      icon: <SummaryIcon />,
    },
    {
      id: 'debate',
      title: 'Debate Mode',
      description: 'Explore counterarguments and logical inconsistencies',
      icon: <DebateIcon />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-5 h-5 border border-gray-300 border-t-gray-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
          Analyzing document...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {options.map((option) => (
        <motion.div
          key={option.id}
          className={`
            border border-gray-100 dark:border-gray-800 rounded-lg p-5
            hover:border-gray-200 dark:hover:border-gray-700
            hover:bg-gray-50/50 dark:hover:bg-gray-800/30
            transition-colors cursor-pointer aspect-square flex flex-col items-center justify-center
          `}
          whileHover={{ y: -2 }}
          onClick={() => handleOptionSelect(option.id)}
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-3">
              {option.icon}
            </div>
            <h3 className="text-base font-light text-gray-700 dark:text-gray-300 mb-1.5">
              {option.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-light max-w-[200px]">
              {option.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
