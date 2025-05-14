'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { analyzeDebateWithGemini, mockDebateAnalysis, DebateSummaryData } from '@/services/gemini';

// Input de prueba más extenso y realista para simular un debate completo
// Mantenemos esto como referencia pero ya no lo usamos directamente
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_INPUT = {
  topic: {
    name: "Energía nuclear vs renovable",
    userPosition: "Defiendo la energía nuclear"
  },
  opponent: {
    id: "analytical",
    name: "AI Opponent"
  },
  debateConfig: {
    id: `summary-test-${Date.now()}`,
    format: "turn-based",
    turnStructure: [
      {
        turnType: "Initial Position",
        turnIndex: 0
      },
      {
        turnType: "Rebuttal or Counterargument",
        turnIndex: 1
      },
      {
        turnType: "Closing Reflection",
        turnIndex: 2
      }
    ],
    totalTurns: 3,
    currentTurnIndex: 2,
    currentTurnType: "analysis" // Indicamos que estamos en modo análisis
  },
  context: {
    documents: [
      {
        text: "Renewable energy sources like solar, wind, and hydroelectric power provide sustainable alternatives to fossil fuels. Implementation challenges include intermittency issues, grid integration, storage limitations, and high initial capital costs. Despite these obstacles, technological advances are rapidly improving efficiency and reducing costs, making renewable energy increasingly competitive in global markets.",
        title: "Learning Content"
      }
    ],
    files: []
  },
  history: [
    {
      id: "msg1",
      speaker: "user" as const,
      content: "La energía nuclear produce electricidad constante sin depender del clima, a diferencia de la solar o eólica. Es el complemento perfecto para una matriz energética estable y limpia.",
      topic: "Energía nuclear vs renovable",
      turnType: "Initial Position",
      timestamp: 1715633600000
    },
    {
      id: "msg2",
      speaker: "opponent" as const,
      content: "La energía renovable, aunque intermitente, presenta un camino más sostenible a largo plazo. Los costes de la energía solar y eólica están disminuyendo rápidamente, mientras que la energía nuclear enfrenta desafíos persistentes en cuanto a gestión de residuos y riesgos de seguridad. Invertir en tecnologías de almacenamiento y redes inteligentes puede mitigar la intermitencia de las renovables, creando un sistema energético más resiliente y ambientalmente responsable.",
      topic: "Energía nuclear vs renovable",
      turnType: "Initial Position",
      timestamp: 1715633660000
    },
    {
      id: "msg3",
      speaker: "user" as const,
      content: "Francia obtiene más del 70% de su electricidad de plantas nucleares con bajas emisiones de carbono. Si queremos frenar el cambio climático, debemos considerar seriamente su ejemplo.",
      topic: "Energía nuclear vs renovable",
      turnType: "Rebuttal or Counterargument",
      timestamp: 1715633720000
    },
    {
      id: "msg4",
      speaker: "opponent" as const,
      content: "El modelo francés, aunque exitoso, no está exento de riesgos y altos costes de mantenimiento. La construcción de nuevas plantas nucleares es costosa y lleva mucho tiempo. Además, la dependencia de un solo tipo de energía crea vulnerabilidad. Diversificar las fuentes de energía, incluyendo renovables y otras tecnologías limpias, ofrece una solución más equilibrada y adaptable a largo plazo.",
      topic: "Energía nuclear vs renovable",
      turnType: "Rebuttal or Counterargument",
      timestamp: 1715633780000
    },
    {
      id: "msg5",
      speaker: "user" as const,
      content: "Los residuos nucleares son mínimos y gestionables comparados con los efectos del CO₂ en la atmósfera. Hoy, la tecnología permite hacerlo de forma segura y eficiente. Mi reflexión final es que podemos encontrarnos en un punto medio donde incentivemos inversión en aquellas energías renovables más eficientes mientras potenciamos la energía nuclear con protocolos de seguridad.",
      topic: "Energía nuclear vs renovable",
      turnType: "Closing Reflection",
      timestamp: 1715633840000
    },
    {
      id: "msg6",
      speaker: "opponent" as const,
      content: "Si bien el volumen de residuos nucleares es menor, su peligrosidad y el desafío de su almacenamiento a largo plazo persisten. Las soluciones actuales son provisionales y no eliminan el riesgo de contaminación. Un enfoque integrado que combine energía nuclear y renovable podría ser una solución pragmática, pero es crucial evaluar cuidadosamente los costes, riesgos y beneficios de cada opción. Priorizar la investigación en almacenamiento de energía y redes inteligentes, junto con estrictos protocolos de seguridad nuclear, podría maximizar la eficiencia y minimizar el impacto ambiental de ambas fuentes. Un futuro energético sostenible requiere una evaluación continua y adaptabilidad a las nuevas tecnologías.",
      topic: "Energía nuclear vs renovable",
      turnType: "Closing Reflection",
      timestamp: 1715633900000
    }
  ]
};

/**
 * Tipo para mensajes de debate
 * Compatible con el formato usado en useGeminiDebate
 */
interface DebateMessage {
  id: string;
  speaker: 'user' | 'opponent';
  content: string;
  topic: string;
  turnType: string;
  timestamp: number;
}

/**
 * Configuración básica para el debate
 */
interface DebateConfig {
  topic?: string;
  topics?: string[];
  debateFormat?: string;
  positions?: Record<string, string>;
}

/**
 * Hook personalizado para generar resúmenes y análisis de debates
 * 
 * @param debateConfig Configuración del debate
 * @param debateHistory Historial completo del debate
 * @returns Objeto con funciones y estado para el análisis del debate
 */
export function useDebateSummary(
  debateConfig: DebateConfig,
  debateHistory: DebateMessage[]
) {
  // Estados principales
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<DebateSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para la API key y su disponibilidad
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyLoaded, setIsApiKeyLoaded] = useState<boolean>(false);
  
  // Referencias para controlar las operaciones asíncronas
  const analysisInProgressRef = useRef<boolean>(false);
  const apiKeyRef = useRef<string>('');
  
  // Cargar la API key de las variables de entorno
  useEffect(() => {
    // Intentar obtener la API key directamente
    const getApiKey = () => {
      const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      
      if (key) {
        console.log('useDebateSummary: API key cargada correctamente');
        setApiKey(key);
        apiKeyRef.current = key;
        setIsApiKeyLoaded(true);
      } else {
        console.warn('useDebateSummary: No se encontró NEXT_PUBLIC_GEMINI_API_KEY en variables de entorno');
        // Marcamos como cargada aunque esté vacía para no bloquear el flujo
        setIsApiKeyLoaded(true);
      }
    };
    
    getApiKey();
  }, []);
  
  /**
   * Genera un análisis estructurado del debate basado en el historial completo
   * @returns Promise con los datos del resumen estructurado
   */
  const generateSummary = useCallback(async (): Promise<DebateSummaryData> => {
    // Evitar múltiples llamadas simultáneas
    if (analysisInProgressRef.current) {
      console.log('useDebateSummary: Análisis ya en progreso');
      if (summaryData) return summaryData;
      throw new Error('Análisis en progreso');
    }
    
    // Esperar a que la API key se haya cargado (o determinado que no está disponible)
    if (!isApiKeyLoaded) {
      console.log('useDebateSummary: Esperando a que la API key esté disponible...');
      // Esperar hasta 2 segundos por la API key
      for (let i = 0; i < 20; i++) {
        if (isApiKeyLoaded) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Si aún no está cargada, usar el valor de la referencia o continuar sin ella
      if (!isApiKeyLoaded) {
        console.warn('useDebateSummary: Tiempo de espera agotado para la API key, continuando con el proceso');
      }
    }
    
    try {
      // Marcar inicio del análisis
      setIsAnalyzing(true);
      analysisInProgressRef.current = true;
      setError(null);
      
      // MODO DE PRUEBA: comentamos la validación para poder usar el input de prueba
      // incluso cuando no hay historial de debate
      /*
      if (!debateHistory || debateHistory.length === 0) {
        throw new Error('No hay historial de debate disponible para analizar');
      }
      */
      
      console.log('useDebateSummary: MODO PRUEBA ACTIVADO - Ignorando validación de historial');
      
      console.log(`useDebateSummary: Iniciando análisis con ${debateHistory.length} mensajes`);
      console.log(`useDebateSummary: Tema del debate: ${debateConfig.topic || debateConfig.topics?.[0] || 'Sin tema especificado'}`);
      
      // Construir input para Gemini basado en el debate real
      console.log('useDebateSummary: Usando el debate real para análisis');
      
      // Crear estructura similar a TEST_INPUT pero con los datos reales del debate
      const geminiInput = {
        topic: {
          name: debateConfig.topic || debateConfig.topics?.[0] || 'Debate sin tema especificado',
          userPosition: debateConfig.positions?.[debateConfig.topic || ''] || ''
        },
        opponent: {
          id: 'analytical',  // ID por defecto si no se especifica
          name: 'AI Opponent'
        },
        debateConfig: {
          id: `summary-${Date.now()}`,
          format: debateConfig.debateFormat || 'turn-based',
          turnStructure: [],  // No es necesario para el análisis
          totalTurns: Math.ceil(debateHistory.length / 2),
          currentTurnIndex: 0,
          currentTurnType: "analysis"
        },
        // Usar el historial real del debate
        history: debateHistory.map(msg => ({
          id: msg.id,
          speaker: msg.speaker,
          content: msg.content,
          topic: msg.topic,
          turnType: msg.turnType,
          timestamp: msg.timestamp
        }))
      };
      
      // Log detallado para depuración
      console.log('useDebateSummary: Estructura de input preparada para Gemini:', {
        topicName: geminiInput.topic.name,
        totalMessages: geminiInput.history.length,
        firstMessage: geminiInput.history[0]?.content.substring(0, 30) + '...',
        lastMessage: geminiInput.history[geminiInput.history.length-1]?.content.substring(0, 30) + '...',
        format: geminiInput.debateConfig.format
      });
      
      // Log del input completo para depuración
      console.log('==================== INPUT COMPLETO PARA ANÁLISIS ====================');
      console.log(JSON.stringify(geminiInput, null, 2));
      console.log('==================================================================');
      
      // Medir el tiempo para análisis de rendimiento
      const startTime = performance.now();
      
      let result: DebateSummaryData;
      // Usar la referencia a la API key que es más confiable en un entorno asíncrono
      const currentApiKey = apiKeyRef.current || apiKey;
      
      if (currentApiKey) {
        console.log('useDebateSummary: Llamando a Gemini API con API key válida');
        // Llamar a la API real de Gemini
        try {
          result = await analyzeDebateWithGemini(geminiInput, currentApiKey);
        } catch (apiError) {
          console.error('useDebateSummary: Error al llamar a Gemini API:', apiError);
          throw new Error(`Error en la comunicación con Gemini API: ${apiError instanceof Error ? apiError.message : 'Error desconocido'}`);
        }
      } else {
        // Usar datos simulados en desarrollo o cuando no hay API key
        console.warn('useDebateSummary: API key no disponible después de intentar cargarla, usando datos simulados');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simular retraso para UX
        result = mockDebateAnalysis();
      }
      
      // Medir tiempo total
      const endTime = performance.now();
      console.log(`useDebateSummary: Análisis completado en ${(endTime - startTime).toFixed(0)}ms`);
      
      // Validar el resultado
      if (!result || typeof result !== 'object') {
        throw new Error('Formato de respuesta inválido desde Gemini API');
      }
      
      // Mostrar resumen para depuración
      console.log('useDebateSummary: Resumen recibido:', {
        score: result.score,
        skillsCount: result.skills?.length || 0,
        strengths: result.strengths?.substring(0, 50) + '...'
      });
      
      // Actualizar estado
      setSummaryData(result);
      return result;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al analizar el debate';
      console.error('useDebateSummary: Error:', errorMsg);
      setError(errorMsg);
      throw error;
    } finally {
      // Limpiar estado incluso si hay error
      setIsAnalyzing(false);
      analysisInProgressRef.current = false;
    }
  }, [apiKey, debateConfig, debateHistory, summaryData, isApiKeyLoaded]);
  
  /**
   * Genera un resumen en formato texto para casos de uso más simples
   * @returns Promise con un string formateado del resumen
   */
  const generateTextSummary = useCallback(async (): Promise<string> => {
    try {
      const data = await generateSummary();
      
      // Formatear como texto estructurado
      const topicText = debateConfig.topics?.length ? 
        `Temas: ${debateConfig.topics.join(', ')}` :
        `Tema: ${debateConfig.topic || 'No especificado'}`;
      
      let summary = `Resumen del Debate - Puntuación: ${data.score}/100\n\n`;
      summary += `${topicText}\n`;
      summary += `Formato: ${debateConfig.debateFormat || 'Estándar'}\n\n`;
      summary += `Fortalezas:\n${data.strengths}\n\n`;
      summary += `Áreas de mejora:\n${data.weaknesses}\n\n`;
      summary += `Momentos destacados:\n${data.highlights}\n\n`;
      summary += `Recomendaciones:\n${data.recommendations}`;
      
      return summary;
    } catch (error) {
      console.error('useDebateSummary: Error al generar resumen de texto:', error);
      return 'No se pudo generar el resumen del debate debido a un error.';
    }
  }, [generateSummary, debateConfig]);
  
  // Valores y funciones exportadas
  return {
    isAnalyzing,
    summaryData,
    error,
    generateSummary,
    generateTextSummary
  };
}

export default useDebateSummary;
