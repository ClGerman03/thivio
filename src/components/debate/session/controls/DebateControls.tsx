'use client';

import { motion } from 'framer-motion';

type DebateControlsProps = {
  onPause: () => void;
  onEnd: () => void;
  isPaused: boolean;
};

export default function DebateControls({ onPause, onEnd, isPaused }: DebateControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPause}
        className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors focus:outline-none"
        aria-label={isPaused ? "Resume debate" : "Pause debate"}
      >
        {isPaused ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="5 3, 19 12, 5 21, 5 3" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        )}
      </button>

      <button
        onClick={onEnd}
        className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors focus:outline-none"
        aria-label="End debate"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>
      </button>
    </div>
  );
}
