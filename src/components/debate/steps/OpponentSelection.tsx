'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Carousel from '@/components/ui/Carousel';

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
  imageSrc?: string; // URL de la imagen para el oponente
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
      debateStyle: 'Uses systematic questioning to help you reach your own conclusions',
      imageSrc: '/images/opponents/socrates.png'
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
      debateStyle: 'Organizes arguments into categories and draws on examples to support claims',
      imageSrc: '/images/opponents/aristotle.png'
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
      debateStyle: 'Applies rigorous logical analysis to determine universal principles',
      imageSrc: '/images/opponents/kant.png'
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
      debateStyle: 'Combines analytical precision with practical examples from diverse fields',
      imageSrc: '/images/opponents/analytical.png'
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
      debateStyle: 'Uses narratives and analogies to illuminate complex ideas in accessible ways',
      imageSrc: '/images/opponents/creative.png'
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
      debateStyle: 'Focuses on actionable insights and testing ideas through practical application',
      imageSrc: '/images/opponents/pragmatic.png'
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

  // Renderizar el contenido del carrusel
  const renderOpponentItem = (opponent: Opponent) => (
    <div 
      className="w-full max-w-[180px] h-[180px] rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/30 flex flex-col items-center justify-center cursor-pointer"
    >
      {opponent?.imageSrc ? (
        <div className="w-full h-3/4 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${opponent.imageSrc})` }}
          />
        </div>
      ) : null}
      <div className="w-full h-1/4 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-center text-gray-800 dark:text-gray-200">
          {opponent.name}
        </h3>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-xl py-4">
      {/* Selector de categoría de oponentes */}
      <div className="flex justify-center space-x-2 mb-6">
        <button
          onClick={() => setCategory('styles')}
          className={`text-[11px] py-1.5 px-4 rounded-full transition-colors ${category === 'styles'
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Debate Styles
        </button>
        <button
          onClick={() => setCategory('philosophers')}
          className={`text-[11px] py-1.5 px-4 rounded-full transition-colors ${category === 'philosophers'
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Historical Philosophers
        </button>
      </div>
      
      {/* Carrusel de oponentes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`category-${category}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentOpponent && (
            <Carousel 
              items={opponents}
              selectedItem={currentOpponent}
              onSelectItem={(opponent) => onSelectOpponent(opponent.id)}
              getItemId={(opponent) => opponent.id}
              renderItem={renderOpponentItem}
              className="mb-4"
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Detalles del oponente simplificados */}
      <AnimatePresence mode="wait">
        {currentOpponent && (
          <motion.div
            key={currentOpponent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 mb-2"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 text-left">
              {currentOpponent.description}
            </p>
            
            <div className="space-y-2">
              <div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {currentOpponent.strengths.map((strength, index) => (
                    <span 
                      key={`${currentOpponent.id}-strength-${index}`}
                      className="inline-block text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-sm"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-left">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Style:</span> {currentOpponent.debateStyle}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
