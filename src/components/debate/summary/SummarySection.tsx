'use client';

import { motion } from 'framer-motion';

type SummarySectionProps = {
  title: string;
  content: string;
};

export default function SummarySection({ title, content }: SummarySectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">
        {title}
      </h3>
      <p className="text-sm font-light text-gray-600 dark:text-gray-400">
        {content}
      </p>
    </motion.div>
  );
}
