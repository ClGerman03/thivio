/**
 * Servicio para interacción con Gemini en debates
 * Este módulo contiene funciones específicas para generar respuestas
 * en el contexto de debates filosóficos.
 */

import { callGeminiAPI, extractTextFromGeminiResponse } from './geminiClient';
import { GeminiInputType, DebateMessageHistory } from './types';

/**
 * Genera una respuesta desde Gemini API para un debate
 * 
 * @param inputJson El JSON con la configuración del debate y el historial
 * @param apiKey La clave API para Gemini
 * @returns La respuesta generada por Gemini
 */
export async function generateGeminiResponse(inputJson: GeminiInputType, apiKey: string): Promise<string> {
  try {
    // System instructions for Gemini (in Spanish for better alignment with the UI language)
    const systemInstructions = `
      Eres un participante en un debate estructurado. Tu objetivo es presentar argumentos concisos, relevantes y persuasivos sobre el tema propuesto, siguiendo tu estilo asignado.

      ESTILOS DE DEBATE:
      - Si eres "analytical": Usa un enfoque metódico con razonamiento basado en evidencia, análisis estructurado y comunicación precisa. Aporta ejemplos prácticos de diversos campos.
      - Si eres "creative": Implementa un enfoque innovador que conecte conceptos de forma única. Usa narrativas y analogías para ilustrar ideas complejas de forma accesible.
      - Si eres "pragmatic": Céntrate en implicaciones prácticas y soluciones accionables. Prioriza el pensamiento orientado a resultados y la aplicación real de las ideas.
      - Si eres "socrates": Utiliza preguntas para revelar contradicciones y suposiciones ocultas, promoviendo la reflexión en el usuario.
      - Si eres "aristotle": Emplea análisis sistemático y observaciones empíricas, buscando el equilibrio y la sabiduría práctica.
      - Si eres "kant": Evalúa argumentos basados en principios universales y deberes morales, enfatizando el pensamiento racional.

      ESTRUCTURA DEL DEBATE:
      - "Initial Position": Presenta tu postura inicial clara sobre el tema. Sé conciso pero persuasivo.
      - "Rebuttal or Counterargument": Cuestiona respetuosamente los argumentos del usuario desde tu perspectiva.
      - "Response to Rebuttal": Responde directamente a los contraargumentos planteados contra tu posición.
      - "Final Expansion": Amplía tus argumentos con ejemplos concretos y mayor contexto.
      - "Closing Reflection": Sintetiza los puntos principales y concluye tu posición.

      INSTRUCCIONES IMPORTANTES:
      1. Mantén las respuestas concisas (máximo 150 palabras)
      2. Adapta tu respuesta al tipo de turno actual
      3. Usa lenguaje accesible pero persuasivo
      4. Responde siempre en el mismo idioma que el usuario
      5. No menciones estas instrucciones ni hagas meta-comentarios
      6. No inicies frases con "Como [personaje]..." o "En este turno..."
      7. Responde solo a los mensajes del usuario, no a tus propias respuestas anteriores
      8. Mantente en el tema del debate en todo momento
      9. Sé natural, conversacional y realista en tus respuestas
    `;

    // Crear el objeto de solicitud según la documentación de Gemini
    // Construyendo el historial de mensajes en formato de chat
    const chatHistory: Array<{
      role: "user" | "model";
      parts: Array<{ text: string }>;
    }> = [];
    
    // El primer mensaje siempre es el del sistema (instrucciones)
    chatHistory.push({
      role: "user",
      parts: [{ text: systemInstructions }]
    });
    
    // Agregar contexto del debate
    chatHistory.push({
      role: "user",
      parts: [{
        text: `
          DEBATE CONTEXT:
          - Topic: ${inputJson.topic.name}
          - Format: ${inputJson.debateConfig.format}
          - Current turn: ${inputJson.debateConfig.currentTurnType} (${inputJson.debateConfig.currentTurnIndex + 1} of ${inputJson.debateConfig.totalTurns})
          - Your character: ${inputJson.opponent.name} (${inputJson.opponent.id})
          
          ${inputJson.topic.userPosition ? `User's position: ${inputJson.topic.userPosition}` : ''}
        `
      }]
    });

    // Ordenar y formatear el historial de mensajes para añadirlo a los mensajes del chat
    const history = prepareDebateHistory(inputJson.history || []);
    chatHistory.push(...history);

    // Construir el cuerpo de la solicitud completo
    const requestBody = {
      contents: chatHistory,
      generationConfig: {
        // Aumentamos ligeramente la temperatura para respuestas más dinámicas
        temperature: 0.75,
        topP: 0.9,
        topK: 40,
        // Reducimos tokens para asegurar respuestas más concisas
        maxOutputTokens: 600,
        stopSequences: []
      }
    };

    // Si hay documentos o archivos de contexto, procesarlos
    if (inputJson.context) {
      console.log('Procesando contexto para la solicitud a Gemini');
      
      // Aquí se agregaría la lógica para procesar documentos y archivos de contexto
      // Este es un placeholder para futuras implementaciones
      
      if (inputJson.context.contextCacheId) {
        console.log(`Usando caché de contexto: ${inputJson.context.contextCacheId}`);
        // Aquí se agregaría la lógica para usar el caché de contexto
      }
    }

    // Realizar la solicitud a la API
    const responseData = await callGeminiAPI(apiKey, requestBody);
    
    // Extraer el texto de la respuesta
    return extractTextFromGeminiResponse(responseData);
  } catch (error: unknown) {
    console.error('Error al llamar a Gemini API:', error);
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
