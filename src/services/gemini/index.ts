/**
 * Punto de entrada del servicio de Gemini
 * Este archivo re-exporta todas las funciones y tipos públicos de los módulos de Gemini,
 * manteniendo compatibilidad con el código existente.
 */

// Re-exportar tipos
export * from './types';

// Re-exportar funciones del cliente base
export {
  GEMINI_API_URL,
  callGeminiAPI,
  extractTextFromGeminiResponse,
  extractJsonFromGeminiResponse
} from './geminiClient';

// Re-exportar funciones para debates
export { generateGeminiResponse } from './geminiDebate';

// Re-exportar funciones para análisis y resumen
export { 
  analyzeDebateWithGemini,
  mockDebateAnalysis
} from './geminiSummary';

// Re-exportar tipos para análisis
export type { DebateSummaryData } from './geminiSummary';

// Re-exportar funciones para mocks
export { mockGeminiResponse } from './geminiMock';
