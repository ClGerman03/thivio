/**
 * Servicio de respuestas simuladas de Gemini
 * Este módulo contiene funciones para generar respuestas simuladas,
 * útiles durante desarrollo o cuando no hay conexión a la API.
 */

import { GeminiInputType, DebateAnalysisResponse } from './types';

/**
 * Función simplificada para pruebas, que simula una respuesta de Gemini
 * Útil durante el desarrollo o cuando no se dispone de una API key
 * 
 * @param inputJson El input que normalmente se enviaría a Gemini
 * @returns Una respuesta simulada basada en el oponente y tipo de turno
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

/**
 * Genera un análisis simulado de debate
 * Útil durante desarrollo o para pruebas
 * 
 * @returns Un análisis simulado con puntuaciones aleatorias
 */
export async function mockDebateAnalysis(): Promise<DebateAnalysisResponse> {
  // Simular tiempo de respuesta
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generar puntuaciones aleatorias
  const getRandomScore = () => Math.floor(65 + Math.random() * 30);
  
  return {
    score: getRandomScore(),
    strengths: "Argumentos bien estructurados con ejemplos efectivos. Buena participación a lo largo del debate. Respuestas detalladas y completas.",
    weaknesses: "Algunos puntos podrían estar respaldados con más evidencia. La participación podría ser más consistente en algunos momentos.",
    highlights: "Destacaste en la claridad de tus puntos principales. Tu respuesta en el tercer turno fue particularmente efectiva al abordar las objeciones.",
    recommendations: "Considera reforzar tus argumentos con datos específicos. Enfócate en responder a los contraargumentos de manera más directa. Buen nivel de participación demostrado.",
    skills: [
      { skill: "Content", value: getRandomScore() },
      { skill: "Structure", value: getRandomScore() },
      { skill: "Style", value: getRandomScore() },
      { skill: "Arguments", value: getRandomScore() },
      { skill: "Response", value: getRandomScore() },
      { skill: "Clarity", value: getRandomScore() }
    ]
  };
}
