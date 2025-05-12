'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDebateContext } from '@/context/DebateContext';
import TurnConfirmationPopup from './interventions/TurnConfirmationPopup';

type TurnManagementProps = {
  activeSpeaker: string | null;
  onChangeTurn: (speaker: string) => void;
  // Las siguientes propiedades ya no se utilizan en el componente actual
  // pero se mantienen comentadas para referencia futura
  // hasRecordedContent: boolean;
  // onSend: (content: string) => void;
  // onDiscard: () => void;
  // userMessage?: string;
  // setUserMessage?: (message: string) => void;
  isAIGenerating?: boolean;
};

export default function TurnManagement({ 
  activeSpeaker,
  onChangeTurn,
  // Propiedades no utilizadas eliminadas de la destructuración
  // hasRecordedContent,
  // onSend,
  // onDiscard,
  // userMessage = '',
  // setUserMessage = () => {},
  isAIGenerating = false
}: TurnManagementProps) {
  // Acceder al contexto para obtener información sobre el turno actual
  const { currentTurnName, opponentName } = useDebateContext();
  
  // Estado para controlar la visibilidad del popup de confirmación
  // IMPORTANTE: Todos los hooks deben estar al inicio del componente
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Referencia al textarea para enfocarlo cuando sea el turno del usuario
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Enfocar el textarea cuando el activeSpeaker cambie a 'user'
  useEffect(() => {
    if (activeSpeaker === 'user' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeSpeaker]);
  
  // Ahora mostraremos el botón para ambos turnos (usuario y IA)
  // pero con texto diferente según quién tenga el turno actual
  
  // Función para manejar el cambio de turno
  const handleTurnChangeClick = () => {
    // Determinar a qué hablante cambiar basándonos en el hablante actual
    if (activeSpeaker === 'user') {
      // Si el turno activo es del usuario, mostrar el popup de confirmación
      setShowConfirmation(true);
    } else if (activeSpeaker === 'ai') {
      // Si el turno es de la IA, cambiar directamente al usuario
      onChangeTurn('user');
    } else {
      // Si no hay hablante activo, establecer el usuario como hablante
      onChangeTurn('user');
    }
  };
  
  // Función para confirmar el cambio de turno
  const handleConfirmChange = () => {
    onChangeTurn('ai');
    setShowConfirmation(false);
  };
  
  // Función para cancelar el cambio de turno
  const handleCancelChange = () => {
    setShowConfirmation(false);
  };
  
  // Cuando es el turno de la IA, mostrar botón para tomar el turno
  return (
    <div className="flex flex-col items-center gap-2">
      {isAIGenerating ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent dark:border-gray-400 dark:border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
            {activeSpeaker === 'ai' ? opponentName || 'AI' : 'The AI'} is thinking...
          </span>
        </div>
      ) : (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 rounded-md text-xs 
                      text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 
                      focus:outline-none flex items-center gap-1.5"
            onClick={handleTurnChangeClick}
            aria-label={activeSpeaker === 'user' ? 'Yield turn' : 'Take turn'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4"></path>
              <path d="M3 11V9a4 4 0 014-4h14"></path>
              <path d="M7 23l-4-4 4-4"></path>
              <path d="M21 13v2a4 4 0 01-4 4H3"></path>
            </svg>
            {activeSpeaker === 'user' ? 'Yield turn' : 'Take turn'}
          </motion.button>
          
          <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
            Current turn: {activeSpeaker === 'user' ? 'Your turn' : (opponentName || 'AI')} ({currentTurnName})
          </span>
        </>
      )}
      
      {/* Popup de confirmación para cambio de turno */}
      <TurnConfirmationPopup
        isVisible={showConfirmation}
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
        text="Are you sure you want to yield your turn to the AI? If you haven't written anything, your turn will remain empty."
      />
    </div>
  );
}
