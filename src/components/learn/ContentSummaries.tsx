'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Summary = {
  id: string;
  title: string;
  excerpt: string;
  type: 'debate' | 'structure' | 'weakpoints';
  createdAt: string;
};

interface ContentSummariesProps {
  documentId: string;
}

export default function ContentSummaries({ documentId }: ContentSummariesProps) {
  // In a real app, we would fetch this data from an API using the documentId
  const [summaries, setSummaries] = useState<Summary[]>([
    {
      id: 's1',
      title: 'Argument Structure Analysis',
      excerpt: 'This document discusses the impact of climate change on global ecosystems, with particular focus on coral reefs and rainforests...',
      type: 'structure',
      createdAt: 'April 28, 2025'
    },
    {
      id: 'd1',
      title: 'Economic vs Environmental Priorities',
      excerpt: 'The debate centers around balancing short-term economic gains against long-term environmental sustainability...',
      type: 'debate',
      createdAt: 'April 29, 2025'
    },
    {
      id: 's2',
      title: 'Potential Weakpoints Identified',
      excerpt: 'Carbon neutrality, sustainable development, and climate resilience are key concepts with potential weaknesses in this text...',
      type: 'weakpoints',
      createdAt: 'April 30, 2025'
    }
  ]);

  if (summaries.length === 0) {
    return (
      <div className="mt-8 p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No summaries or debates available yet. Create your first one above.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-light text-gray-800 dark:text-white mb-4">
        Previous Analyses
      </h2>
      
      <div className="space-y-2">
        {summaries.map((summary, index) => (
          <motion.div
            key={summary.id}
            className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.005 }}
          >
            <div className="flex items-center p-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  {summary.type === 'debate' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
                      </svg>
                      Debate
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                    {summary.createdAt}
                  </span>
                </div>
                
                <h3 className="text-xs font-medium text-gray-800 dark:text-white truncate">
                  {summary.title}
                </h3>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {summary.excerpt}
                </p>
              </div>
              
              <button 
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="View details"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
