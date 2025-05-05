'use client';

import { motion } from 'framer-motion';

interface TextExamplesProps {
  onSelectExample: (text: string) => void;
}

// Examples of informative learning topics
const examples = [
  {
    title: "Fractional Reserve Banking",
    text: "Fractional reserve banking is a system where banks hold only a fraction of deposits as reserves while lending out the remainder. This system creates credit expansion and money multiplication in the economy, but also introduces systemic risks during banking crises. The reserve ratio determines the balance between economic growth and financial stability."
  },
  {
    title: "AI Ethics",
    text: "Artificial intelligence raises ethical concerns regarding privacy, bias, accountability, and human autonomy. Machine learning systems trained on biased data can perpetuate and amplify societal inequalities. AI development requires establishing governance frameworks that balance innovation with safety protocols to ensure these technologies benefit humanity while minimizing potential harms."
  },
  {
    title: "Renewable Energy",
    text: "Renewable energy sources like solar, wind, and hydroelectric power provide sustainable alternatives to fossil fuels. Implementation challenges include intermittency issues, grid integration, storage limitations, and high initial capital costs. Despite these obstacles, technological advances are rapidly improving efficiency and reducing costs, making renewable energy increasingly competitive in global markets."
  }
];

export default function TextExamples({ onSelectExample }: TextExamplesProps) {
  return (
    <div className="mt-2">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Example topics to explore:
      </p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example, index) => (
          <motion.button
            key={index}
            onClick={() => onSelectExample(example.text)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/70 dark:hover:bg-gray-700/70 
                      text-gray-700 dark:text-gray-300 rounded-full transition-colors"
          >
            {example.title}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
