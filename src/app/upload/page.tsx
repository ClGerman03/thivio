'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import PromptInput from '@/components/upload/PromptInput';

export default function Upload() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePromptSubmit = (prompt: string) => {
    console.log('Prompt submitted:', prompt);
    
    // Save prompt to localStorage
    try {
      localStorage.setItem('lexiroo_prompt', prompt);
    } catch (error) {
      console.error('Error saving prompt to localStorage:', error);
    }
    
    // If we already have a file, process everything and redirect
    const savedFileName = localStorage.getItem('lexiroo_filename');
    if (savedFileName) {
      processAndRedirect();
    }
  };
  
  const handleFileUpload = (file: File) => {
    console.log('File selected:', file.name);
    
    // Save filename to localStorage
    try {
      localStorage.setItem('lexiroo_filename', file.name);
    } catch (error) {
      console.error('Error saving filename to localStorage:', error);
    }
    
    // If we already have a prompt, process everything and redirect
    const savedPrompt = localStorage.getItem('lexiroo_prompt');
    if (savedPrompt) {
      processAndRedirect();
    }
  };
  
  const processAndRedirect = () => {
    // In a real app, this would make an API call to process the file with the prompt
    // and return a document ID
    setIsProcessing(true);
    
    setTimeout(() => {
      // Mock document ID - in a real app this would come from the backend
      const documentId = 'doc-' + Math.random().toString(36).substring(2, 10);
      router.push(`/learn/${documentId}`);
    }, 2000);
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
      <motion.div 
        className="w-full max-w-xl mx-auto p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-800 dark:text-white leading-tight mb-2">
            Learn with Lexiroo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload a document and enhance your understanding with AI
          </p>
        </div>
        
        {isProcessing ? (
          <div className="py-10 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processing your document...
            </p>
          </div>
        ) : (
          <PromptInput 
            onSubmit={handlePromptSubmit} 
            onFileUpload={handleFileUpload} 
          />
        )}
        
        <div className="mt-6 text-center">
          <Link 
            href="/dashboard" 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
