'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type InitialPositionSelectionProps = {
  topics: string[];
  positions: Record<string, string>;
  onPositionsChange: (positions: Record<string, string>) => void;
};

export default function InitialPositionSelection({
  topics = [],
  positions = {},
  onPositionsChange,
}: InitialPositionSelectionProps) {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState('');
  
  // Obtenemos el tema actual
  const currentTopic = topics[currentTopicIndex] || '';
  
  // Calculamos si todos los temas tienen una postura
  const allTopicsHavePositions = topics.length > 0 && 
    topics.every(topic => positions[topic] && positions[topic].trim().length > 0);
    
  // Estado para controlar si se muestra el modo de edición o resumen
  const [showSummaryOnly, setShowSummaryOnly] = useState(false);
  
  // Cuando todos los temas tienen postura, mostrar directamente el resumen completo
  useEffect(() => {
    if (allTopicsHavePositions) {
      // Si todas las posturas están completas, mostramos el resumen
      setShowSummaryOnly(true);
      setCurrentTopicIndex(topics.length - 1);
    }
  }, [allTopicsHavePositions, topics.length]);
  
  // Función para volver al modo de edición
  const handleEditPositions = (index = 0) => {
    setShowSummaryOnly(false);
    setCurrentTopicIndex(index);
    const topic = topics[index];
    if (topic) {
      setCurrentPosition(positions[topic] || '');
    }
  };
  
  // Manejador para guardar la posición del tema actual y pasar al siguiente
  const handleSavePosition = () => {
    if (!currentTopic || !currentPosition.trim()) return;
    
    // Actualizar las posiciones
    const updatedPositions = {
      ...positions,
      [currentTopic]: currentPosition.trim()
    };
    
    onPositionsChange(updatedPositions);
    
    // Verificar si todos los temas tienen posturas después de esta actualización
    const allCompleted = topics.every(topic => 
      (topic === currentTopic) ? true : (updatedPositions[topic] && updatedPositions[topic].trim().length > 0)
    );
    
    // Pasar al siguiente tema si hay más
    if (currentTopicIndex < topics.length - 1) {
      setCurrentTopicIndex(currentTopicIndex + 1);
      // Establecer la posición actual al valor guardado del siguiente tema o vacío
      const nextTopic = topics[currentTopicIndex + 1];
      setCurrentPosition(nextTopic && updatedPositions[nextTopic] ? updatedPositions[nextTopic] : '');
    }
  };
  
  // Manejador para ir al tema anterior
  const handlePreviousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(currentTopicIndex - 1);
      // Establecer la posición actual al valor guardado del tema anterior
      const prevTopic = topics[currentTopicIndex - 1];
      setCurrentPosition(prevTopic && positions[prevTopic] ? positions[prevTopic] : '');
    }
  };
  
  // Manejador para ir directamente a un tema específico
  const handleGoToTopic = (index: number) => {
    if (index >= 0 && index < topics.length) {
      setCurrentTopicIndex(index);
      const topic = topics[index];
      setCurrentPosition(topic && positions[topic] ? positions[topic] : '');
    }
  };
  
  // Si no hay temas, mostrar un mensaje
  if (topics.length === 0) {
    return (
      <div className="w-full max-w-xl py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please select topics in the previous step before defining your positions.
        </p>
      </div>
    );
  }
  
  // Cuando se carga el componente, cargar la posición del tema actual si existe
  if (currentTopic && positions[currentTopic] && currentPosition === '') {
    setCurrentPosition(positions[currentTopic]);
  }
  
  return (
    <div className="w-full max-w-xl py-4">
      {!showSummaryOnly ? (
        // Modo de edición - Solo se muestra cuando no todas las posturas están completas
        <>
          {/* Indicador de progreso */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {topics.map((topic, index) => (
                <button
                  key={`progress-${index}`}
                  onClick={() => handleGoToTopic(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTopicIndex
                      ? 'bg-gray-700 dark:bg-gray-300 scale-125'
                      : positions[topic]
                        ? 'bg-gray-400 dark:bg-gray-600'
                        : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                  aria-label={`Go to topic ${index + 1}`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentTopicIndex + 1} of {topics.length}
            </p>
          </div>
          
          {/* Tema actual */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`topic-${currentTopicIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 mb-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Topic {currentTopicIndex + 1}:
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {currentTopic}
                </p>
              </div>
              
              <div className="mb-1">
                <label htmlFor="position" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your initial position:
                </label>
                <textarea
                  id="position"
                  value={currentPosition}
                  onChange={(e) => setCurrentPosition(e.target.value)}
                  placeholder="Briefly describe your initial thoughts or position on this topic..."
                  className="w-full border-none bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 resize-none text-xs text-gray-700 dark:text-gray-300 outline-none min-h-[100px] focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                  rows={4}
                />
              </div>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">
                This helps set the context for your debate. You can always refine your position during the discussion.
              </p>
            </motion.div>
          </AnimatePresence>
          
          {/* Botones de navegación */}
          <div className="flex justify-between mt-6">
            <motion.button
              onClick={handlePreviousTopic}
              disabled={currentTopicIndex === 0}
              whileHover={currentTopicIndex > 0 ? { x: -2 } : {}}
              whileTap={currentTopicIndex > 0 ? { scale: 0.98 } : {}}
              className={`text-xs px-4 py-1.5 rounded-full transition-colors ${
                currentTopicIndex === 0
                  ? 'opacity-0 cursor-default'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Previous
            </motion.button>
            
            <motion.button
              onClick={handleSavePosition}
              disabled={!currentPosition.trim()}
              whileHover={currentPosition.trim() ? { y: -1 } : {}}
              whileTap={currentPosition.trim() ? { scale: 0.98 } : {}}
              className={`text-xs px-4 py-1.5 rounded-full ${
                !currentPosition.trim()
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-800 text-white'
              }`}
            >
              {currentTopicIndex < topics.length - 1 ? 'Next topic' : 'Complete'}
            </motion.button>
          </div>
        </>
      ) : (
        // Modo de resumen - Cuando todas las posturas están completas
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your positions summary
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Review your positions before continuing
              </p>
            </div>
            <motion.button
              onClick={() => handleEditPositions()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-xs px-3 py-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              Edit positions
            </motion.button>
          </div>
          
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <motion.div 
                key={`summary-${index}`} 
                className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3"
                whileHover={{ x: 1 }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-medium mb-1">
                      {topic}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {positions[topic]}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleEditPositions(index)}
                    className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ml-2"
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
