'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type UserVisualizerProps = {
  isActive: boolean;
  onActivate: () => void;
  transcribedText?: string;
  isTranscribing?: boolean;
};

export default function UserVisualizer({ 
  isActive, 
  onActivate, 
  transcribedText = '', 
  isTranscribing = false 
}: UserVisualizerProps) {
  // Estado para las animaciones de onda de audio
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  
  // Simular niveles de audio cuando está grabando
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        // Generar visualización de audio aleatoria
        const newLevels = audioLevels.map(() => Math.random() * 50 + 10);
        setAudioLevels(newLevels);
      }, 150);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, audioLevels]);
  
  return (
    <div className="flex flex-col justify-center items-center py-6">
      {/* Indicador de grabación */}
      {isActive && (
        <div className="mb-2 text-red-500 text-xs font-medium flex items-center">
          <span className="mr-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          Recording...
        </div>
      )}
      
      {/* Fixed size container to prevent layout shifts */}
      <div className="relative w-[120px] h-[120px] flex items-center justify-center">
        <motion.button
          className={`absolute rounded-full border-none focus:outline-none ${
            isActive 
              ? 'bg-red-500 shadow-lg' 
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
          
            {/* Visualización de ondas de audio durante la grabación */}
            {isActive && (
              <div className="flex items-center h-8 gap-[2px]">
                {audioLevels.map((level, index) => (
                  <motion.div
                    key={index}
                    className="w-1 bg-white dark:bg-gray-100 rounded-full"
                    initial={{ height: 5 }}
                    animate={{ height: level }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            )}
            {/* Microphone icon, solo se muestra cuando no estamos grabando */}
            {!isActive && (
              <motion.svg 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-white"
                animate={{ 
                  scale: isActive ? [1, 1.1, 1] : 1,
                }}
                transition={{ 
                  repeat: isActive ? Infinity : 0, 
                  duration: 1.5 
                }}
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <path d="M12 19v4"></path>
                <path d="M8 23h8"></path>
              </motion.svg>
            )}
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
      
      {/* Área de mostrar la transcripción */}
      <AnimatePresence>
        {(isTranscribing || transcribedText) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 w-full max-w-md"
          >
            {isTranscribing ? (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"></div>
                  <span className="text-gray-600 dark:text-gray-300">Transcribing audio...</span>
                </div>
              </div>
            ) : transcribedText ? (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {transcribedText}
                </p>
                <div className="mt-2 text-xs text-gray-500 italic">
                  Speech transcribed successfully. Ready to send.
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
