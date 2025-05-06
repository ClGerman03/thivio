'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TopicSelectionProps = {
  topics?: string[];
  onTopicsChange: (topics: string[]) => void;
};

// Número máximo de temas permitidos
const MAX_TOPICS = 5;

// Tema de ejemplo predeterminado
const EXAMPLE_TOPIC = "The impact of artificial intelligence on future job markets and necessary educational reforms";

export default function TopicSelection({
  topics = [],
  onTopicsChange,
}: TopicSelectionProps) {
  const [newTopic, setNewTopic] = useState('');
  
  // Si no hay temas, inicializar con el tema de ejemplo
  useEffect(() => {
    // Solo inicializamos con el tema de ejemplo en la primera carga
    // Usamos una referencia para evitar que se ejecute en cada renderizado
    const isFirstRender = topics.length === 0;
    if (isFirstRender) {
      onTopicsChange([EXAMPLE_TOPIC]);
    }
  }, [topics.length, onTopicsChange]); // Añadimos las dependencias faltantes
  
  const handleAddTopic = () => {
    if (newTopic.trim() === '') return;
    if (topics.length >= MAX_TOPICS) return;
    
    // Aseguramos que topics sea un array antes de expandirlo
    const currentTopics = topics || [];
    onTopicsChange([...currentTopics, newTopic.trim()]);
    setNewTopic('');
  };
  
  const handleRemoveTopic = (index: number) => {
    // Aseguramos que topics sea un array antes de expandirlo
    const currentTopics = topics || [];
    const updatedTopics = [...currentTopics];
    updatedTopics.splice(index, 1);
    onTopicsChange(updatedTopics);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  return (
    <div className="w-full max-w-xl py-4">
      
      {/* Contador de temas */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Topics: {topics.length}/{MAX_TOPICS}
        </p>
      </div>
      
      {/* Input para añadir nuevo tema */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a debate topic..."
          className="flex-grow bg-white/50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 
                    rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all"
        />
        <motion.button
          onClick={handleAddTopic}
          disabled={newTopic.trim() === '' || topics.length >= MAX_TOPICS}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full 
                   disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          Add
        </motion.button>
      </div>
      
      {/* Lista de temas */}
      <div className="space-y-3">
        {topics.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">
            No topics added yet. Add your first topic above.
          </p>
        )}
        
        <AnimatePresence>
          {topics.map((topic, index) => (
            <motion.div
              key={`${topic}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3"
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                {index + 1}
              </div>
              <p className="flex-grow text-sm text-gray-700 dark:text-gray-300">{topic}</p>
              <button
                onClick={() => handleRemoveTopic(index)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
