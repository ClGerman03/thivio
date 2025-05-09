'use client';

import { motion } from 'framer-motion';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { DebateWorkflow, StepInfo } from '@/components/debate';
import { loadDebateConfig } from '@/services/debateService';
import { DebateState } from '@/hooks/useDebateWorkflow';
import { STORAGE_KEYS } from '@/services/storageService';

// Interfaz para debates guardados
interface SavedDebate {
  id: string;
  isCompleted?: boolean;
  // Agrega aquí otras propiedades que puedan estar en un debate guardado
}

export default function DebatePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // El ID de la ruta es el ID del debate
  const debateId = params?.id as string;
  
  // El ID del learning viene como parámetro de consulta
  const [learningId, setLearningId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<StepInfo | null>(null);
  // Estado inicial del debate (se actualizará al cargar)
  const [debateState, setDebateState] = useState<DebateState | null>(null);
  
  // Capturar el learningId de los parámetros de consulta y verificar si el debate está completado
  useEffect(() => {
    const learningIdParam = searchParams.get('learningId');
    if (learningIdParam) {
      setLearningId(learningIdParam);
    }
    
    // Determinar el estado del debate
    if (debateId) {
      // Cargar configuración del debate directamente usando la función de servicio
      const savedConfig = loadDebateConfig(debateId);
      
      if (savedConfig && savedConfig.id === debateId) {
        // Determinar el estado basado en la configuración
        if (savedConfig.isCompleted) {
          setDebateState(DebateState.COMPLETED);
          console.log(`Debate ${debateId} cargado. Estado: COMPLETED`);
        } else if (savedConfig.debateName && savedConfig.topics && savedConfig.topics.length > 0 && 
                 savedConfig.opponent && savedConfig.debateFormat) {
          // Si tiene toda la configuración básica completada pero no está marcado como completado,
          // probablemente esté en sesión
          setDebateState(DebateState.SESSION);
          console.log(`Debate ${debateId} cargado. Estado: SESSION`);
        } else {
          // Si falta alguna configuración básica, probablemente esté en configuración
          setDebateState(DebateState.CONFIGURATION);
          console.log(`Debate ${debateId} cargado. Estado: CONFIGURATION`);
        }
      } else {
        // Si no hay configuración, está en fase inicial
        setDebateState(DebateState.CONFIGURATION);
        console.log(`Nuevo debate ${debateId} creado. Estado: CONFIGURATION`);
      }
      
      // Verificar también en debates guardados completados por compatibilidad
      try {
        const savedDebatesStr = localStorage.getItem(STORAGE_KEYS.SAVED_DEBATES);
        if (savedDebatesStr) {
          const savedDebates = JSON.parse(savedDebatesStr) as SavedDebate[];
          const matchingDebate = savedDebates.find((debate: SavedDebate) => debate.id === debateId);
          if (matchingDebate && matchingDebate.isCompleted) {
            setDebateState(DebateState.COMPLETED);
            console.log(`Debate ${debateId} encontrado en debates guardados. Estado: COMPLETED`);
          }
        }
      } catch (error) {
        console.error('Error al verificar el estado del debate en saved debates:', error);
      }
    }
    
    setIsLoading(false);
  }, [searchParams, debateId]);
  
  // El learningId es el sourceDocumentId para navegar de vuelta al learning
  const sourceDocumentId = learningId;

  // In a real app, we would fetch the debate data and its associated sourceDocumentId
  // For now, we'll skip the loading state since we don't need to fetch anything in this mock
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <motion.div 
        className="w-full max-w-3xl mx-auto p-6 pt-10 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-2">
          <Link 
            href={sourceDocumentId ? `/learn/${sourceDocumentId}` : '/dashboard'}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>{sourceDocumentId ? 'Back to document' : 'Back to dashboard'}</span>
          </Link>
        </div>
        
        <div className="my-6">
          <h1 className="text-2xl font-light text-gray-800 dark:text-white leading-tight mb-2">
            {currentStep ? currentStep.title : 'Debate Analysis'}
          </h1>
          {!currentStep ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
              Configure your debate experience
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
              {currentStep.description}
            </p>
          )}
        </div>
        
        {/* Debate Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-5 h-5 border border-gray-300 border-t-gray-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
              Loading debate...
            </p>
          </div>
        ) : (
          <motion.div
            className="bg-transparent py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="w-full max-w-2xl mx-auto">
              <DebateWorkflow 
                documentId={debateId} 
                learningId={learningId || ''}
                onStepChange={setCurrentStep}
                // Configurar el estado inicial según corresponda
                initialShowSummary={debateState === DebateState.COMPLETED}
                initialState={debateState || undefined}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
