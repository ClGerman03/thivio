'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveDebateConfig, loadDebateConfig, generateDebateSessionData } from '@/services/debateService';
import TopicSelection from '@/components/debate/steps/TopicSelection';
import InitialPositionSelection from '@/components/debate/steps/InitialPositionSelection';
import OpponentSelection from '@/components/debate/steps/OpponentSelection';
import DebateFormatSelection from '@/components/debate/steps/DebateFormatSelection';
import DebateSession from '@/components/debate/session/DebateSession';
import { DebateSummary } from '@/components/debate/summary';

type DebateWorkflowProps = {
  documentId: string;
  onStepChange?: (stepInfo: StepInfo) => void;
};

export type DebateConfig = {
  topic: string;
  topics: string[];
  debateFormat: string;
  turnCount: number;
  opponent: string;
  positions: Record<string, string>;
  timestamp?: number; // Opcional: timestamp para seguimiento
};

export type StepInfo = {
  index: number;
  type: string;
  title: string;
  description: string;
};

const steps = ['topic', 'initialPosition', 'opponent', 'debateFormat'];

const stepInfo: Record<string, {title: string, description: string}> = {
  topic: {
    title: 'Select topics',
    description: 'Choose the topics you want to debate'
  },
  initialPosition: {
    title: 'Initial positions',
    description: 'Define your starting perspective on each topic'
  },
  opponent: {
    title: 'Select opponent',
    description: 'Choose a philosopher to debate with'
  },
  debateFormat: {
    title: 'Select debate format',
    description: 'Choose how the debate will be structured'
  }
};

export default function DebateWorkflow({ onStepChange }: DebateWorkflowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Cargar la configuración del debate desde localStorage o usar valores por defecto
  const [debateConfig, setDebateConfig] = useState<DebateConfig>(loadDebateConfig() || {
    topic: '',
    topics: [], // Array de tópicos
    debateFormat: 'turn-based', // Default format
    turnCount: 3, // Default number of turns
    opponent: '', // AI opponent
    positions: {}, // User's positions on each topic
  });
  const [debateStarted, setDebateStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const currentStep = steps[currentStepIndex];

  // Notificar cambio de paso
  useEffect(() => {
    if (onStepChange) {
      const currentStepType = steps[currentStepIndex];
      const info = stepInfo[currentStepType];
      
      onStepChange({
        index: currentStepIndex,
        type: currentStepType,
        title: info.title,
        description: info.description
      });
    }
  }, [currentStepIndex, onStepChange]);

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const updateDebateConfig = <T extends keyof DebateConfig>(key: T, value: DebateConfig[T]) => {
    const updatedConfig = { ...debateConfig, [key]: value };
    setDebateConfig(updatedConfig);
    // Persistir la configuración actualizada
    saveDebateConfig(updatedConfig);
  };

  const handleSubmit = () => {
    // Guardar la configuración final del debate
    saveDebateConfig(debateConfig);
    console.log('Starting debate with configuration:', debateConfig);
    
    // Iniciar el debate
    setDebateStarted(true);
    
    // Actualizar el título y descripción para la sesión activa
    if (onStepChange && debateConfig.topics && debateConfig.topics.length > 0) {
      onStepChange({
        index: -1, // Índice especial para la sesión activa
        type: 'session',
        title: debateConfig.topics[0], // Tomamos el primer tema como título principal
        description: `${debateConfig.debateFormat} format • ${debateConfig.topics.length} topics`
      });
    }
  };
  
  const handleDebateEnd = () => {
    // Mostrar el resumen en lugar de finalizar completamente
    console.log('Debate ended, showing summary');
    setShowSummary(true);
  };
  
  const handleSummaryFinish = () => {
    // Finalizar todo el proceso y volver al inicio
    console.log('Summary finished, returning to start');
    setShowSummary(false);
    setDebateStarted(false);
    
    // Opcionalmente, resetear la configuración si quieres que el usuario empiece de cero
    setDebateConfig({
      topic: '',
      topics: [],
      debateFormat: 'turn-based',
      turnCount: 3,
      opponent: '',
      positions: {},
    });
    setCurrentStepIndex(0);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 'topic':
        // Validar que el usuario ha ingresado al menos un tópico
        return debateConfig.topics.length > 0 || !!debateConfig.topic.trim();
      case 'initialPosition':
        // Validar que el usuario ha ingresado posiciones para todos los tópicos
        return debateConfig.topics.every(topic => 
          debateConfig.positions[topic] && debateConfig.positions[topic].trim().length > 0
        );
      case 'opponent':
        // Validar que el usuario ha seleccionado un oponente
        return !!debateConfig.opponent;
      case 'debateFormat':
        // Validar que se ha seleccionado un formato de debate
        return !!debateConfig.debateFormat && debateConfig.turnCount > 0;
      default:
        return true;
    }
  };

  return (
    <div className="w-full max-w-2xl px-4">
      {!debateStarted ? (
        // Configuration workflow
        <>
          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px] text-left"
            >
              {currentStep === 'topic' && (
                <TopicSelection 
                  topics={debateConfig.topics}
                  onTopicsChange={(topics: string[]) => updateDebateConfig('topics', topics)}
                />
              )}
              
              {currentStep === 'initialPosition' && (
                <InitialPositionSelection 
                  topics={debateConfig.topics}
                  positions={debateConfig.positions}
                  onPositionsChange={(positions: Record<string, string>) => updateDebateConfig('positions', positions)}
                />
              )}
              

              
              {currentStep === 'opponent' && (
                <OpponentSelection 
                  selectedOpponent={debateConfig.opponent}
                  onSelectOpponent={(opponent: string) => updateDebateConfig('opponent', opponent)}
                />
              )}
              
              {currentStep === 'debateFormat' && (
                <DebateFormatSelection
                  selectedFormat={debateConfig.debateFormat}
                  turnCount={debateConfig.turnCount}
                  onSelectFormat={(format) => updateDebateConfig('debateFormat', format)}
                  onSelectTurnCount={(count) => updateDebateConfig('turnCount', count)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-end gap-4 mt-10">
            {currentStepIndex > 0 && (
              <motion.button
                onClick={goToPreviousStep}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors focus:outline-none px-3 py-1.5"
                whileHover={{ x: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                back
              </motion.button>
            )}
            
            {currentStepIndex < steps.length - 1 ? (
              <motion.button
                onClick={goToNextStep}
                disabled={!validateStep()}
                className={`text-xs px-4 py-1.5 rounded-full border transition-all focus:outline-none ${
                  !validateStep()
                    ? 'opacity-30 cursor-not-allowed text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700'
                    : 'text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-300'
                }`}
                whileHover={validateStep() ? { y: -1 } : undefined}
                whileTap={validateStep() ? { scale: 0.98 } : undefined}
              >
                continue
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={!debateConfig.debateFormat}
                className={`text-xs px-4 py-1.5 rounded-full border transition-all focus:outline-none ${
                  !debateConfig.debateFormat
                    ? 'opacity-30 cursor-not-allowed text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700'
                    : 'text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-300'
                }`}
                whileHover={debateConfig.debateFormat ? { y: -1 } : {}}
                whileTap={debateConfig.debateFormat ? { scale: 0.98 } : {}}
              >
                start debate
              </motion.button>
            )}
          </div>
        </>
      ) : (
        // Active debate session or summary
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {!showSummary ? (
              <motion.div
                key="debate-session"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DebateSession 
                  debateConfig={generateDebateSessionData(debateConfig)}
                  onDebateEnd={handleDebateEnd}
                />
              </motion.div>
            ) : (
              <motion.div
                key="debate-summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DebateSummary 
                  debateConfig={{
                    topic: debateConfig.topics && debateConfig.topics.length > 0 ? debateConfig.topics[0] : '',
                    debateType: 'turn-based', // El formato de debate estándar
                    userRole: Object.keys(debateConfig.positions)[0] || '' // Usamos la primera posición como rol del usuario
                  }}
                  onFinish={handleSummaryFinish}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
