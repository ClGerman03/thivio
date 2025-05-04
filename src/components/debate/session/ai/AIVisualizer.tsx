'use client';

import { motion } from 'framer-motion';

type AIVisualizerProps = {
  isActive: boolean;
};

export default function AIVisualizer({ isActive }: AIVisualizerProps) {
  // Simple pulse animation for the AI speaking visualization
  return (
    <div className="flex justify-center items-center py-6">
      {/* Fixed size container to prevent layout shifts */}
      <div className="relative w-[140px] h-[140px] flex items-center justify-center">
        <motion.div
          className={`absolute rounded-full ${
            isActive ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
          }`}
          initial={{ width: 120, height: 120 }}
          animate={{
            width: isActive ? 140 : 120,
            height: isActive ? 140 : 120,
            opacity: isActive ? 1 : 0.5,
          }}
          transition={{ duration: 0.8, repeat: isActive ? Infinity : 0, repeatType: 'reverse' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-sm font-light">
              {isActive ? 'AI Speaking' : 'AI Idle'}
            </span>
          </div>
          
          {/* Sound wave visualizer circles (simplified) */}
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
