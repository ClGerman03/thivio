'use client';

import { useState } from 'react';
import InterventionPopup from './InterventionPopup';

/**
 * Example component demonstrating the usage of InterventionPopup
 */
export default function InterventionExample() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  
  const openPopup = () => {
    setIsPopupVisible(true);
  };
  
  const closePopup = () => {
    setIsPopupVisible(false);
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <button
        onClick={openPopup}
        className="px-4 py-2 rounded-md bg-gray-800 dark:bg-gray-700 
                 text-white font-light hover:bg-gray-700 dark:hover:bg-gray-600 
                 transition-colors"
      >
        View Intervention
      </button>
      
      <InterventionPopup
        isVisible={isPopupVisible}
        onClose={closePopup}
        text="This philosophical concept challenges conventional wisdom about the nature of reality and perception."
      />
    </div>
  );
}
