'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type UserAvatarProps = {
  userInitial?: string;
  onLogout: () => void;
};

export default function UserAvatar({ userInitial = 'U', onLogout }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        avatarRef.current && 
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative">
      <motion.div
        ref={avatarRef}
        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {userInitial}
        </span>
      </motion.div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-100 dark:border-gray-700 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={onLogout}
            >
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
