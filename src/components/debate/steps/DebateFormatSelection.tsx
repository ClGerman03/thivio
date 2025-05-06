'use client';

import { useEffect } from 'react';

type DebateFormatSelectionProps = {
  selectedFormat: string;
  turnCount: number;
  onSelectFormat: (format: string) => void;
  onSelectTurnCount: (count: number) => void;
};

export default function DebateFormatSelection({
  selectedFormat,
  turnCount,
  onSelectFormat,
  onSelectTurnCount,
}: DebateFormatSelectionProps) {
  // Ensure turn-based format is selected on mount
  useEffect(() => {
    if (!selectedFormat) {
      onSelectFormat('turn-based');
    }
  }, [selectedFormat, onSelectFormat]);

  // Example debate flow for turn-based format
  const getTurnExample = (count: number) => {
    if (count === 3) {
      return [
        { id: 1, type: 'Initial Position', description: 'Present the main argument and establish key points' },
        { id: 2, type: 'Rebuttal or Counterargument', description: 'Challenge opposing views and defend initial position' },
        { id: 3, type: 'Closing Reflection', description: 'Summarize main points and provide concluding thoughts' }
      ];
    } else if (count === 5) {
      return [
        { id: 1, type: 'Initial Position', description: 'Present the main argument and establish key points' },
        { id: 2, type: 'Rebuttal or Counterargument', description: 'Challenge opposing views with evidence and reasoning' },
        { id: 3, type: 'Response to Rebuttal', description: 'Address critiques and reinforce original argument' },
        { id: 4, type: 'Final Expansion', description: 'Develop additional points and address remaining issues' },
        { id: 5, type: 'Closing Reflection', description: 'Synthesize discussion and present concluding insights' }
      ];
    } else { // Default to 4 turns
      return [
        { id: 1, type: 'Initial Position', description: 'Present the main argument and establish key points' },
        { id: 2, type: 'Rebuttal or Counterargument', description: 'Challenge opposing views with evidence and reasoning' },
        { id: 3, type: 'Response to Rebuttal', description: 'Address critiques and reinforce original argument' },
        { id: 4, type: 'Closing Reflection', description: 'Synthesize discussion and present concluding insights' }
      ];
    }
  };

  return (
    <div className="max-w-xl py-2">
      {/* Minimalist turn count selection */}
      <div className="mb-6">
        <h5 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
          How many turns per topic?
        </h5>
        <div className="flex gap-3">
          <button
            onClick={() => onSelectTurnCount(3)}
            className={`
              text-xs px-4 py-2 rounded-full transition-all
              ${turnCount === 3 
                ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800' 
                : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
            `}
          >
            3 Turns
          </button>
          <button
            onClick={() => onSelectTurnCount(5)}
            className={`
              text-xs px-4 py-2 rounded-full transition-all
              ${turnCount === 5 
                ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800' 
                : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
            `}
          >
            5 Turns
          </button>
        </div>
      </div>
              
      {/* Simplified debate structure preview */}
      <div className="space-y-3">
        {getTurnExample(turnCount).map((turn, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {index + 1}.
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {turn.type}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {turn.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
