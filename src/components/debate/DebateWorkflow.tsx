'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDebateWorkflow, StepInfo, DebateState } from '@/hooks/useDebateWorkflow';
import DebateConfigSteps from '@/components/debate/configuration/DebateConfigSteps';
import DebateSession from '@/components/debate/session/DebateSession';
import { DebateSummary } from '@/components/debate/summary';
import { generateDebateSessionData } from '@/services/debateService';

// Re-export StepInfo for easier access from other components
export type { StepInfo };

type DebateWorkflowProps = {
  documentId: string; // ID del debate (ahora este es el ID único del debate)
  learningId: string; // ID del learning relacionado
  onStepChange?: (stepInfo: StepInfo) => void;
  initialShowSummary?: boolean; // Permite iniciar directamente en el resumen
  initialState?: DebateState; // Estado inicial del debate (CONFIGURATION, SESSION, COMPLETED)
};

export default function DebateWorkflow({ documentId, learningId, onStepChange, initialShowSummary = false, initialState }: DebateWorkflowProps) {
  // Usar el hook personalizado para manejar toda la lógica del workflow
  const [{
    currentStepIndex,
    debateConfig,
    debateStarted,
    showSummary,
    debateHistory
    // debateState omitido por no usarse
  }, {
    goToNextStep,
    goToPreviousStep,
    updateDebateConfig,
    handleSubmit,
    handleDebateEnd,
    handleSummaryFinish,
    validateStep,
    goToConfigMode // Nueva acción para volver al modo de configuración
  }] = useDebateWorkflow({ 
    documentId, 
    learningId, 
    onStepChange, 
    initialShowSummary,
    initialState
  });

  return (
    <div className="w-full max-w-2xl px-4">
      {!debateStarted ? (
        // Fase de configuración usando el componente extraído
        <DebateConfigSteps 
          currentStepIndex={currentStepIndex}
          debateConfig={debateConfig}
          validateStep={validateStep}
          updateDebateConfig={updateDebateConfig}
          goToNextStep={goToNextStep}
          goToPreviousStep={goToPreviousStep}
          handleSubmit={handleSubmit}
        />
      ) : (
        // Fase activa del debate (sesión o resumen)
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
                  onConfigClick={goToConfigMode} // Usar la función del hook
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
                    id: documentId, // Pasar el ID del debate para guardado en localStorage
                    topic: debateConfig.topic || '',         // Mantener para compatibilidad
                    topics: debateConfig.topics || [],       // Pasar todos los tópicos
                    debateType: debateConfig.debateFormat,  // Usar el formato real configurado
                    userRole: Object.keys(debateConfig.positions)[0] || '', // Rol del usuario
                    learningId: learningId || '',  // Pasar el ID del learning asociado
                    debateName: debateConfig.debateName || '' // Pasar el nombre del debate
                  }}
                  debateHistory={debateHistory}            // Pasar el historial del debate
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
