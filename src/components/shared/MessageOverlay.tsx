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
  variant = 'info',
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

  // Variant-specific styles
  const variantStyles = {
    info: 'border-blue-100 dark:border-blue-900/40',
    warning: 'border-amber-100 dark:border-amber-900/40',
    tip: 'border-emerald-100 dark:border-emerald-900/40',
    rule: 'border-violet-100 dark:border-violet-900/40'
  };
  
  const iconVariants = {
    info: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    ),
    warning: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 dark:text-amber-400">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    tip: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 dark:text-emerald-400">
        <path d="M12 20v-6M9 4a3 3 0 013-3 3 3 0 013 3c0 2-3 3-3 8h0"></path>
        <circle cx="12" cy="17" r="0.5"></circle>
      </svg>
    ),
    rule: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500 dark:text-violet-400">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
    )
  };
  
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
