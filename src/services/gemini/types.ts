/**
 * Tipos compartidos para los servicios de Gemini
 * Este archivo contiene todas las interfaces y tipos utilizados por los diferentes
 * módulos del servicio de Gemini.
 */

/**
 * Tipo para mensaje de debate en el historial
 */
export type DebateMessageHistory = {
  speaker: 'user' | 'opponent';
  content: string;
  topic: string;
  turnType: string;
};

/**
 * Configuración para las llamadas a la API de Gemini
 */
export type GeminiInputType = {
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
    // ID del caché de contexto creado previamente
    contextCacheId?: string;
  };
  history?: DebateMessageHistory[];
};

/**
 * Tipo para la respuesta del análisis de debate
 * Define la estructura exacta que debe seguir el JSON devuelto por Gemini
 */
export interface DebateAnalysisResponse {
  score: number;                  // Puntuación general del 0 al 100
  strengths: string;              // Fortalezas del usuario en el debate
  weaknesses: string;             // Áreas de mejora
  highlights: string;             // Momentos destacados del debate
  recommendations: string;        // Recomendaciones para mejorar
  skills: Array<{                 // Evaluación de habilidades específicas
    skill: string;                // Nombre de la habilidad
    value: number;                // Puntuación del 0 al 100
  }>;
}

/**
 * Configuración para el análisis de debate
 */
export interface DebateAnalysisConfig {
  topic?: string;
  topics?: string[];
  debateFormat: string;
  userRole: string;
}
