'use client';

import { motion } from 'framer-motion';

type UserVisualizerProps = {
  isActive: boolean;
  onActivate: () => void;
};

export default function UserVisualizer({ isActive, onActivate }: UserVisualizerProps) {
  return (
    <div className="flex flex-col justify-center items-center py-6">
      {/* Fixed size container to prevent layout shifts */}
      <div className="relative w-[120px] h-[120px] flex items-center justify-center">
        <motion.button
          className={`absolute rounded-full border-none focus:outline-none ${
            isActive 
              ? 'bg-gray-900 dark:bg-gray-800 shadow-lg' 
              : 'bg-gray-800 dark:bg-gray-900 hover:bg-gray-700 dark:hover:bg-gray-800'
          }`}
          initial={{ width: 100, height: 100 }}
          animate={{
            width: isActive ? 110 : 100,
            height: isActive ? 110 : 100,
            opacity: isActive ? 1 : 0.9,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          onClick={onActivate}
          aria-label={isActive ? "Stop recording" : "Start speaking"}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Microphone icon */}
            <motion.svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={isActive ? "rgb(255, 255, 255)" : "rgb(220, 220, 220)"}
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
              {/* Animated recording indicator */}
              <motion.div
                className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              
              {/* Modern pulse waves */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/20 dark:border-white/10"
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-white/30 dark:border-white/20"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </motion.button>
      </div>
      
      {/* Text indicator */}
      <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
        {isActive ? "Recording..." : "Click to speak"}
      </span>
    </div>
  );
}
