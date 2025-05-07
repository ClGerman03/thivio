'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type AIVisualizerProps = {
  isActive: boolean;
  isThinking?: boolean;
  opponentName?: string;
};

export default function AIVisualizer({ isActive, isThinking = false, opponentName = 'AI' }: AIVisualizerProps) {
  // State for randomizing the bar heights for a more natural effect
  const [barHeights, setBarHeights] = useState<number[]>([40, 60, 40]);
  
  // Update bar heights periodically when speaking or thinking
  useEffect(() => {
    if (!isActive && !isThinking) return;
    
    const getRandomHeights = () => {
      if (isActive) {
        // More variation when speaking
        return [
          Math.floor(Math.random() * 50) + 20, // between 20-70
          Math.floor(Math.random() * 60) + 30, // between 30-90
          Math.floor(Math.random() * 50) + 20  // between 20-70
        ];
      } else if (isThinking) {
        // Subtle movement when thinking
        return [
          Math.floor(Math.random() * 20) + 30, // between 30-50
          Math.floor(Math.random() * 20) + 40, // between 40-60
          Math.floor(Math.random() * 20) + 30  // between 30-50
        ];
      }
      return [40, 60, 40]; // Default
    };
    
    const interval = setInterval(() => {
      setBarHeights(getRandomHeights());
    }, isActive ? 200 : 400); // Update faster when speaking
    
    return () => clearInterval(interval);
  }, [isActive, isThinking]);
  
  return (
    <div className="flex flex-col justify-center items-center py-6">
      {/* Audio visualizer with 3 bars */}
      <div className="h-[80px] flex items-center justify-center mb-4 gap-2">
        {/* First bar */}
        <motion.div
          className={`w-3 rounded-full ${isActive || isThinking ? 'bg-gray-800 dark:bg-gray-200' : 'bg-gray-300 dark:bg-gray-600'}`}
          initial={{ height: 40 }}
          animate={{ 
            height: barHeights[0],
            opacity: isActive ? 1 : isThinking ? 0.8 : 0.5
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Middle bar (usually taller) */}
        <motion.div
          className={`w-3 rounded-full ${isActive || isThinking ? 'bg-gray-800 dark:bg-gray-200' : 'bg-gray-300 dark:bg-gray-600'}`}
          initial={{ height: 60 }}
          animate={{ 
            height: barHeights[1],
            opacity: isActive ? 1 : isThinking ? 0.8 : 0.5
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Third bar */}
        <motion.div
          className={`w-3 rounded-full ${isActive || isThinking ? 'bg-gray-800 dark:bg-gray-200' : 'bg-gray-300 dark:bg-gray-600'}`}
          initial={{ height: 40 }}
          animate={{ 
            height: barHeights[2],
            opacity: isActive ? 1 : isThinking ? 0.8 : 0.5
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
      
      {/* Name of the opponent displayed below the bars */}
      <span className="text-black dark:text-white text-sm font-medium">
        {opponentName}
        <span className="ml-1 text-xs font-light text-gray-600 dark:text-gray-400">
          {isActive ? "speaking..." : isThinking ? "thinking..." : "idle"}
        </span>
      </span>
    </div>
  );
}
