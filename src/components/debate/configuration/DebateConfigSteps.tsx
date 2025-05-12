'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DebateConfig, DEBATE_STEPS } from '@/hooks/useDebateWorkflow';
import TopicSelection from '@/components/debate/steps/TopicSelection';
import InitialPositionSelection from '@/components/debate/steps/InitialPositionSelection';
import OpponentSelection from '@/components/debate/steps/OpponentSelection';
import DebateFormatSelection from '@/components/debate/steps/DebateFormatSelection';
import DebateNameSelection from '@/components/debate/steps/DebateNameSelection';
import ContextSelection from '@/components/debate/steps/ContextSelection';

type DebateConfigStepsProps = {
  currentStepIndex: number;
  debateConfig: DebateConfig;
  validateStep: () => boolean;
  updateDebateConfig: <T extends keyof DebateConfig>(key: T, value: DebateConfig[T]) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleSubmit: () => void;
};

export default function DebateConfigSteps({
  currentStepIndex,
  debateConfig,
  validateStep,
  updateDebateConfig,
  goToNextStep,
  goToPreviousStep,
  handleSubmit
}: DebateConfigStepsProps) {
  const currentStep = DEBATE_STEPS[currentStepIndex];
  
  // Renderizar el paso actual de configuración
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'debateName':
        return (
          <DebateNameSelection 
            debateName={debateConfig.debateName} 
            onNameChange={(name) => updateDebateConfig('debateName', name)}
          />
        );
      case 'topic':
        return (
          <TopicSelection 
            topics={debateConfig.topics} 
            onTopicsChange={(topics) => updateDebateConfig('topics', topics)}
          />
        );
      case 'initialPosition':
        return (
          <InitialPositionSelection 
            topics={debateConfig.topics}
            positions={debateConfig.positions}
            onPositionsChange={(positions) => updateDebateConfig('positions', positions)}
          />
        );
      case 'opponent':
        return (
          <OpponentSelection 
            selectedOpponent={debateConfig.opponent}
            onSelectOpponent={(opponent) => updateDebateConfig('opponent', opponent)}
          />
        );
      case 'context':
        return (
          <ContextSelection 
            selectedLearningId={debateConfig.learningId}
            onSelectLearning={(learningId) => updateDebateConfig('learningId', learningId)}
          />
        );
      case 'debateFormat':
        return (
          <DebateFormatSelection 
            selectedFormat={debateConfig.debateFormat}
            turnCount={debateConfig.turnCount}
            onSelectFormat={(format: string) => updateDebateConfig('debateFormat', format)}
            onSelectTurnCount={(count: number) => updateDebateConfig('turnCount', count)}
          />
        );
      default:
        return <p>Step not implemented</p>;
    }
  };
  
  return (
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
          {renderCurrentStep()}
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
        
        {currentStepIndex < DEBATE_STEPS.length - 1 ? (
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
  );
}
