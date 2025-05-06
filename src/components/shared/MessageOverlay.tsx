'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MessageOverlayProps {
  /**
   * Flag to control the visibility of the overlay
   */
  isVisible: boolean;
  
  /**
   * The content to display inside the overlay
   */
  children: ReactNode;
  
  /**
   * Callback function called when the overlay is dismissed
   */
  onDismiss?: () => void;
  
  /**
   * Auto-dismiss timeout in milliseconds. Set to 0 or undefined to disable.
   */
  autoDismissAfterMs?: number;
  
  /**
   * Additional CSS classes to apply to the overlay
   */
  className?: string;
  
  /**
   * Optional title for the message
   */
  title?: string;
  
  /**
   * Visual variant for different use cases
   */
  variant?: 'info' | 'warning' | 'tip' | 'rule';

  /**
   * Show a continue button at the bottom of the message
   */
  showContinueButton?: boolean;
  
  /**
   * Text for the continue button
   */
  continueButtonText?: string;
}

/**
 * A reusable semi-transparent overlay component for displaying messages, 
 * announcements, rules, or other temporary information.
 */
export default function MessageOverlay({
  isVisible,
  children,
  onDismiss,
  autoDismissAfterMs,
  className = '',
  title,
  // Comentamos variant ya que no la estamos utilizando en este componente
  // variant = 'info',
  showContinueButton = false,
  continueButtonText = 'Continue'
}: MessageOverlayProps) {
  const [isShowing, setIsShowing] = useState(isVisible);

  // Handle auto-dismiss timer
  useEffect(() => {
    setIsShowing(isVisible);
    
    let timer: NodeJS.Timeout | undefined;
    if (isVisible && autoDismissAfterMs && autoDismissAfterMs > 0) {
      timer = setTimeout(() => {
        setIsShowing(false);
        if (onDismiss) onDismiss();
      }, autoDismissAfterMs);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, autoDismissAfterMs, onDismiss]);

  // Eliminamos las definiciones de variantStyles e iconVariants que no se utilizan
  // Estas estructuras estaban destinadas a proporcionar estilos y íconos diferentes
  // según el tipo de mensaje, pero actualmente no se están utilizando
  
  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop with blur effect */}
          <motion.div 
            className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm" 
            onClick={onDismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Content directly on overlay */}
          <motion.div
            className="relative max-w-md w-full mx-auto z-10 text-center"
            initial={{ y: 20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring', bounce: 0.2 }}
          >
            {title && (
              <h3 className="font-normal text-base mb-2 text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            
            {/* Content */}
            <div className="text-sm font-light text-gray-800 dark:text-gray-200 leading-relaxed">
              {children}
            </div>
            
            {/* Continue button */}
            {showContinueButton && onDismiss && (
              <button
                onClick={onDismiss}
                className="mt-4 px-4 py-1.5 text-xs font-light bg-gray-100/70 dark:bg-gray-800/70 
                          hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-full
                          text-gray-700 dark:text-gray-300 transition-colors"
              >
                {continueButtonText}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
