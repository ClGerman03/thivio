/**
 * Debate Turn Service for Lexiroo
 * Centraliza la lógica de gestión de turnos y tópicos en el debate
 */

import { getTurnsByCount } from '@/components/debate/session/controls/DebateTurnStructure';

/**
 * Tipo para representar el estado del turno de debate
 */
export interface DebateTurnState {
  currentTopicIndex: number;
  currentTurnIndex: number;
  turnCount: number;
  topics: string[];
  isCompleted: boolean;
}

/**
 * Avanza al siguiente turno y, si es necesario, al siguiente tópico
 * @param state Estado actual del turno
 * @returns Estado actualizado del turno
 */
export const advanceToNextTurn = (state: DebateTurnState): DebateTurnState => {
  const { currentTopicIndex, currentTurnIndex, turnCount, topics } = state;
  
  // Si estamos en el último turno del tópico actual
  if (currentTurnIndex >= turnCount - 1) {
    // Verificar si hay más tópicos disponibles
    if (currentTopicIndex < topics.length - 1) {
      // Avanzar al siguiente tópico y reiniciar el contador de turnos
      return {
        ...state,
        currentTopicIndex: currentTopicIndex + 1,
        currentTurnIndex: 0,
        isCompleted: false
      };
    } else {
      // Hemos terminado todos los tópicos y turnos
      return {
        ...state,
        isCompleted: true
      };
    }
  } else {
    // Avanzar al siguiente turno dentro del mismo tópico
    return {
      ...state,
      currentTurnIndex: currentTurnIndex + 1,
      isCompleted: false
    };
  }
};

/**
 * Obtiene el nombre del turno actual basado en el índice y la cuenta total
 * @param turnIndex Índice del turno actual (0-based)
 * @param turnCount Cantidad total de turnos
 * @returns Nombre del turno actual
 */
export const getCurrentTurnName = (turnIndex: number, turnCount: number): string => {
  const turns = getTurnsByCount(turnCount);
  return turns[turnIndex] || 'Unknown';
};

/**
 * Determina si el turno actual corresponde a un turno "par" o "impar"
 * Útil para determinar si el turno corresponde al usuario o al AI
 * @param turnIndex Índice del turno actual
 * @returns true si es par, false si es impar
 */
export const isEvenTurn = (turnIndex: number): boolean => {
  return turnIndex % 2 === 0;
};

/**
 * Cambia directamente a un tópico específico
 * @param state Estado actual del turno
 * @param topicIndex Índice del tópico al que cambiar
 * @returns Estado actualizado con el nuevo tópico
 */
export const changeToTopic = (state: DebateTurnState, topicIndex: number): DebateTurnState => {
  if (topicIndex < 0 || topicIndex >= state.topics.length) {
    return state; // No hacer cambios si el índice está fuera de rango
  }
  
  return {
    ...state,
    currentTopicIndex: topicIndex,
    currentTurnIndex: 0, // Reiniciar a primer turno del nuevo tópico
    isCompleted: false
  };
};

/**
 * Obtiene el tópico actual basado en el estado
 * @param state Estado del turno
 * @returns El tópico actual o string vacío si no hay tópicos
 */
export const getCurrentTopic = (state: DebateTurnState): string => {
  return state.topics[state.currentTopicIndex] || '';
};

/**
 * Crea un estado inicial de turno
 * @param topics Lista de tópicos
 * @param turnCount Cantidad de turnos
 * @returns Estado inicial
 */
export const createInitialTurnState = (
  topics: string[], 
  turnCount: number
): DebateTurnState => {
  return {
    currentTopicIndex: 0,
    currentTurnIndex: 0,
    turnCount,
    topics,
    isCompleted: false
  };
};
