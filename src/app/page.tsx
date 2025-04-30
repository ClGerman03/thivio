'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
      <motion.div 
        className="max-w-xs mx-auto px-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 flex justify-center"
        >
          <Image 
            src="/lexiroo-logo.svg" 
            alt="Lexiroo Logo" 
            width={80} 
            height={80}
            priority
          />
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-extralight tracking-tight text-black dark:text-white mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Lexiroo
        </motion.h1>
        
        <motion.p 
          className="text-sm font-light text-gray-600 dark:text-gray-300 mb-8 mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Enhance your understanding. Learn through AI.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.button 
            className="px-5 py-2 text-sm font-light text-white bg-black rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </motion.div>
        
        <motion.p
          className="text-xs text-gray-400 mt-12 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {new Date().getFullYear()} Lexiroo. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
