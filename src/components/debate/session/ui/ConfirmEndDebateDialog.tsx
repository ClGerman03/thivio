'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmEndDebateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmEndDebateDialog({
  isOpen,
  onClose,
  onConfirm
}: ConfirmEndDebateDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Semi-transparent backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 dark:bg-black/50"
            onClick={onClose}
          />
          
          {/* Popup content */}
          <motion.div
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg 
                      w-64 mx-4 overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon container */}
            <div className="flex justify-center pt-6">
              <div className="w-14 h-14 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                    className="text-red-500/70 dark:text-red-400/70" 
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
            </div>
            
            {/* Text container */}
            <div className="p-5 text-center">
              <p className="text-sm font-light text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to end this debate?
              </p>
              
              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs bg-transparent border border-gray-300 dark:border-gray-700
                          text-gray-800 dark:text-gray-200 rounded-full
                          hover:bg-gray-100 dark:hover:bg-gray-800/50
                          transition-colors focus:outline-none"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onConfirm}
                  className="px-4 py-1.5 text-xs bg-red-500/70 dark:bg-red-500/50 border border-red-500/50
                          text-white rounded-full
                          hover:bg-red-600/80 dark:hover:bg-red-600/60
                          transition-colors focus:outline-none"
                >
                  End
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
