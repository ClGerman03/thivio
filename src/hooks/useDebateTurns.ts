import { useState, useCallback, useEffect } from 'react';
import { 
  DebateTurnState, 
  advanceToNextTurn, 
  changeToTopic, 
  createInitialTurnState, 
  getCurrentTopic, 
  getCurrentTurnName
} from '@/services/debateTurnService';

/**
 * Hook personalizado para gestionar los turnos de debate
 * Sigue el patrón de custom hooks de React para encapsular
 * la lógica relacionada con los turnos y tópicos
 */
export function useDebateTurns(
  topics: string[], 
  turnCount: number, 
  onDebateComplete?: () => void
) {
  // Estado principal para turnos y tópicos
  const [turnState, setTurnState] = useState<DebateTurnState>(
    createInitialTurnState(topics, turnCount)
  );
  
  // Estados derivados para simplificar el uso
  const currentTopic = getCurrentTopic(turnState);
  const currentTurnName = getCurrentTurnName(turnState.currentTurnIndex, turnState.turnCount);
  
  // Callback para avanzar al siguiente turno
  const nextTurn = useCallback(() => {
    setTurnState(prevState => {
      const newState = advanceToNextTurn(prevState);
      
      // Si el debate se completó, notificar a través del callback
      if (newState.isCompleted && onDebateComplete) {
        // Ejecutar asincrónicamente para evitar efectos secundarios durante el render
        setTimeout(onDebateComplete, 0);
      }
      
      return newState;
    });
  }, [onDebateComplete]);
  
  // Callback para cambiar a un tópico específico
  const selectTopic = useCallback((topicIndex: number) => {
    setTurnState(prevState => changeToTopic(prevState, topicIndex));
  }, []);
  
  // Efecto para actualizar el estado si cambian los tópicos o la cantidad de turnos
  useEffect(() => {
    setTurnState(createInitialTurnState(topics, turnCount));
  }, [topics, turnCount]);
  
  return {
    // Estados actuales
    currentTopicIndex: turnState.currentTopicIndex,
    currentTurnIndex: turnState.currentTurnIndex,
    currentTopic,
    currentTurnName,
    isDebateCompleted: turnState.isCompleted,
    
    // Acciones
    nextTurn,
    selectTopic,
    
    // Estado completo para casos de uso avanzados
    turnState
  };
}
