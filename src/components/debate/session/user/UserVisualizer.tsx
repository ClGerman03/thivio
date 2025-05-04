'use client';

import { motion } from 'framer-motion';

type UserVisualizerProps = {
  isActive: boolean;
  onActivate: () => void;
};

export default function UserVisualizer({ isActive, onActivate }: UserVisualizerProps) {
  return (
    <div className="flex justify-center items-center py-6">
      {/* Fixed size container to prevent layout shifts */}
      <div className="relative w-[140px] h-[140px] flex items-center justify-center">
        <motion.button
          className={`absolute rounded-full border-none focus:outline-none ${
            isActive 
              ? 'bg-gray-100 dark:bg-gray-800 shadow-md' 
              : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          initial={{ width: 120, height: 120 }}
          animate={{
            width: isActive ? 140 : 120,
            height: isActive ? 140 : 120,
            opacity: isActive ? 1 : 0.7,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          onClick={onActivate}
          aria-label={isActive ? "Detener grabación" : "Comenzar a hablar"}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Microphone icon */}
            <motion.svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={isActive ? "rgb(23 23 23)" : "rgb(107 114 128)"}
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              animate={{
                scale: isActive ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              {isActive && <path d="M12 19v4"></path>}
              {isActive && <path d="M8 23h8"></path>}
            </motion.svg>
          </div>
          
          {/* Sound wave visualizer when user is speaking */}
          {isActive && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border border-gray-200 dark:border-gray-700"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-gray-200 dark:border-gray-700"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-gray-200 dark:border-gray-700"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
              />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
