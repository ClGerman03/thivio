'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type OpponentSelectionProps = {
  selectedOpponent: string;
  onSelectOpponent: (opponent: string) => void;
};

type Opponent = {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  debateStyle: string;
};

export default function OpponentSelection({
  selectedOpponent,
  onSelectOpponent,
}: OpponentSelectionProps) {
  // Estado para controlar la categoría de oponente seleccionada
  const [category, setCategory] = useState<'philosophers' | 'styles'>('styles');
  
  // Usamos useMemo para evitar recrear los arrays en cada renderizado
  const philosopherOpponents = useMemo<Opponent[]>(() => [
    {
      id: 'socrates',
      name: 'Socrates',
      description: 'The philosophical questioner who helps you explore your own beliefs and assumptions through critical inquiry.',
      strengths: [
        'Reveals hidden assumptions',
        'Challenges logical fallacies',
        'Promotes self-reflection'
      ],
      debateStyle: 'Uses systematic questioning to help you reach your own conclusions'
    },
    {
      id: 'aristotle',
      name: 'Aristotle',
      description: 'The analytical reasoner who employs structured thinking and empirical analysis to examine topics.',
      strengths: [
        'Provides systematic analysis',
        'Focuses on practical wisdom',
        'Identifies causal relationships'
      ],
      debateStyle: 'Organizes arguments into categories and draws on examples to support claims'
    },
    {
      id: 'kant',
      name: 'Kant',
      description: 'The thorough rationalist who evaluates arguments based on their logical consistency and ethical implications.',
      strengths: [
        'Evaluates ethical frameworks',
        'Explores universal principles',
        'Examines duties and obligations'
      ],
      debateStyle: 'Applies rigorous logical analysis to determine universal principles'
    }
  ], []);
  
  const styleOpponents = useMemo<Opponent[]>(() => [
    {
      id: 'analytical',
      name: 'Analytical Style',
      description: 'A methodical approach that deconstructs arguments with logic and empirical evidence.',
      strengths: [
        'Evidence-based reasoning',
        'Structured analysis',
        'Precise communication'
      ],
      debateStyle: 'Combines analytical precision with practical examples from diverse fields'
    },
    {
      id: 'creative',
      name: 'Creative Style',
      description: 'An innovative approach that connects concepts in unique ways and presents information through compelling narratives.',
      strengths: [
        'Lateral thinking',
        'Engaging storytelling',
        'Novel perspectives'
      ],
      debateStyle: 'Uses narratives and analogies to illuminate complex ideas in accessible ways'
    },
    {
      id: 'pragmatic',
      name: 'Pragmatic Style',
      description: 'A practical approach focused on real-world implications and actionable solutions.',
      strengths: [
        'Solution-oriented thinking',
        'Practical assessment',
        'Result-focused arguments'
      ],
      debateStyle: 'Focuses on actionable insights and testing ideas through practical application'
    }
  ], []);
  
  // Asegurarnos de que siempre haya un oponente seleccionado al cargar el componente
  useEffect(() => {
    // Si no hay oponente seleccionado, seleccionar el primero de la categoría actual
    if (!selectedOpponent) {
      const defaultOpponent = category === 'philosophers' 
        ? philosopherOpponents[0].id 
        : styleOpponents[0].id;
      onSelectOpponent(defaultOpponent);
    } else {
      // Verificar si el oponente seleccionado pertenece a la categoría activa
      const opponentExists = (
        category === 'philosophers' 
          ? philosopherOpponents 
          : styleOpponents
      ).some(opp => opp.id === selectedOpponent);
      
      // Si el oponente no existe en la categoría actual, seleccionar el primero
      if (!opponentExists) {
        const newOpponent = category === 'philosophers'
          ? philosopherOpponents[0].id
          : styleOpponents[0].id;
        onSelectOpponent(newOpponent);
      }
    }
  }, [category, selectedOpponent, onSelectOpponent, philosopherOpponents, styleOpponents]);

  // Determinar los oponentes actuales basados en la categoría seleccionada
  const opponents = category === 'philosophers' ? philosopherOpponents : styleOpponents;
  
  // Encontrar el oponente seleccionado actual para mostrar sus detalles
  const currentOpponent = useMemo(() => {
    return [...philosopherOpponents, ...styleOpponents].find(opp => opp.id === selectedOpponent);
  }, [selectedOpponent, philosopherOpponents, styleOpponents]);

  return (
    <div className="w-full max-w-xl py-4">
      {/* Selector de categoría de oponentes */}
      <div className="flex rounded-md bg-white dark:bg-gray-900 p-[1px] mb-6">
        <button
          onClick={() => setCategory('styles')}
          className={`flex-1 text-[11px] py-2 px-3 transition-colors ${category === 'styles'
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium'
            : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          Debate Styles
        </button>
        <button
          onClick={() => setCategory('philosophers')}
          className={`flex-1 text-[11px] py-2 px-3 transition-colors ${category === 'philosophers'
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium'
            : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          Historical Philosophers
        </button>
      </div>
      
      {/* Tarjetas de oponentes */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`category-${category}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {opponents.map((opponent) => (
          <motion.div
            key={opponent.id}
            className={`
              aspect-square rounded-lg cursor-pointer overflow-hidden
              border transition-all
              ${selectedOpponent === opponent.id 
                ? 'border-gray-400 dark:border-gray-500 shadow-md' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
            `}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectOpponent(opponent.id)}
          >
            <div className="w-full h-full flex flex-col">
              <div className={`
                flex-grow flex items-center justify-center p-2
                ${selectedOpponent === opponent.id 
                  ? 'bg-gray-50 dark:bg-gray-800/50' 
                  : 'bg-white/60 dark:bg-gray-800/30'}
              `}>
                <h3 className="text-base font-medium text-center text-gray-700 dark:text-gray-300">
                  {opponent.name}
                </h3>
              </div>
            </div>
          </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      
      {/* Detalles del oponente seleccionado */}
      <AnimatePresence mode="wait">
        {currentOpponent && (
          <motion.div
            key={currentOpponent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4"
          >
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentOpponent.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentOpponent.description}
              </p>
            </div>
            
            <div className="mb-3">
              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Strengths:
              </h5>
              <div className="flex flex-wrap gap-2">
                {currentOpponent.strengths.map((strength, index) => (
                  <div 
                    key={`${currentOpponent.id}-strength-${index}`}
                    className="text-xs px-2 py-1 bg-white/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-md"
                  >
                    {strength}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Debate style:
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                {currentOpponent.debateStyle}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
