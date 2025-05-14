/**
 * Servicio para análisis de debates con Gemini
 * Este módulo contiene funciones específicas para analizar debates y generar resúmenes
 * estructurados mediante la API de Gemini.
 */

import { callGeminiAPI, extractJsonFromGeminiResponse } from './geminiClient';
import { GeminiInputType, DebateMessageHistory } from './types';

/**
 * Tipo para los datos de resumen del debate
 */
export interface DebateSummaryData {
  score: number;
  strengths: string;
  weaknesses: string;
  highlights: string;
  recommendations: string;
  skills: Array<{
    skill: string;
    value: number;
  }>;
}

/**
 * Analiza un debate completo para generar un resumen estructurado
 * 
 * @param inputJson El historial completo del debate y su configuración
 * @param apiKey La clave API para Gemini
 * @returns Un objeto con el análisis estructurado del debate
 */
export async function analyzeDebateWithGemini(
  inputJson: GeminiInputType, 
  apiKey: string
): Promise<DebateSummaryData> {
  try {
    // Instrucciones específicas para el análisis del debate - versión optimizada para reducir tokens
    const systemInstructions = {
      role: "user",
      parts: [{ text: `Analiza este debate y genera un JSON con exact schema:
{
  "score": <0-100>,
  "strengths": "<1-3 frases>",
  "weaknesses": "<1-3 frases>",
  "highlights": "<texto breve>",
  "recommendations": "<texto breve>",
  "skills": [
    {"skill": "Content", "value": <0-100>},
    {"skill": "Structure", "value": <0-100>},
    {"skill": "Style", "value": <0-100>},
    {"skill": "Arguments", "value": <0-100>},
    {"skill": "Response", "value": <0-100>},
    {"skill": "Clarity", "value": <0-100>}
  ]
}
Sólo genera el JSON, sin texto adicional, marcadores de código ni comentarios. Criterios: Content (calidad del contenido), Structure (organización), Style (comunicación), Arguments (solidez), Response (capacidad de respuesta), Clarity (precisión).` }]
    };

    // Formato del historial similar a geminiDebate.ts pero adaptado para análisis
    const chatHistory = [];
    
    // Añadir instrucciones de sistema directamente (formato optimizado)
    chatHistory.push(systemInstructions);
    
    // Agregar contexto del debate
    chatHistory.push({
      role: "user",
      parts: [{
        text: `
          DEBATE CONTEXT:
          - Topic: ${inputJson.topic.name}
          - Format: ${inputJson.debateConfig.format}
          - Total turns: ${inputJson.debateConfig.totalTurns}
          - Opponent: ${inputJson.opponent.name} (${inputJson.opponent.id})
          
          ${inputJson.topic.userPosition ? `User's position: ${inputJson.topic.userPosition}` : ''}
        `
      }]
    });

    // Ordenar y formatear el historial de mensajes
    const history = prepareDebateHistory(inputJson.history || []);
    chatHistory.push(...history);
    
    // Añadir un mensaje final de usuario solicitando el análisis
    // Esto es crucial para que el modelo tenga claro que debe responder con un análisis
    chatHistory.push({
      role: "user",
      parts: [{ text: "Ahora, analiza este debate y genera el JSON con la evaluación estructurada." }]
    });

    // Configuración específica para el análisis (enfocada en precisión)
    const requestBody = {
      contents: chatHistory,
      generationConfig: {
        temperature: 0.2,  // Temperatura baja para respuestas más determinísticas
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
        stopSequences: []
      }
    };

    console.log('==================== INPUT ENVIADO A GEMINI ====================');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('==================================================================');
    
    console.log('Enviando solicitud de análisis a Gemini con:', {
      topicName: inputJson.topic.name,
      messageCount: inputJson.history?.length || 0,
      opponent: inputJson.opponent.name
    });

    // Realizar la solicitud a la API
    const responseData = await callGeminiAPI(apiKey, requestBody);
    
    // Extraer el JSON de la respuesta
    try {
      console.log('analyzeDebateWithGemini: Intentando extraer JSON de la respuesta...');
      const extractedJson = extractJsonFromGeminiResponse<DebateSummaryData>(responseData);
      
      console.log('analyzeDebateWithGemini: JSON extraído con éxito:');
      console.log('==================== JSON EXTRAÍDO ====================');
      console.log(JSON.stringify(extractedJson, null, 2));
      console.log('===================================================');
      
      return extractedJson;
    } catch (parseError) {
      console.error('Error al parsear la respuesta JSON:', parseError);
      throw new Error('No se pudo obtener un resumen válido del debate');
    }
  } catch (error: unknown) {
    console.error('Error al analizar el debate con Gemini:', error);
    throw error;
  }
}

/**
 * Prepara el historial de debate para la API de Gemini
 * 
 * @param history El historial de mensajes del debate
 * @returns El historial formateado para la API de Gemini
 */
function prepareDebateHistory(history: DebateMessageHistory[]): Array<{
  role: "user" | "model";
  parts: Array<{ text: string }>;
}> {
  return history.map(msg => ({
    role: msg.speaker === 'user' ? 'user' : 'model',
    parts: [{ 
      text: msg.content
    }]
  }));
}

/**
 * Genera un resultado de análisis simulado para pruebas
 * 
 * @returns Datos de resumen de debate simulados
 */
export function mockDebateAnalysis(): DebateSummaryData {
  return {
    score: 82,
    strengths: "Buena capacidad para presentar argumentos claros y concisos. Uso efectivo de ejemplos para ilustrar conceptos complejos.",
    weaknesses: "Podría mejorar en la respuesta a contraargumentos específicos. Algunos puntos requieren mayor desarrollo.",
    highlights: "Destacó especialmente en la presentación inicial del tema y en la exposición de ideas en el tercer turno.",
    recommendations: "Reforzar respuestas con datos concretos. Practicar la identificación y refutación directa de contraargumentos.",
    skills: [
      { skill: "Content", value: 85 },
      { skill: "Structure", value: 78 },
      { skill: "Style", value: 82 },
      { skill: "Arguments", value: 80 },
      { skill: "Response", value: 75 },
      { skill: "Clarity", value: 88 }
    ]
  };
}
