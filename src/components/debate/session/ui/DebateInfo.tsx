'use client';

interface DebateInfoProps {
  /**
   * Current topic being discussed
   */
  currentTopic: string;
  
  /**
   * Index of the current topic (0-based)
   */
  currentTopicIndex: number;
  
  /**
   * Total number of topics in the debate
   */
  totalTopics: number;
  
  /**
   * Name of the current turn
   */
  currentTurnName: string;
  
  /**
   * Index of the current turn (0-based)
   */
  currentTurnIndex: number;
  
  /**
   * Total number of turns per topic
   */
  totalTurns: number;
}

/**
 * Component displaying current debate information (topic and turn)
 */
export default function DebateInfo({
  currentTopic,
  currentTopicIndex,
  totalTopics,
  currentTurnName,
  currentTurnIndex,
  totalTurns
}: DebateInfoProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-6 mt-3">
      <div className="text-center px-5 py-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl shadow-sm">
        {/* Topic information */}
        <div className="mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
            Current Topic ({currentTopicIndex + 1}/{totalTopics}):
          </span>
          <h3 className="text-base text-gray-700 dark:text-gray-200 font-medium mt-1">
            {currentTopic}
          </h3>
        </div>
        
        {/* Turn information */}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/30">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">{currentTurnName}</span>
            <span className="ml-1 opacity-70">
              (Turn {currentTurnIndex + 1} of {totalTurns})
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
