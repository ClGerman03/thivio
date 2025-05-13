/**
 * Servicio para interactuar con la API de Gemini
 * Este archivo sirve como punto de entrada unificado para todos los servicios relacionados con Gemini
 * Se mantiene para compatibilidad con el código existente y redirige a la nueva estructura modular
 */

// Re-exportar todo desde la nueva estructura modular
export * from './gemini';

// Mensaje deprecado para indicar migración a la nueva estructura
// eslint-disable-next-line no-console
console.info(
  'geminiService.ts está deprecado. Por favor, migre a la nueva estructura modular importando desde @/services/gemini'
);
