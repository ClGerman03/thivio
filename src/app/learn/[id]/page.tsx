'use client';

import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import LearnOptions from '@/components/learn/LearnOptions';
import PromptDisplay from '@/components/learn/PromptDisplay';
import ContentSummaries from '@/components/learn/ContentSummaries';

export default function LearnPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  
  const openPromptModal = () => setIsPromptModalOpen(true);
  const closePromptModal = () => setIsPromptModalOpen(false);
  
  // In a real app, this would come from a backend API call
  // This simulates the initial state when a document is first uploaded
  // and then updates after an analysis option is selected
  const handleOptionSelect = () => {
    // Simulate content generation
    setTimeout(() => {
      setHasGeneratedContent(true);
    }, 1500);
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <motion.div 
        className="w-full max-w-3xl mx-auto p-6 pt-10 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-2">
          <Link 
            href="/dashboard" 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back to dashboard</span>
          </Link>
        </div>
        
        <div className="my-6">
          <h1 className="text-2xl font-light text-gray-800 dark:text-white leading-tight mb-2">
            AI Learning Assistant
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
            Choose how you'd like to enhance your understanding of this document
          </p>
          
          <button
            onClick={openPromptModal}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-1 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
            </svg>
            <span>View request details</span>
          </button>
        </div>
        
        {/* Learning Options */}
        <LearnOptions documentId={id} />
        
        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800 my-10"></div>
        
        {/* Content Summaries */}
        <ContentSummaries documentId={id} />
      </motion.div>
      
      {/* Prompt Display Modal */}
      <PromptDisplay 
        documentId={id} 
        isOpen={isPromptModalOpen} 
        onClose={closePromptModal} 
      />
    </div>
  );
}
