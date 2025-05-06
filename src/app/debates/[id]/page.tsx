'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { DebateWorkflow, StepInfo } from '@/components/debate';

export default function DebatePage() {
  const params = useParams();
  const id = params?.id as string;
  const [isLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepInfo | null>(null);
  const [sourceDocumentId] = useState<string | null>(null);

  // In a real app, we would fetch the debate data and its associated sourceDocumentId
  // For now, we'll skip the loading state since we don't need to fetch anything in this mock
  
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
            href={sourceDocumentId ? `/learn/${sourceDocumentId}` : '/dashboard'}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>{sourceDocumentId ? 'Back to document' : 'Back to dashboard'}</span>
          </Link>
        </div>
        
        <div className="my-6">
          <h1 className="text-2xl font-light text-gray-800 dark:text-white leading-tight mb-2">
            {currentStep ? currentStep.title : 'Debate Analysis'}
          </h1>
          {!currentStep ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
              Configure your debate experience
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
              {currentStep.description}
            </p>
          )}
        </div>
        
        {/* Debate Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-5 h-5 border border-gray-300 border-t-gray-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
              Loading debate...
            </p>
          </div>
        ) : (
          <motion.div
            className="bg-transparent py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <DebateWorkflow 
              documentId={id} 
              onStepChange={setCurrentStep}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
