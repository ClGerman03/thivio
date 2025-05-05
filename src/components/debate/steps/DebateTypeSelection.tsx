'use client';

import { motion } from 'framer-motion';

type DebateTypeSelectionProps = {
  selectedType: string;
  onSelectType: (type: string) => void;
};

type DebateType = {
  id: string;
  title: string;
  description: string;
};

export default function DebateTypeSelection({
  selectedType,
  onSelectType,
}: DebateTypeSelectionProps) {
  const debateTypes: DebateType[] = [
    {
      id: 'balanced',
      title: 'Balanced',
      description: 'Presentation of valid arguments from multiple perspectives on the topic',
    },
    {
      id: 'socratic',
      title: 'Socratic',
      description: 'Question-based analysis to explore the premises and conclusions of the topic',
    },
    {
      id: 'critical',
      title: 'Critical',
      description: 'Focus on finding inconsistencies and weaknesses in the main arguments',
    },
  ];

  return (
    <div className="max-w-xl py-2">
      <div className="space-y-4">
        {debateTypes.map((type) => (
          <motion.div
            key={type.id}
            className={`
              transition-all cursor-pointer p-3
              border border-gray-100 dark:border-gray-800 rounded-md
              ${selectedType === type.id 
                ? 'bg-gray-50 dark:bg-gray-800/50' 
                : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}
            `}
            whileHover={{ x: 2 }}
            onClick={() => onSelectType(type.id)}
          >
            <div className="flex items-start">
              <div>
                <h3 className={`text-sm font-medium mb-1 text-gray-800 dark:text-gray-200`}>
                  {type.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {type.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
