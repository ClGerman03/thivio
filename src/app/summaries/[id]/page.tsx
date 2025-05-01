'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [sourceDocumentId, setSourceDocumentId] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, this would be an API call to fetch the summary data
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for summary
        setSummaryData({
          id,
          title: 'Document Summary',
          content: 'This is a summary of the document. It contains the key points and main ideas.',
          createdAt: new Date().toISOString(),
          // In a real app, we would also fetch the source document ID
          sourceDocumentId: 'doc123' // This is just a placeholder
        });
        
        setSourceDocumentId('doc123'); // Set the source document ID
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching summary data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
            Document Summary
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
            A concise overview of key points and main ideas
          </p>
        </div>
        
        {/* Summary Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-5 h-5 border border-gray-300 border-t-gray-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
              Loading summary...
            </p>
          </div>
        ) : (
          <motion.div
            className="bg-transparent py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {summaryData && (
              <div className="prose dark:prose-invert max-w-none prose-sm">
                <h2>{summaryData.title}</h2>
                <p>{summaryData.content}</p>
                {/* Additional summary data would be rendered here */}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
