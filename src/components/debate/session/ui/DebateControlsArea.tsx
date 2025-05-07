'use client';

import { useState } from 'react';
import DebateTopicsList from '../controls/DebateTopicsList';
import DebateTurnStructure from '../controls/DebateTurnStructure';
import DebateReviewButton from '../controls/DebateReviewButton';
import ConfirmEndDebateDialog from './ConfirmEndDebateDialog';
import { motion, AnimatePresence } from 'framer-motion';

interface DebateControlsAreaProps {
  /**
   * List of debate topics
   */
  topics: string[];
  
  /**
   * Handler for topic selection
   */
  onTopicSelect: (topic: string, index: number) => void;
  
  /**
   * Total number of turns per topic
   */
  turnCount: number;
  
  /**
   * Function to generate debate summary
   */
  onGenerateSummary: () => Promise<string>;
  
  /**
   * Function to end the debate
   */
  onDebateEnd: () => void;
}

/**
 * Component organizing all debate control elements
 */
export default function DebateControlsArea({
  topics,
  onTopicSelect,
  turnCount,
  onGenerateSummary,
  onDebateEnd
}: DebateControlsAreaProps) {
  // Estado para controlar si el menú de controles está desplegado
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  // Estado para controlar el diálogo de confirmación
  const [isEndDialogOpen, setIsEndDialogOpen] = useState<boolean>(false);
  
  // Función para alternar la visibilidad del menú
  const toggleControls = () => setIsControlsOpen(prev => !prev);
  
  // Funciones para el diálogo de confirmación
  const openEndDialog = () => setIsEndDialogOpen(true);
  const closeEndDialog = () => setIsEndDialogOpen(false);
  
  // Función para confirmar el fin del debate
  const confirmEndDebate = () => {
    closeEndDialog();
    onDebateEnd();
  };
  
  return (
    <div className="flex flex-col items-center pt-2 pb-6">
      <div className="flex justify-center gap-4 items-center">
        {/* Dropdown control button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleControls}
          className="px-4 py-1.5 text-xs text-blue-600/80 dark:text-blue-400/90 border border-blue-200/40 dark:border-blue-800/40 rounded-full hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1"
          aria-label="Toggle debate controls"
          aria-expanded={isControlsOpen}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
          <span>Controls</span>
          <svg 
            width="10" 
            height="10" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isControlsOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </motion.button>
        
        {/* End debate button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openEndDialog}
          className="px-4 py-1.5 text-xs text-red-500/70 dark:text-red-400/70 border border-red-200/40 dark:border-red-800/30 rounded-full hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors flex items-center gap-1"
          aria-label="End debate"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span>End</span>
        </motion.button>
      </div>
      
      {/* Controls dropdown menu */}
      <AnimatePresence>
        {isControlsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md mt-3 overflow-hidden"
          >
            <div className="py-3 px-3 rounded-lg flex flex-col gap-2">
              <div className="flex justify-center gap-2">
                <DebateTopicsList 
                  topics={topics} 
                  onTopicSelect={onTopicSelect} 
                />
                
                <DebateTurnStructure 
                  turnCount={turnCount} 
                />
                
                <DebateReviewButton 
                  onGenerateSummary={onGenerateSummary}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Confirmation dialog */}
      <ConfirmEndDebateDialog 
        isOpen={isEndDialogOpen}
        onClose={closeEndDialog}
        onConfirm={confirmEndDebate}
      />
    </div>
  );
}
