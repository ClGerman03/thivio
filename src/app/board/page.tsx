'use client';

import { motion } from 'framer-motion';

export default function Board() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <motion.div 
        className="w-full max-w-6xl mx-auto p-6 pt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-light text-gray-800 dark:text-white">
            Board
          </h1>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Explore arguments, contradictions, and debate structures.
        </p>
      </motion.div>
    </div>
  );
}
