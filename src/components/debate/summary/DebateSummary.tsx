'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDebateSummary } from '@/hooks/useDebateSummary';
import { saveDebateSummary, getDebateSummaryByDebateId } from '@/services/debateSummaryService';
import SkillsRadarChart from './SkillsRadarChart';
import FeedbackSections from './FeedbackSections';
// Importamos los datos de prueba para depuración
// Nota: Se eliminó la dependencia de datos de prueba

// Definimos interfaces para los datos utilizados en el componente
interface DebateConfigSummary {
  id?: string;            // ID único del debate
  topic?: string;         // Tema principal (para compatibilidad)
  topics?: string[];      // Array de tópicos del debate
  debateType: string;     // Tipo de debate
  userRole: string;       // Rol del usuario
  learningId?: string;    // ID del learning asociado
  debateName?: string;    // Nombre del debate
}

interface SkillData {
  skill: string;
  value: number;
}

interface SummaryData {
  score: number;
  strengths: string;
  weaknesses: string;
  highlights: string;
  recommendations: string;
  skills: SkillData[];
}

type DebateSummaryProps = {
  debateConfig: {
    id?: string;           // ID del debate
    topic?: string;        // Mantenemos por compatibilidad
    topics?: string[];     // Array de tópicos del debate
    debateType: string;    // Tipo de debate 
    userRole: string;      // Rol del usuario
    learningId?: string;   // ID del learning asociado
    debateName?: string;   // Nombre del debate
  };
  debateHistory?: Array<{
    id: string;
    speaker: 'user' | 'opponent';
    content: string;
    topic: string;
    turnType: string;
    timestamp: number;
  }>; // Historial del debate pasado desde DebateSession
  onFinish: () => void;
};

// Animation variants
const loadingVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeIn" } }
};

// Default data when no summary is available
const defaultSummaryData = {
  score: 0,
  strengths: 'No debate data available for analysis.',
  weaknesses: 'No debate data available for analysis.',
  highlights: 'Start a debate to see key moments analysis.',
  recommendations: 'Start a debate to get AI-powered feedback.',
  skills: [
    { skill: 'Content', value: 0 },
    { skill: 'Structure', value: 0 },
    { skill: 'Style', value: 0 },
    { skill: 'Arguments', value: 0 },
    { skill: 'Response', value: 0 },
    { skill: 'Clarity', value: 0 }
  ]
};



// Internal components for each section
/**
 * Displays the debate summary header with score and topic information
 * in a minimalist, modern design
 */
function SummaryHeader({ debateConfig, score }: { debateConfig: DebateConfigSummary; score: number }) {
  // Get topic information to display
  const topicCount = debateConfig.topics ? debateConfig.topics.length : 0;
  const singleTopic = debateConfig.topic || (topicCount === 1 && debateConfig.topics ? debateConfig.topics[0] : null);
  const displayTopics = debateConfig.topics || [];
  
  // Create visually distinct top topics (show max 3 in header)
  const topTopics = displayTopics.slice(0, 3);
  const hasMoreTopics = displayTopics.length > 3;
  
  return (
    <div className="bg-white dark:bg-gray-800/30 rounded-lg shadow-sm overflow-hidden mb-6">
      {/* Header with title and type info */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800/60 rounded-md mr-2">
                {debateConfig.debateType}
              </span>
              <span>{debateConfig.userRole}</span>
            </div>
          </div>
          
          {/* Score display - clean and minimal */}
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/60 rounded-lg px-4 py-2">
              <div className="text-3xl font-medium text-gray-800 dark:text-gray-200">{score}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Overall Score</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Topics section with modern styling */}
      <div className="border-t border-gray-100 dark:border-gray-700/30 px-5 py-3 bg-gray-50 dark:bg-gray-800/20">
        <div className="flex flex-wrap items-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">Topics:</span>
          
          {displayTopics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {topTopics.map((topic: string, index: number) => (
                <span 
                  key={index} 
                  className="inline-flex px-2 py-0.5 rounded-md text-xs bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300"
                >
                  {topic}
                </span>
              ))}
              {hasMoreTopics && (
                <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">
                  +{displayTopics.length - 3} more
                </span>
              )}
            </div>
          ) : singleTopic ? (
            <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
              {singleTopic}
            </span>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              None specified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}




function ActionButtons({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="mt-8 flex justify-center">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="px-6 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
        onClick={onFinish}
      >
        Back to Dashboard
      </motion.button>
    </div>
  );
}

function DebateSummary({ debateConfig, debateHistory, onFinish }: DebateSummaryProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  
  // Usar solo el historial real de debate
  const effectiveHistory = debateHistory && debateHistory.length > 0 
    ? debateHistory 
    : undefined;
  
  // Configuración efectiva para el debate
  const effectiveConfig = {
    topic: debateConfig.topic || '',
    topics: debateConfig.topics && debateConfig.topics.length > 0 ? debateConfig.topics : [],
    positions: { 'user': debateConfig.userRole || 'estudiante', 'ai': 'opponent' },
    debateFormat: debateConfig.debateType || 'debate'
  };
  
  // Usar el hook real de useDebateSummary
  const { 
    generateSummary, 
    // isAnalyzing: isGeneratingSummary,  // No utilizado actualmente
    // summaryData: hookSummaryData,      // No utilizado ya que usamos el estado local
    error: summaryError 
  } = useDebateSummary(effectiveConfig, effectiveHistory || []);
  
  // Loggear datos disponibles para debugging
  useEffect(() => {
    console.log(`DebateSummary: Preparando análisis con historial de ${effectiveHistory?.length || 0} mensajes`);
    
    if (effectiveHistory && effectiveHistory.length > 0) {
      console.log(`DebateSummary: Rango de tiempo del debate: ${new Date(effectiveHistory[0].timestamp).toLocaleTimeString()} - ${new Date(effectiveHistory[effectiveHistory.length-1].timestamp).toLocaleTimeString()}`);
    }
    
    if (summaryError) {
      console.error('DebateSummary: Error al generar el resumen:', summaryError);
    }
  }, [effectiveHistory, summaryError]);

  // Evitar bucles de renderizado
  const analysisCompletedRef = useRef(false);

  // Estado local para evitar múltiples análisis durante la vida del componente
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);
  
  // Intentar cargar un resumen existente al iniciar
  useEffect(() => {
    if (!debateConfig?.id) return;
    
    // Buscar si ya existe un resumen para este debate
    const savedSummary = getDebateSummaryByDebateId(debateConfig.id);
    if (savedSummary) {
      console.log(`DebateSummary: Resumen encontrado para debate ${debateConfig.id}, cargándolo desde localStorage`);
      setSummaryData(savedSummary.summaryData);
      setHasCompletedAnalysis(true);
      analysisCompletedRef.current = true;
      setIsAnalyzing(false);
    } else {
      console.log(`DebateSummary: No se encontró resumen para debate ${debateConfig.id}, se generará uno nuevo`);
    }
  }, [debateConfig?.id]);
  
  // Effect to analyze the debate and get the summary - Ejecutar solo una vez
  useEffect(() => {
    // Evitar que se ejecute múltiples veces 
    // Usamos tanto la ref como un estado para máxima protección
    if (analysisCompletedRef.current || hasCompletedAnalysis) {
      console.log('DebateSummary: Análisis ya completado, evitando llamada repetida');
      return;
    }

    const analyzeDebate = async () => {
      try {
        // Marcar que ya iniciamos el análisis para evitar bucles
        analysisCompletedRef.current = true;
        
        // Usamos el mismo historial efectivo que configuramos para el hook
        const historyToAnalyze = debateHistory || [];
        
        // Si tenemos historial, lo usamos para el análisis
        if (historyToAnalyze && historyToAnalyze.length > 0) {
          console.log(`DebateSummary: Analizando debate con ${historyToAnalyze.length} mensajes`);
          // Mostrar detalles limitados del historial para debugging
          console.log('Primeros 2 mensajes:', JSON.stringify(historyToAnalyze.slice(0, 2))?.substring(0, 300) + '...');
        } else {
          console.warn('DebateSummary: No se recibió historial de debate para análisis. Usando datos mock.');
        }
        
        // Get structured summary usando el historial (real o mock según el caso)
        console.log('DebateSummary: Iniciando análisis con Gemini...');
        
        // Medición del tiempo para diagnosticar performance
        const startTime = performance.now();
        const data = await generateSummary();
        const endTime = performance.now();
        
        // Validar que tenemos datos válidos
        if (!data) {
          throw new Error('No se recibieron datos válidos del análisis');
        }
        
        console.log(`DebateSummary: Análisis completado en ${(endTime - startTime).toFixed(0)}ms:`, {
          score: data.score,
          skillsCount: data.skills?.length || 0,
          hasStrengths: !!data.strengths,
          hasWeaknesses: !!data.weaknesses,
          hasHighlights: !!data.highlights
        });
          
        // Guardar los datos en el estado local del componente
        setSummaryData(data);
        
        // Guardar el resumen en localStorage si tenemos un ID de debate válido
        if (debateConfig?.id) {
          console.log(`DebateSummary: Preparando guardado para debate ${debateConfig.id} en localStorage`);
          
          // Preparar metadatos del debate
          const debateMetadata = {
            learningId: debateConfig.learningId || '',
            debateName: debateConfig.debateName || 'Debate sin nombre',
            debateTopic: debateConfig.topic || (debateConfig.topics && debateConfig.topics.length > 0 ? debateConfig.topics[0] : 'Sin tema')
          };
          
          console.log('DebateSummary: Metadatos del debate:', debateMetadata);
          
          // Intentar guardar el resumen
          const savedSuccessfully = saveDebateSummary(
            data, 
            debateConfig.id,
            debateMetadata
          );
          
          if (savedSuccessfully) {
            console.log(`DebateSummary: Resumen guardado exitosamente en localStorage`);
            
            // Verificar que se guardó correctamente
            const savedSummary = getDebateSummaryByDebateId(debateConfig.id);
            if (savedSummary) {
              console.log('DebateSummary: Verificación exitosa - Resumen encontrado en localStorage');
            } else {
              console.warn('DebateSummary: Verificación fallida - No se encontró el resumen en localStorage después de guardarlo');
            }
          } else {
            console.error('DebateSummary: Error al guardar el resumen en localStorage');
          }
        } else {
          console.warn('DebateSummary: No se pudo guardar el resumen porque no hay ID de debate válido');
        }
        
        // Finish analysis y marcar como completado en ambos lugares
        setIsAnalyzing(false);
        setHasCompletedAnalysis(true);
      } catch (error) {
        console.error('Error en análisis de debate:', error);
        setIsAnalyzing(false);
        analysisCompletedRef.current = false;
        
        // Mensaje de error más amigable
        // alert('Hubo un problema al analizar el debate. Por favor, intenta nuevamente.'); // Comentado para evitar molestias durante las pruebas
      }
    };

    analyzeDebate();
    
    // Limpieza si se desmonta el componente
    return () => {
      analysisCompletedRef.current = false;
    };
  // Incluir dependencias necesarias
  }, [debateHistory, generateSummary, debateConfig, hasCompletedAnalysis]);

  const handleFinish = () => {
    // Call the original onFinish callback if needed
    if (onFinish) {
      onFinish();
    }
    
    // Navigate to dashboard
    router.push('/dashboard');
  };
  
  // Use summary data or default when not available
  const displayData = summaryData || defaultSummaryData;

  return (
    <div className="w-full max-w-4xl py-6 px-4 mx-auto">
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          // Minimalist loading state
          <motion.div 
            key="loading"
            className="flex flex-col items-center justify-center min-h-[60vh]"
            variants={loadingVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative h-12 w-12">
              <svg
                className="animate-spin h-12 w-12 text-gray-200 dark:text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Our AI is examining your contributions and preparing feedback...
              </p>
            </div>
          </motion.div>
        ) : (
          // Main summary content with three clearly defined sections
          <motion.div
            key="content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-6"
          >
            {/* SECTION 1: Header with score and debate info */}
            <SummaryHeader 
              debateConfig={debateConfig} 
              score={displayData.score} 
            />
            
            {/* SECTION 2: Skills radar chart */}
            <SkillsRadarChart skills={displayData.skills} />
            
            {/* SECTION 3: Feedback sections with all comments and highlights */}
            <FeedbackSections data={displayData} />
            
            {/* Action buttons */}
            <ActionButtons onFinish={handleFinish} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DebateSummary;
