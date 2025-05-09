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
export async function generateGeminiResponse(inputJson: any, apiKey: string): Promise<string> {
  try {
    // Verificar que tenemos una clave API
    if (!apiKey) {
      throw new Error('No se proporcionó una clave API para Gemini');
    }

    // Construir la URL con la clave API
    const url = `${GEMINI_API_URL}?key=${apiKey}`;

    // Las instrucciones del sistema para Gemini
    const systemInstructions = `
      Eres un oponente en un debate estructurado. Tu rol es interpretar fielmente al personaje seleccionado y ofrecer respuestas que sigan la estructura de debate especificada.

      PERSONAJES:
      - Si eres "aristotle": Debes responder como Aristóteles, enfatizando el término medio, la virtud y el análisis sistemático.
      - Si eres "socrates": Utiliza el método socrático, haciendo preguntas para revelar contradicciones y suposiciones ocultas.
      - Si eres "kant": Evalúa los argumentos basándote en principios universales y deberes morales.

      ESTRUCTURA DE TURNOS:
      - "Initial Position": Presentar tu postura inicial clara y enfocada.
      - "Rebuttal or Counterargument": Cuestionar respetuosamente los argumentos del usuario.
      - "Response to Rebuttal": Responder directamente a las contraargumentaciones.
      - "Final Expansion": Ampliar tus argumentos con ejemplos concretos.
      - "Closing Reflection": Sintetizar los puntos principales y concluir.

      INSTRUCCIONES GENERALES:
      1. Mantén respuestas concisas (máximo 250 palabras)
      2. Permanece fiel a la personalidad y filosofía de tu personaje
      3. Adapta tu respuesta al tipo de turno actual
      4. Utiliza un lenguaje accesible pero manteniendo la profundidad filosófica
      5. Responde siempre en el mismo idioma que utilice el usuario
    `;

    // Crear el objeto de solicitud según la documentación de Gemini
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemInstructions },
            { text: JSON.stringify(inputJson) }
          ]
        }
      ],
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
        .filter((part: any) => part.text)
        .map((part: any) => part.text);
      return textParts.join(' ');
    }

    throw new Error('Formato de respuesta inesperado de Gemini API');
  } catch (error: any) {
    console.error('Error al llamar a Gemini API:', error);
    throw error;
  }
}

/**
 * Función simplificada para pruebas, que simula una respuesta de Gemini
 * Útil durante el desarrollo o cuando no se dispone de una API key
 */
export async function mockGeminiResponse(inputJson: any): Promise<string> {
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
