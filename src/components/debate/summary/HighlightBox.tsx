'use client';

import { motion } from 'framer-motion';

interface HighlightBoxProps {
  title?: string;
  content: string;
  icon?: React.ReactNode;
}

/**
 * Component to display debate highlights
 * with a minimalist design and rounded gray background
 */
export default function HighlightBox({ title, content, icon }: HighlightBoxProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2
      }
    }
  };
  
  // Process content to highlight keywords if they exist
  const processContent = (text: string) => {
    // This is a simple example - in a real implementation, we would use
    // more sophisticated parsing based on AI analysis
    
    // Split into sentences for better readability
    const sentences = text.split('. ').filter(s => s.trim() !== '');
    
    return (
      <>
        {sentences.map((sentence, index) => {
          // Highlight certain keywords
          const highlightWords = ['strongest', 'effective', 'excellent', 'contributions', 'topic'];
          
          let highlightedSentence = sentence;
          highlightWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            highlightedSentence = highlightedSentence.replace(
              regex, 
              match => `<span class="text-gray-900 dark:text-white font-medium">${match}</span>`
            );
          });
          
          return (
            <span key={index} className="block mb-1 last:mb-0">
              <span 
                dangerouslySetInnerHTML={{ __html: highlightedSentence + (index < sentences.length - 1 ? '.' : '') }} 
              />
            </span>
          );
        })}
      </>
    );
  };

  return (
    <motion.div
      className="bg-gray-100 dark:bg-gray-800/40 rounded-lg p-4 mb-4 shadow-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {title && (
        <div className="flex items-center mb-2">
          {icon && <span className="mr-2 text-gray-600 dark:text-gray-300">{icon}</span>}
          <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </h4>
        </div>
      )}
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {processContent(content)}
      </div>
    </motion.div>
  );
}
