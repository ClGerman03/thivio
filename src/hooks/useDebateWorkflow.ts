import { useState, useCallback, useEffect } from 'react';
import { 
  saveDebateConfig,
  loadDebateConfig, 
  saveCompletedDebate
} from '@/services/debateService';

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
  isCompleted?: boolean; // Indica si el debate ha sido completado
};

export type StepInfo = {
  index: number;
  type: string;
  title: string;
  description: string;
};

// Estados posibles del debate
export enum DebateState {
  CONFIGURATION = 'configuration', // Fase de configuración inicial
  SESSION = 'session',            // Debate en curso
  COMPLETED = 'completed'         // Debate completado (resumen)
}

export type DebateWorkflowState = {
  currentStepIndex: number;
  debateConfig: DebateConfig;
  debateStarted: boolean;
  showSummary: boolean;
  // Estado actual del debate (calculado automáticamente)
  debateState: DebateState;
};

export type DebateWorkflowActions = {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateDebateConfig: <T extends keyof DebateConfig>(key: T, value: DebateConfig[T]) => void;
  handleSubmit: () => void;
  handleDebateEnd: () => void;
  handleSummaryFinish: () => void;
  validateStep: () => boolean;
  goToConfigMode: () => void; // Nueva acción para volver al modo de configuración
};

type UseDebateWorkflowProps = {
  documentId: string;
  learningId: string;
  onStepChange?: (stepInfo: StepInfo) => void;
  initialShowSummary?: boolean; // Permite iniciar directamente en el resumen
  initialState?: DebateState; // Estado inicial del debate (CONFIGURATION, SESSION, COMPLETED)
};

// Definición de los pasos y su información
export const DEBATE_STEPS = ['debateName', 'context', 'topic', 'initialPosition', 'opponent', 'debateFormat'];

export const STEP_INFO: Record<string, {title: string, description: string}> = {
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
  context: {
    title: 'Add context',
    description: 'Select learning content to enrich the debate'
  },
  debateFormat: {
    title: 'Select debate format',
    description: 'Choose how the debate will be structured'
  }
};

export function useDebateWorkflow({ 
  documentId, 
  learningId, 
  onStepChange,
  initialShowSummary = false,
  initialState
}: UseDebateWorkflowProps): [DebateWorkflowState, DebateWorkflowActions] {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Cargar la configuración del debate y determinar su estado
  const [debateConfig, setDebateConfig] = useState<DebateConfig>(() => {
    // Cargar la configuración específica para este debate usando su ID
    const savedConfig = loadDebateConfig(documentId);
    
    // Si tenemos una configuración guardada con datos
    if (savedConfig && savedConfig.id === documentId) {
      // Asegurarnos que el learningId esté actualizado
      return {
        ...savedConfig,
        learningId: learningId
      };
    }
    
    // Si no hay configuración guardada para este debate específico, crear una nueva
    return {
      id: documentId,
      topic: '',
      topics: [],
      debateFormat: 'turn-based',
      turnCount: 3,
      opponent: '',
      positions: {},
      debateName: '',
      learningId: learningId,
      isCompleted: false
    };
  });
  
  // Determinar el estado inicial basado en initialState o propiedades de debateConfig
  const isCompletedDebate = debateConfig.isCompleted === true;
  
  // Aplicar el estado inicial si se proporciona
  let initialDebateStarted = false;
  let initialShowSummaryState = false;
  
  if (initialState) {
    // Aplicar configuración según el estado inicial proporcionado
    switch (initialState) {
      case DebateState.CONFIGURATION:
        initialDebateStarted = false;
        initialShowSummaryState = false;
        break;
      case DebateState.SESSION:
        initialDebateStarted = true;
        initialShowSummaryState = false;
        break;
      case DebateState.COMPLETED:
        initialDebateStarted = true;
        initialShowSummaryState = true;
        break;
    }
  } else {
    // Comportamiento anterior si no se proporciona initialState
    // Si initialShowSummary es true o el debate está completado, iniciamos en el resumen
    initialDebateStarted = initialShowSummary || isCompletedDebate;
    initialShowSummaryState = initialShowSummary || isCompletedDebate;
  }
  
  const [debateStarted, setDebateStarted] = useState(initialDebateStarted);
  const [showSummary, setShowSummary] = useState(initialShowSummaryState);

  // Notificar cambio de paso
  useEffect(() => {
    if (onStepChange) {
      if (debateStarted && !showSummary) {
        // Cuando estamos en la fase de sesión activa
        const debateTitle = debateConfig.debateName && debateConfig.debateName.trim()
          ? debateConfig.debateName
          : (debateConfig.topics && debateConfig.topics.length > 0 ? debateConfig.topics[0] : 'Debate Session');
        
        onStepChange({
          index: -1, // Índice especial para la sesión activa
          type: 'session',
          title: debateTitle,
          description: `${debateConfig.debateFormat} format • ${debateConfig.topics.length} topics • vs ${debateConfig.opponent}`
        });
      } else if (isCompletedDebate || showSummary) {
        // Si el debate está completado, mostrar información de resumen
        const debateTitle = debateConfig.debateName && debateConfig.debateName.trim()
          ? debateConfig.debateName
          : (debateConfig.topics && debateConfig.topics.length > 0 ? debateConfig.topics[0] : 'Debate Summary');
        
        onStepChange({
          index: -2, // Índice especial para el resumen
          type: 'summary',
          title: debateTitle,
          description: `Completed debate summary • ${debateConfig.topics.length} topics • vs ${debateConfig.opponent}`
        });
      } else if (!debateStarted) {
        // Para la fase de configuración
        const currentStep = DEBATE_STEPS[currentStepIndex];
        onStepChange({
          index: currentStepIndex,
          type: currentStep,
          title: STEP_INFO[currentStep].title,
          description: STEP_INFO[currentStep].description
        });
      }
    }
  }, [currentStepIndex, debateStarted, onStepChange, showSummary, debateConfig, isCompletedDebate]);

  // Navegar al siguiente paso
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < DEBATE_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex]);

  // Navegar al paso anterior
  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  // Actualizar la configuración del debate
  const updateDebateConfig = useCallback(<T extends keyof DebateConfig>(key: T, value: DebateConfig[T]) => {
    // Prevenir actualizaciones redundantes que pueden causar bucles infinitos
    if (debateConfig[key] === value) {
      return; // Si el valor no ha cambiado, no hacemos nada
    }
    
    // Crear una nueva configuración con el valor actualizado
    const updatedConfig = { ...debateConfig, [key]: value };
    
    // Actualizar el estado local
    setDebateConfig(updatedConfig);
    
    // Persistir la configuración de forma segura
    if (updatedConfig.id) {
      // Usamos setTimeout para evitar que la persistencia bloquee el renderizado
      setTimeout(() => {
        saveDebateConfig(updatedConfig);
      }, 0);
    }
  }, [debateConfig]);

  // Iniciar el debate
  const handleSubmit = useCallback(() => {
    // Asegurarnos de que tanto el ID del debate como el ID del learning están incluidos
    const finalConfig = {
      ...debateConfig,
      id: documentId,
      learningId: learningId
    };
    
    // Guardar la configuración final del debate
    saveDebateConfig(finalConfig);
    
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
  }, [debateConfig, documentId, learningId, onStepChange]);

  // Finalizar el debate, marcarlo como completado y mostrar resumen
  const handleDebateEnd = useCallback(() => {
    // Marcar el debate como completado
    const updatedConfig = { ...debateConfig, isCompleted: true };
    setDebateConfig(updatedConfig);
    saveDebateConfig(updatedConfig);
    
    // Mostrar la pantalla de resumen
    setShowSummary(true);
  }, [debateConfig]);

  // Finalizar el resumen y resetear
  const handleSummaryFinish = useCallback(() => {
    // Guardar el debate completo en el almacenamiento antes de resetear
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
    
    setDebateConfig(emptyConfig);
    saveDebateConfig(emptyConfig);
  }, [debateConfig, learningId]);

  // Validar el paso actual
  const validateStep = useCallback(() => {
    const currentStep = DEBATE_STEPS[currentStepIndex];
    
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
      case 'context':
        // El paso de contexto siempre es válido, incluso si no se selecciona ninguno
        // porque se puede tener un debate sin contexto adicional
        return true;
      case 'debateFormat':
        return debateConfig.debateFormat !== '' && debateConfig.turnCount > 0;
      default:
        return true;
    }
  }, [currentStepIndex, debateConfig]);

  // Calcular el estado actual del debate basado en las variables existentes
  const getDebateState = (): DebateState => {
    if (!debateStarted) {
      return DebateState.CONFIGURATION;
    } else if (showSummary || debateConfig.isCompleted) {
      return DebateState.COMPLETED;
    } else {
      return DebateState.SESSION;
    }
  };

  // Estado actual
  const state: DebateWorkflowState = {
    currentStepIndex,
    debateConfig,
    debateStarted,
    showSummary,
    debateState: getDebateState()
  };

  // Función para volver al modo de configuración
  const goToConfigMode = useCallback(() => {
    // Volver al modo de configuración manteniendo los datos actuales
    setDebateStarted(false);
    setShowSummary(false);
  }, []);

  // Acciones disponibles
  const actions: DebateWorkflowActions = {
    goToNextStep,
    goToPreviousStep,
    updateDebateConfig,
    handleSubmit,
    handleDebateEnd,
    handleSummaryFinish,
    validateStep,
    goToConfigMode
  };

  return [state, actions];
}

export default useDebateWorkflow;
