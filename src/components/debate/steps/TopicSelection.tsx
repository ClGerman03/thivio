'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type TopicSelectionProps = {
  documentId: string;
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
};

export default function TopicSelection({
  documentId,
  selectedTopic,
  onSelectTopic,
}: TopicSelectionProps) {
  const [topics, setTopics] = useState<Array<{ id: string; title: string; description: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch suggested topics from an API based on document analysis
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setTopics([
          {
            id: 'topic1',
            title: 'Benefits and risks of artificial intelligence',
            description: 'Analysis of the social and ethical impact of advanced AI systems.'
          },
          {
            id: 'topic2',
            title: 'Climate change and renewable energy',
            description: 'Debate on energy policies and their effectiveness against global warming.'
          },
          {
            id: 'topic3',
            title: 'Modern educational systems',
            description: 'Evaluation of pedagogical methods and their adaptation to current needs.'
          }
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [documentId]);

  return (
    <div className="max-w-xl py-2">
      {isLoading ? (
        <div className="flex justify-start py-8">
          <div className="w-5 h-5 border border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <motion.div
              key={topic.id}
              className={`
                transition-all cursor-pointer p-3
                border border-gray-100 dark:border-gray-800 rounded-md
                ${selectedTopic === topic.id 
                  ? 'bg-gray-50 dark:bg-gray-800/50' 
                  : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}
              `}
              whileHover={{ x: 2 }}
              onClick={() => onSelectTopic(topic.id)}
            >
              <div className="flex items-start">
                <div>
                  <h3 className={`text-sm font-medium mb-1 text-gray-800 dark:text-gray-200`}>
                    {topic.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {topic.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
