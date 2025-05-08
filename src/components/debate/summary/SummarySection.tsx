'use client';

import { motion } from 'framer-motion';

type SummarySectionProps = {
  title: string;
  content: string;
};

export default function SummarySection({ title, content }: SummarySectionProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.15
      }
    }
  };

  return (
    <motion.div 
      className="mb-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-xs uppercase tracking-wide font-medium text-gray-700 dark:text-gray-400 mb-1.5">
        {title}
      </h3>
      <p className="text-sm font-light text-gray-600 dark:text-gray-300 leading-relaxed">
        {content}
      </p>
    </motion.div>
  );
}
