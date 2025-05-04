'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopicSelection from '@/components/debate/steps/TopicSelection';
import DebateTypeSelection from '@/components/debate/steps/DebateTypeSelection';
import UserRoleSelection from '@/components/debate/steps/UserRoleSelection';
import DebateSession from '@/components/debate/session/DebateSession';
import { DebateSummary } from '@/components/debate/summary';

type DebateWorkflowProps = {
  documentId: string;
  onStepChange?: (stepInfo: StepInfo) => void;
};

export type DebateConfig = {
  topic: string;
  debateType: string;
  userRole: string;
};

export type StepInfo = {
  index: number;
  type: string;
  title: string;
  description: string;
};

const steps = ['topic', 'debateType', 'userRole'];

const stepInfo: Record<string, {title: string, description: string}> = {
  topic: {
    title: 'Select a central topic',
    description: 'Choose the main topic you want to debate'
  },
  debateType: {
    title: 'Choose an approach',
    description: 'Define how the discussion will be structured'
  },
  userRole: {
    title: 'Define your role',
    description: 'Establish how you will participate in the debate'
  }
};

export default function DebateWorkflow({ documentId, onStepChange }: DebateWorkflowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [debateConfig, setDebateConfig] = useState<DebateConfig>({
    topic: '',
    debateType: '',
    userRole: '',
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

  const updateDebateConfig = (key: keyof DebateConfig, value: string) => {
    setDebateConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // Start the debate with the current configuration
    console.log('Starting debate with configuration:', debateConfig);
    // In a real app, you would make an API call to save the configuration
    setDebateStarted(true);
    
    // Actualizar el título y descripción para la sesión activa
    if (onStepChange && debateConfig.topic) {
      onStepChange({
        index: -1, // Índice especial para la sesión activa
        type: 'session',
        title: debateConfig.topic,
        description: `${debateConfig.debateType} debate • ${debateConfig.userRole} role`
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
      debateType: '',
      userRole: '',
    });
    setCurrentStepIndex(0);
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
                  documentId={documentId}
                  selectedTopic={debateConfig.topic}
                  onSelectTopic={(topic: string) => updateDebateConfig('topic', topic)}
                />
              )}
              
              {currentStep === 'debateType' && (
                <DebateTypeSelection 
                  selectedType={debateConfig.debateType}
                  onSelectType={(type: string) => updateDebateConfig('debateType', type)}
                />
              )}
              
              {currentStep === 'userRole' && (
                <UserRoleSelection 
                  selectedRole={debateConfig.userRole}
                  onSelectRole={(role: string) => updateDebateConfig('userRole', role)}
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
                disabled={!debateConfig[steps[currentStepIndex] as keyof DebateConfig]}
                className={`text-xs px-4 py-1.5 rounded-full border transition-all focus:outline-none ${
                  !debateConfig[steps[currentStepIndex] as keyof DebateConfig]
                    ? 'opacity-30 cursor-not-allowed text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700'
                    : 'text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-300'
                }`}
                whileHover={debateConfig[steps[currentStepIndex] as keyof DebateConfig] ? { y: -1 } : {}}
                whileTap={debateConfig[steps[currentStepIndex] as keyof DebateConfig] ? { scale: 0.98 } : {}}
              >
                continue
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={!debateConfig.userRole}
                className={`text-xs px-4 py-1.5 rounded-full border transition-all focus:outline-none ${
                  !debateConfig.userRole
                    ? 'opacity-30 cursor-not-allowed text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700'
                    : 'text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-300'
                }`}
                whileHover={debateConfig.userRole ? { y: -1 } : {}}
                whileTap={debateConfig.userRole ? { scale: 0.98 } : {}}
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
                  debateConfig={debateConfig}
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
                  debateConfig={debateConfig}
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
