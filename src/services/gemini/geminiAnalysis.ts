/**
 * Servicio para análisis de debates con Gemini
 * Este módulo contiene funciones para analizar debates y generar
 * estadísticas, evaluaciones y recomendaciones.
 */

import { callGeminiAPI, extractJsonFromGeminiResponse } from './geminiClient';
import { DebateMessageHistory, DebateAnalysisResponse, DebateAnalysisConfig } from './types';

/**
 * Analiza un debate completo y genera estadísticas, evaluación y recomendaciones
 * 
 * @param debateHistory El historial completo del debate (mensajes de usuario y oponente)
 * @param debateConfig Configuración del debate (tema, formato, rol del usuario)
 * @param apiKey La clave API para Gemini
 * @returns Un objeto con el análisis estructurado del debate
 */
export async function analyzeDebateWithGemini(
  debateHistory: DebateMessageHistory[],
  debateConfig: DebateAnalysisConfig,
  apiKey: string
): Promise<DebateAnalysisResponse> {
  try {
    // System instructions específicas para el análisis del debate
    const systemInstructions = `
      Analiza el siguiente debate y proporciona una evaluación detallada del desempeño del usuario.
      
      INSTRUCCIONES PARA EL ANÁLISIS:
      1. Evalúa la calidad de los argumentos presentados por el usuario
      2. Identifica fortalezas y debilidades en su razonamiento
      3. Analiza su capacidad de respuesta a contraargumentos
      4. Evalúa la estructura, claridad y estilo de comunicación
      5. Considera la relevancia y profundidad del contenido
      
      IMPORTANTE: Tu respuesta DEBE seguir EXACTAMENTE este formato JSON sin ningún texto adicional:
      {
        "score": [número entre 0 y 100 que representa la evaluación general],
        "strengths": "[principales fortalezas del usuario, máximo 150 palabras]",
        "weaknesses": "[áreas de mejora, máximo 150 palabras]",
        "highlights": "[2-3 momentos destacados del debate, máximo 150 palabras]",
        "recommendations": "[recomendaciones específicas para mejorar, máximo 150 palabras]",
        "skills": [
          { "skill": "Content", "value": [0-100] },
          { "skill": "Structure", "value": [0-100] },
          { "skill": "Style", "value": [0-100] },
          { "skill": "Arguments", "value": [0-100] },
          { "skill": "Response", "value": [0-100] },
          { "skill": "Clarity", "value": [0-100] }
        ]
      }
      
      Asegúrate de que el JSON sea válido y siga exactamente esta estructura. No incluyas texto fuera del JSON.
    `;

    // Formatear el historial para incluirlo en el análisis
    const formattedHistory = debateHistory.map(message => ({
      role: message.speaker === 'user' ? 'user' : 'model',
      content: message.content,
      topicContext: message.topic,
      turnType: message.turnType
    }));

    // Información del tema del debate
    const topicInfo = debateConfig.topic || 
      (debateConfig.topics && debateConfig.topics.length > 0 
        ? debateConfig.topics.join(', ') 
        : 'tema no especificado');

    // Crear el objeto de solicitud para Gemini
    const requestBody = {
      contents: [
        // Instrucciones del sistema
        {
          role: "user",
          parts: [{ text: systemInstructions }]
        },
        // Contexto del debate
        {
          role: "user",
          parts: [{ 
            text: `
              CONTEXTO DEL DEBATE:
              Tema: ${topicInfo}
              Formato: ${debateConfig.debateFormat}
              Rol del usuario: ${debateConfig.userRole}
              
              A continuación está el historial completo del debate para analizar:
            `
          }]
        },
        // Incluir todo el historial del debate
        ...formattedHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: `[${msg.turnType}] ${msg.content}` }]
        }))
      ],
      generationConfig: {
        temperature: 0.3,           // Baja temperatura para resultados más deterministas
        topP: 0.8,                  // Limitar aleatoriedad
        topK: 40,                   // Parámetro estándar
        maxOutputTokens: 800        // Suficiente para el análisis completo
      }
    };

    // Realizar la solicitud a la API
    const responseData = await callGeminiAPI(apiKey, requestBody);
    
    // Extraer y parsear el JSON de la respuesta
    try {
      const analysisData = extractJsonFromGeminiResponse<DebateAnalysisResponse>(responseData);
      
      // Validar que la respuesta tiene la estructura esperada
      if (!analysisData.score || !Array.isArray(analysisData.skills)) {
        throw new Error('La respuesta de Gemini no tiene el formato esperado');
      }
      
      return analysisData;
    } catch (parseError) {
      throw parseError;
    }
  } catch (error: unknown) {
    console.error('Error al analizar el debate con Gemini:', error);
    
    // Devolver un análisis por defecto en caso de error
    return {
      score: 0,
      strengths: 'No se pudo analizar el debate debido a un error.',
      weaknesses: 'No se pudo analizar el debate debido a un error.',
      highlights: 'No se pudo analizar el debate debido a un error.',
      recommendations: 'Intenta nuevamente más tarde o contacta al soporte técnico.',
      skills: [
        { skill: 'Content', value: 0 },
        { skill: 'Structure', value: 0 },
        { skill: 'Style', value: 0 },
        { skill: 'Arguments', value: 0 },
        { skill: 'Response', value: 0 },
        { skill: 'Clarity', value: 0 }
      ]
    };
  }
}
