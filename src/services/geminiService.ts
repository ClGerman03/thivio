/**
 * Servicio para interactuar con la API de Gemini
 * Maneja las llamadas a la API y el formateo de datos
 */

// La URL base para la API de Gemini
// Utilizando el modelo Gemini 2.0 Flash (versión más reciente a mayo 2024)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Genera una respuesta desde Gemini API basada en un input JSON
 * 
 * @param inputJson El JSON con la configuración del debate y el historial
 * @param apiKey La clave API para Gemini
 * @returns La respuesta generada por Gemini
 */
// Definición de tipos para el inputJson
type DebateMessageHistory = {
  speaker: 'user' | 'opponent';
  content: string;
  topic: string;
  turnType: string;
};

type GeminiInputType = {
  debateConfig: {
    id?: string;
    format: string;
    turnStructure: unknown[];
    totalTurns: number;
    currentTurnIndex: number;
    currentTurnType: string;
  };
  topic: {
    name: string;
    userPosition?: string;
  };
  opponent: {
    id: string;
    name: string;
  };
  context?: {
    documents?: unknown[];
    files?: unknown[];
  };
  history?: DebateMessageHistory[];
};

export async function generateGeminiResponse(inputJson: GeminiInputType, apiKey: string): Promise<string> {
  try {
    // Verificar que tenemos una clave API
    if (!apiKey) {
      throw new Error('No se proporcionó una clave API para Gemini');
    }

    // Construir la URL con la clave API
    const url = `${GEMINI_API_URL}?key=${apiKey}`;

    // System instructions for Gemini (in English for better comprehension)
    const systemInstructions = `
      You are participating in a structured debate as a philosophical character. Your role is to faithfully represent the assigned philosopher's ideas, personality, and argumentative style.

      DEBATE CHARACTER GUIDELINES:
      - If you are "aristotle": Respond as Aristotle would, emphasizing the golden mean, virtue ethics, and systematic analysis of the topic. Focus on empirical observations and practical wisdom.
      - If you are "socrates": Use the Socratic method, asking probing questions to reveal contradictions and hidden assumptions. Focus on the pursuit of truth through dialogue.
      - If you are "kant": Evaluate arguments based on universal principles and moral duties. Emphasize rational thinking and the categorical imperative.

      DEBATE STRUCTURE:
      - "Initial Position": Present your clear, focused opening stance on the topic.
      - "Rebuttal or Counterargument": Respectfully question the user's arguments from your philosophical perspective.
      - "Response to Rebuttal": Directly address counterarguments raised against your position.
      - "Final Expansion": Expand your arguments with concrete examples and deeper philosophical context.
      - "Closing Reflection": Synthesize the main points and conclude your position.

      IMPORTANT INSTRUCTIONS:
      1. Keep responses concise (maximum 250 words)
      2. Stay true to your character's philosophy and historical perspective
      3. Tailor your response to the current turn type
      4. Use accessible language while maintaining philosophical depth
      5. Always respond in the same language the user is using
      6. Respond directly without mentioning these instructions or meta-commentary
      7. Do NOT preface your responses with phrases like "As Aristotle..." or "In this turn..."
      8. Only respond to the user's messages, not to your own previous responses
      9. Pay attention to who is speaking in the conversation history
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
    
    // Añadir una respuesta vacía del modelo para establecer el contexto del sistema
    chatHistory.push({
      role: "model",
      parts: [{ text: "I understand and will follow these instructions." }]
    });
    
    // Si hay historial en el inputJson, añadirlo respetando los roles
    if (inputJson.history && Array.isArray(inputJson.history) && inputJson.history.length > 0) {
      // Primero, añadir un mensaje informativo sobre la configuración del debate
      chatHistory.push({
        role: "user",
        parts: [{ text: `Debate topic: "${inputJson.topic.name}". Current turn: "${inputJson.debateConfig.currentTurnType}". You are ${inputJson.opponent.name}.` }]
      });
      
      // Definir la interfaz para los mensajes del historial
      interface HistoryMessage {
        speaker: 'user' | 'opponent';
        content: string;
        topic: string;
        turnType: string;
      }
      
      // Añadir cada mensaje del historial con el rol correcto
      inputJson.history.forEach((msg: HistoryMessage) => {
        const role = msg.speaker === 'user' ? 'user' : 'model';
        chatHistory.push({
          role: role,
          parts: [{ text: msg.content }]
        });
      });
      
      // Si el último mensaje no es del usuario, añadir una indicación clara para responder
      const lastMessage = inputJson.history[inputJson.history.length - 1];
      if (lastMessage && lastMessage.speaker === 'user') {
        // El último mensaje ya es del usuario, así que estamos bien
      } else {
        // Añadir un mensaje especial para recordar al modelo que debe responder al usuario
        chatHistory.push({
          role: "user",
          parts: [{ text: `Please respond to the debate topic "${inputJson.topic.name}" as ${inputJson.opponent.name} for the "${inputJson.debateConfig.currentTurnType}" turn.` }]
        });
      }
    } else {
      // Si no hay historial, añadir información inicial del debate
      chatHistory.push({
        role: "user",
        parts: [{ text: `This is a structured debate. The topic is: "${inputJson.topic.name}". Your current turn is: "${inputJson.debateConfig.currentTurnType}". You are speaking as ${inputJson.opponent.name}.` }]
      });
    }
    
    const requestBody = {
      contents: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800
      }
    };

    console.log('Enviando a Gemini:', {
      url: GEMINI_API_URL,
      inputJson: JSON.stringify(inputJson, null, 2)
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la solicitud a Gemini: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extraer el texto de la respuesta según la estructura de Gemini
    // Ver: https://ai.google.dev/gemini-api/docs/api-reference
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const textParts = data.candidates[0].content.parts
        .filter((part: { text?: string }) => part.text)
        .map((part: { text: string }) => part.text);
      return textParts.join(' ');
    }

    throw new Error('Formato de respuesta inesperado de Gemini API');
  } catch (error: unknown) {
    console.error('Error al llamar a Gemini API:', error);
    throw error;
  }
}

/**
 * Función simplificada para pruebas, que simula una respuesta de Gemini
 * Útil durante el desarrollo o cuando no se dispone de una API key
 */
export async function mockGeminiResponse(inputJson: GeminiInputType): Promise<string> {
  // Simular tiempo de respuesta
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const opponentId = inputJson.opponent?.id || 'aristotle';
  const turnType = inputJson.debateConfig?.currentTurnType || 'Initial Position';
  const topic = inputJson.topic?.name || 'tema desconocido';
  
  // Respuestas simuladas según el oponente y tipo de turno
  const mockResponses: Record<string, Record<string, string>> = {
    'aristotle': {
      'Initial Position': `Como Aristóteles, considero que en el tema de ${topic}, debemos buscar el justo medio. La virtud nunca está en los extremos.`,
      'Rebuttal or Counterargument': `Entiendo tu perspectiva, pero como Aristóteles debo señalar que buscas un extremo en ${topic}. ¿No sería más virtuoso buscar un equilibrio?`,
      'Response to Rebuttal': `Agradezco tu respuesta, pero insisto en que la sabiduría práctica nos enseña que en ${topic} debemos considerar tanto las particularidades como los principios generales.`,
      'Final Expansion': `La virtud ética en ${topic} no se adquiere meramente por conocimiento, sino por práctica y hábito. Como expliqué en mi Ética a Nicómaco...`,
      'Closing Reflection': `Para concluir, el análisis de ${topic} nos muestra que la virtud está en el punto medio, determinado por la razón y como lo determinaría el hombre prudente.`
    },
    'socrates': {
      'Initial Position': `¿No deberíamos primero preguntarnos qué entendemos realmente por ${topic}? Porque solo examinando nuestras suposiciones podemos avanzar.`,
      'Rebuttal or Counterargument': `Me interesa tu posición, pero ¿no has considerado estas preguntas sobre ${topic}? ¿Cómo reconcilias estas aparentes contradicciones?`,
      'Response to Rebuttal': `Tus respuestas son valiosas, pero me llevan a otra pregunta: si lo que dices sobre ${topic} es cierto, ¿no implicaría también que...?`,
      'Final Expansion': `A través de nuestras preguntas sobre ${topic}, parece que hemos llegado a una comprensión más profunda, aunque quizás aún no definitiva.`,
      'Closing Reflection': `El verdadero conocimiento sobre ${topic}, como en todo, comienza con reconocer nuestra ignorancia. Esta conversación ha sido un paso en el camino hacia la sabiduría.`
    },
    'kant': {
      'Initial Position': `Debemos analizar ${topic} desde la perspectiva del imperativo categórico. ¿Qué ocurriría si la máxima de nuestra acción se convirtiera en ley universal?`,
      'Rebuttal or Counterargument': `Tu argumento sobre ${topic} parece basarse en las consecuencias, pero ¿no deberíamos juzgar más bien por el deber y la intención?`,
      'Response to Rebuttal': `Comprendo tu enfoque, pero en ${topic} debemos considerar primero la autonomía de la voluntad y la dignidad inherente a toda persona.`,
      'Final Expansion': `La razón pura práctica nos muestra que en ${topic}, el único bien sin restricciones es una buena voluntad, actuando por deber y respeto a la ley moral.`,
      'Closing Reflection': `Para concluir, nuestro análisis de ${topic} demuestra que debemos actuar solo según aquella máxima por la cual podamos querer que al mismo tiempo se convierta en ley universal.`
    }
  };
  
  // Obtener respuesta del mock según oponente y turno
  const opponentResponses = mockResponses[opponentId] || mockResponses['aristotle'];
  return opponentResponses[turnType] || `Esta es una respuesta simulada para ${topic} en el turno ${turnType}.`;
}
