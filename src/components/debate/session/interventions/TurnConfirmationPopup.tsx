'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface TurnConfirmationPopupProps {
  /**
   * Whether the popup is visible
   */
  isVisible: boolean;
  
  /**
   * Function to confirm the action
   */
  onConfirm: () => void;
  
  /**
   * Function to cancel the action
   */
  onCancel: () => void;
  
  /**
   * Short text to display
   */
  text: string;
}

/**
 * Popup component for confirming turn changes
 * with two buttons: Confirm and Cancel
 */
export default function TurnConfirmationPopup({
  isVisible,
  onConfirm,
  onCancel,
  text
}: TurnConfirmationPopupProps) {
  
  // Demo image path - using the same as InterventionPopup
  const imageSrc = '/images/Thivio.png';
  
  return (
    <AnimatePresence>
      {isVisible && (
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
            onClick={onCancel}
          />
          
          {/* Popup content */}
          <motion.div
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg 
                      w-72 mx-4 overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image container - reduced size */}
            <div className="flex justify-center pt-6">
              <div className="w-20 h-20 relative overflow-hidden rounded-full">
                <Image
                  src={imageSrc}
                  alt="Turn confirmation"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            
            {/* Text container */}
            <div className="p-5 text-center">
              <p className="text-sm font-light text-gray-700 dark:text-gray-300 mb-6">
                {text}
              </p>
              
              <div className="flex justify-center space-x-4">
                {/* Confirm button */}
                <button
                  onClick={onConfirm}
                  className="px-5 py-1.5 text-xs bg-blue-600 text-white rounded-full
                          hover:bg-blue-700 transition-colors focus:outline-none"
                >
                  Confirmar
                </button>
                
                {/* Cancel button */}
                <button
                  onClick={onCancel}
                  className="px-5 py-1.5 text-xs bg-transparent border border-gray-300 dark:border-gray-700
                          text-gray-800 dark:text-gray-200 rounded-full
                          hover:bg-gray-100 dark:hover:bg-gray-800/50
                          transition-colors focus:outline-none"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
