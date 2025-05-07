'use client';


import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface InterventionPopupProps {
  /**
   * Whether the popup is visible
   */
  isVisible: boolean;
  
  /**
   * Function to close the popup
   */
  onClose: () => void;
  
  /**
   * Short text to display
   */
  text: string;
}

/**
 * Simple popup component for displaying intervention information
 * with a centered image and short text
 */
export default function InterventionPopup({
  isVisible,
  onClose,
  text
}: InterventionPopupProps) {
  
  // Demo image path
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
            {/* Image container - reduced size */}
            <div className="flex justify-center pt-6">
              <div className="w-24 h-24 relative overflow-hidden rounded-full">
                <Image
                  src={imageSrc}
                  alt="Intervention image"
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
              
              {/* Accept button */}
              <button
                onClick={onClose}
                className="px-6 py-1.5 text-xs bg-transparent border border-gray-300 dark:border-gray-700
                         text-gray-800 dark:text-gray-200 rounded-full
                         hover:bg-gray-100 dark:hover:bg-gray-800/50
                         transition-colors focus:outline-none"
              >
                Accept
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
