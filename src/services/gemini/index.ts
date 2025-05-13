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

// Re-exportar funciones para análisis
export { analyzeDebateWithGemini } from './geminiAnalysis';

// Re-exportar funciones para mocks
export { mockGeminiResponse, mockDebateAnalysis } from './geminiMock';
