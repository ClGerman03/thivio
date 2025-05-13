'use client';

import { useCallback, useState } from 'react';
import { analyzeDebateWithGemini } from '@/services/gemini';

// Interfaces para mensajes de debate
interface Intervention {
  speaker: 'user' | 'ai';
  position: string;
  content: string;
  topic: string;
  turn: number;
}

// Tipo para mensajes de debate (compatible con DebateMessage de useGeminiDebate)
interface DebateMessage {
  id: string;
  speaker: 'user' | 'opponent';
  content: string;
  topic: string;
  turnType: string;
  timestamp: number;
}

interface DebateSkill {
  skill: string;
  value: number;
}

interface DebateSummaryData {
  score: number;
  strengths: string;
  weaknesses: string;
  highlights: string;
  recommendations: string;
  skills: DebateSkill[];
}

interface DebateConfig {
  topic?: string;
  topics?: string[];
  positions: Record<string, string>;
  debateFormat?: string;
}

/**
 * Custom hook for generating debate summaries based on interventions or debate history
 * 
 * @param interventions List of all debate interventions (deprecated, will be removed)
 * @param debateConfig Debate configuration
 * @param debateHistory Optional parameter for the complete debate history
 * @returns Object with functions to generate summary
 */
export function useDebateSummary(
  interventions: Intervention[],
  debateConfig: DebateConfig,
  debateHistory?: DebateMessage[]
) {
  // Estado para almacenar la API key
  const [apiKey, setApiKey] = useState<string>('');
  
  // Cargar la API key al montar el componente
  useState(() => {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    setApiKey(key);
    
    if (!key) {
      console.warn('No se encontró NEXT_PUBLIC_GEMINI_API_KEY en variables de entorno');
    }
  });
  /**
 * Generate a structured summary of the debate based on debate history
 * @returns Promise with a structured debate summary data object
 */
const generateSummary = useCallback(async (): Promise<DebateSummaryData> => {
  // Verificar si tenemos historial de debate para analizar
  if (debateHistory && debateHistory.length > 0) {
    try {
      // Obtener el nombre del rol del usuario para el análisis
      const userRole = debateConfig.positions?.user || 'usuario';
      
      // Configurar los parámetros para el análisis
      const analysisConfig = {
        topic: debateConfig.topic,
        topics: debateConfig.topics,
        debateFormat: debateConfig.debateFormat || 'Estándar',
        userRole
      };
      
      console.log('Analizando debate con Gemini. Mensajes:', debateHistory.length);
      
      // Importar el tipo DebateMessageHistory del archivo geminiService.ts
      type DebateMessageHistory = {
        speaker: 'user' | 'opponent';
        content: string;
        topic: string;
        turnType: string;
      };

      // Convertir DebateMessage[] a DebateMessageHistory[] para compatibilidad con analyzeDebateWithGemini
      const formattedHistory: DebateMessageHistory[] = debateHistory.map(msg => ({
        speaker: msg.speaker as 'user' | 'opponent', // Aseguramos que speaker sea del tipo correcto
        content: msg.content,
        topic: msg.topic,
        turnType: msg.turnType
      }));
      
      // Llamar a la función de análisis con Gemini
      if (apiKey) {
        const analysis = await analyzeDebateWithGemini(
          formattedHistory,
          analysisConfig,
          apiKey
        );
        
        // Convertir la respuesta de análisis al formato DebateSummaryData
        return {
          score: analysis.score,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          highlights: analysis.highlights,
          recommendations: analysis.recommendations,
          skills: analysis.skills
        };
      } else {
        console.warn('No se encontró API key para Gemini, generando análisis de fallback');
      }
    } catch (error) {
      console.error('Error al analizar el debate:', error);
    }
  }
  
  // Fallback: Si no hay historial o hubo un error, usar el análisis basado en intervenciones
  return new Promise<DebateSummaryData>((resolve) => {
    setTimeout(() => {
      // If no interventions, return default summary
      if (!debateHistory && interventions.length === 0) {
        resolve({
          score: 0,
          strengths: 'No debate data available for analysis.',
          weaknesses: 'No debate data available for analysis.',
          highlights: 'No debate data available for analysis.',
          recommendations: 'Start a debate to get AI-powered feedback.',
          skills: [
            { skill: 'Content', value: 0 },
            { skill: 'Structure', value: 0 },
            { skill: 'Style', value: 0 },
            { skill: 'Arguments', value: 0 },
            { skill: 'Response', value: 0 },
            { skill: 'Clarity', value: 0 }
          ]
        });
        return;
      }
      
      // Get all unique topics from interventions
      const topics = [...new Set(interventions.map(i => i.topic))];
      
      // Count interventions by speaker to analyze participation
      const userInterventions = interventions.filter(i => i.speaker === 'user');
      const aiInterventions = interventions.filter(i => i.speaker === 'ai');
      
      // Calculate average content length as a proxy for detail level
      const userAvgLength = userInterventions.reduce((acc, i) => acc + i.content.length, 0) / userInterventions.length || 0;
      
      // Base score calculation - this would be more sophisticated with Gemini
      const baseScore = Math.min(Math.round(55 + (userInterventions.length * 5) + (userAvgLength / 50)), 95);
      
      // Generate insights based on debate data
      // In a real implementation, these would come from Gemini's analysis
      let topStrengths = 'Clear structure with effective examples. ';
      if (userInterventions.length > 2) {
        topStrengths += 'Good participation throughout the debate. ';
      }
      if (userAvgLength > 150) {
        topStrengths += 'Detailed and thorough responses provided.';
      }
      
      let topWeaknesses = 'Some points could be supported with more evidence. ';
      if (userInterventions.length < aiInterventions.length) {
        topWeaknesses += 'Participation could be more consistent. ';
      }
      if (userAvgLength < 100) {
        topWeaknesses += 'Responses could be more detailed in some areas.';
      }
      
      // Generate skills assessment
      // In a real implementation, these scores would be calculated by Gemini
      const contentScore = Math.min(Math.round(60 + (userAvgLength / 20)), 95);
      const structureScore = Math.min(Math.round(70 + (topics.length * 5)), 95);
      const argumentsScore = Math.min(Math.round(65 + (userInterventions.length * 3)), 95);
      const responseScore = Math.min(75 + (interventions.length % 10), 90);
      
      // Create the structured summary data
      const summaryData: DebateSummaryData = {
        score: baseScore,
        strengths: topStrengths,
        weaknesses: topWeaknesses,
        highlights: `You debated on ${topics.length} topic(s) with ${userInterventions.length} contributions. Your strongest points were made on the topic of ${topics[0] || 'the main subject'}.`,
        recommendations: `Consider reinforcing arguments with data. Focus on responding to counterpoints more directly. ${userInterventions.length < 3 ? 'Aim for more participation in future debates.' : 'Good level of engagement shown.'}`,
        skills: [
          { skill: 'Content', value: contentScore },
          { skill: 'Structure', value: structureScore },
          { skill: 'Style', value: Math.round(65 + Math.random() * 20) },
          { skill: 'Arguments', value: argumentsScore },
          { skill: 'Response', value: responseScore },
          { skill: 'Clarity', value: Math.round(70 + Math.random() * 15) }
        ]
      };
      
      resolve(summaryData);
    }, 1500); // Simulate processing delay
  });
}, [interventions, debateHistory, debateConfig, apiKey]);
  
  /**
 * Generate a text-only summary for simpler use cases
 * @returns Promise with a string summary
 */
const generateTextSummary = useCallback(async (): Promise<string> => {
  const summaryData = await generateSummary();
  
  // Format the summary data as text
  const topicText = debateConfig.topics ? 
    `Topics: ${debateConfig.topics.join(', ')}` : 
    `Topic: ${debateConfig.topic || 'N/A'}`;
  
  let summary = `Debate Summary - Score: ${summaryData.score}/100\n\n`;
  summary += `${topicText}\n`;
  summary += `Format: ${debateConfig.debateFormat || 'Standard'}\n\n`;
  summary += `Strengths:\n${summaryData.strengths}\n\n`;
  summary += `Areas for Improvement:\n${summaryData.weaknesses}\n\n`;
  summary += `Highlights:\n${summaryData.highlights}\n\n`;
  summary += `Recommendations:\n${summaryData.recommendations}`;
  
  return summary;
}, [generateSummary, debateConfig]);

return { generateSummary, generateTextSummary };
}
