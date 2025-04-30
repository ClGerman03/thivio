'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const options = [
  {
    title: 'Upload Document',
    description: 'Upload a new document to analyze',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: '#upload'
  },
  {
    title: 'Start Debate',
    description: 'Analyze arguments and contradictions',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    href: '/board'
  },
  {
    title: 'My Documents',
    description: 'View and manage your documents',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: '#documents'
  }
];

export default function DashboardOptions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {options.map((option, index) => (
        <motion.div
          key={option.title}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <Link href={option.href} className="block">
            <div className="text-gray-900 dark:text-white mb-3">
              {option.icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {option.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {option.description}
            </p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
