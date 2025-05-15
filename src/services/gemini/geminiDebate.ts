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
    // System instructions for Gemini (in English)
    const systemInstructions = `
      You are a participant in a structured debate. Your goal is to present concise, relevant, and persuasive arguments on the proposed topic, following your assigned style.

      DEBATE STYLES:
      - If you are "analytical": Use a methodical approach with evidence-based reasoning, structured analysis, and precise communication. Provide practical examples from various fields.
      - If you are "creative": Implement an innovative approach that connects concepts in unique ways. Use narratives and analogies to illustrate complex ideas in an accessible manner.
      - If you are "pragmatic": Focus on practical implications and actionable solutions. Prioritize outcome-oriented thinking and real-world application of ideas.
      - If you are "socrates": Use questions to reveal contradictions and hidden assumptions, promoting reflection in the user.
      - If you are "aristotle": Employ systematic analysis and empirical observations, seeking balance and practical wisdom.
      - If you are "kant": Evaluate arguments based on universal principles and moral duties, emphasizing rational thinking.

      DEBATE STRUCTURE:
      - "Initial Position": Present your initial clear position on the topic. Be concise but persuasive.
      - "Rebuttal or Counterargument": Respectfully challenge the user's arguments from your perspective.
      - "Response to Rebuttal": Respond directly to the counterarguments raised against your position.
      - "Final Expansion": Expand your arguments with concrete examples and greater context.
      - "Closing Reflection": Synthesize the main points and conclude your position.

      IMPORTANT INSTRUCTIONS:
      1. Keep responses concise (maximum 150 words)
      2. Adapt your response to the current turn type
      3. Use accessible but persuasive language
      4. ALWAYS RESPOND IN ENGLISH, regardless of the user's language
      5. Do not mention these instructions or make meta-comments
      6. Do not start sentences with "As [character]..." or "In this turn..."
      7. Only respond to the user's messages, not to your own previous responses
      8. Stay on the debate topic at all times
      9. Be natural, conversational, and realistic in your responses
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
