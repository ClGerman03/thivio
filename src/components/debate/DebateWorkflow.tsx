'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveDebateConfig, loadDebateConfig, generateDebateSessionData, saveCompletedDebate } from '@/services/debateService';
import TopicSelection from '@/components/debate/steps/TopicSelection';
import InitialPositionSelection from '@/components/debate/steps/InitialPositionSelection';
import OpponentSelection from '@/components/debate/steps/OpponentSelection';
import DebateFormatSelection from '@/components/debate/steps/DebateFormatSelection';
import DebateNameSelection from '@/components/debate/steps/DebateNameSelection';
import DebateSession from '@/components/debate/session/DebateSession';
import { DebateSummary } from '@/components/debate/summary';

type DebateWorkflowProps = {
  documentId: string; // ID del debate (ahora este es el ID único del debate)
  learningId: string; // ID del learning relacionado
  onStepChange?: (stepInfo: StepInfo) => void;
};

export type DebateConfig = {
  id: string; // ID único del debate
  topic: string;
  topics: string[];
  debateFormat: string;
  turnCount: number;
  opponent: string;
  positions: Record<string, string>;
  debateName: string; // Nombre del debate
  timestamp?: number; // Opcional: timestamp para seguimiento
  learningId: string; // ID del learning relacionado
};

export type StepInfo = {
  index: number;
  type: string;
  title: string;
  description: string;
};

const steps = ['debateName', 'topic', 'initialPosition', 'opponent', 'debateFormat'];

const stepInfo: Record<string, {title: string, description: string}> = {
  debateName: {
    title: 'Name your debate',
    description: 'Give your debate a descriptive name'
  },
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

export default function DebateWorkflow({ documentId, learningId, onStepChange }: DebateWorkflowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Cargar la configuración del debate desde localStorage o usar valores por defecto
  // Usamos el documentId para cargar la configuración específica de este debate
  const [debateConfig, setDebateConfig] = useState<DebateConfig>(() => {
    // Cargar la configuración específica para este debate usando su ID
    const savedConfig = loadDebateConfig(documentId);
    console.log(`DebateWorkflow - Cargando configuración para debate ID: ${documentId}`);
    
    // Si tenemos una configuración guardada con datos
    if (savedConfig && savedConfig.id === documentId) {
      console.log('DebateWorkflow - Configuración existente encontrada');
      // Asegurarnos que el learningId esté actualizado
      return {
        ...savedConfig,
        learningId: learningId
      };
    }
    
    // Si no hay configuración guardada para este debate específico, crear una nueva
    console.log('DebateWorkflow - Creando nueva configuración de debate');
    return {
      id: documentId,
      topic: '',
      topics: [],
      debateFormat: 'turn-based',
      turnCount: 3,
      opponent: '',
      positions: {},
      debateName: '',
      learningId: learningId
    };
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

  // Optimizamos updateDebateConfig con useCallback para evitar recreaciones innecesarias
  // y prevenimos actualizaciones redundantes que pueden causar bucles
  const updateDebateConfig = useCallback(<T extends keyof DebateConfig>(key: T, value: DebateConfig[T]) => {
    // Prevenir actualizaciones redundantes que pueden causar bucles infinitos
    if (debateConfig[key] === value) {
      return; // Si el valor no ha cambiado, no hacemos nada
    }
    
    // Crear una nueva configuración con el valor actualizado
    const updatedConfig = { ...debateConfig, [key]: value };
    
    // Actualizar el estado local
    setDebateConfig(updatedConfig);
    
    // Persistir la configuración de forma segura (asegurándonos que tiene un ID)
    if (updatedConfig.id) {
      // Usamos setTimeout para evitar que la persistencia bloquee el renderizado
      setTimeout(() => {
        saveDebateConfig(updatedConfig);
      }, 0);
    }
  }, [debateConfig]); // Dependencias del useCallback

  const handleSubmit = () => {
    // Asegurarnos de que tanto el ID del debate como el ID del learning
    // están incluidos en la configuración
    const finalConfig = {
      ...debateConfig,
      id: documentId, // ID del debate
      learningId: learningId // ID del learning relacionado
    };
    
    // Guardar la configuración final del debate
    saveDebateConfig(finalConfig);
    console.log('Starting debate with configuration:', finalConfig);
    
    // Iniciar el debate
    setDebateStarted(true);
    
    // Actualizar el título y descripción para la sesión activa
    if (onStepChange) {
      // Usar el nombre del debate como título principal si está disponible
      const debateTitle = debateConfig.debateName && debateConfig.debateName.trim()
        ? debateConfig.debateName
        : (debateConfig.topics && debateConfig.topics.length > 0 ? debateConfig.topics[0] : 'Debate Session');
      
      onStepChange({
        index: -1, // Índice especial para la sesión activa
        type: 'session',
        title: debateTitle,
        description: `${debateConfig.debateFormat} format • ${debateConfig.topics.length} topics • vs ${debateConfig.opponent}`
      });
    }
  };
  
  const handleDebateEnd = () => {
    // Mostrar el resumen en lugar de finalizar completamente
    console.log('Debate ended, showing summary');
    setShowSummary(true);
  };
  
  const handleSummaryFinish = () => {
    // Guardar el debate completo en el almacenamiento antes de resetear
    // Usamos tanto el ID del debate como el ID del learning para mantener la relación
    saveCompletedDebate(debateConfig, learningId);
    
    // Al terminar el resumen, reseteamos todo el flujo
    setDebateStarted(false);
    setShowSummary(false);
    
    // Limpiamos la configuración del debate pero CONSERVAMOS el learningId
    const emptyConfig: DebateConfig = {
      id: '', // Limpiar ID para un posible nuevo debate
      topic: '',
      topics: [],
      debateFormat: 'turn-based',
      turnCount: 3,
      opponent: '',
      positions: {},
      debateName: '',
      learningId: learningId // Mantener el learningId para asegurar la relación
    };
    
    // Verificar y loggear para debug
    console.log('Reseteando configuración pero manteniendo learningId:', learningId);
    
    setDebateConfig(emptyConfig);
    saveDebateConfig(emptyConfig);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 'debateName':
        return debateConfig.debateName !== '';
      case 'topic':
        return debateConfig.topics.length > 0;
      case 'initialPosition':
        // Verificar que se haya seleccionado una posición para cada tópico
        return debateConfig.topics.every(topic => 
          Object.keys(debateConfig.positions).includes(topic));
      case 'opponent':
        return debateConfig.opponent !== '';
      case 'debateFormat':
        return debateConfig.debateFormat !== '' && debateConfig.turnCount > 0;
      default:
        return true;
    }
  };

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
