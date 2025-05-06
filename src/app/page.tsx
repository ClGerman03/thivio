'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  const handleGetStarted = () => {
    router.push('/auth');
  };
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
            src="/images/Thivio.png" 
            alt="Thivio Logo" 
            width={120} 
            height={120}
            priority
          />
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-thin tracking-tight text-black dark:text-white mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Thivio
        </motion.h1>
        
        <motion.p 
          className="text-xs font-light text-gray-600 dark:text-gray-300 mb-8 mx-auto"
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
            className="px-5 py-2 text-sm font-light text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-50 rounded-full hover:bg-opacity-80 dark:hover:bg-opacity-70 transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGetStarted}
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
          {new Date().getFullYear()} Thivio. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
