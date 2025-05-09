'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDebateContext } from '@/context/DebateContext';
import TurnConfirmationPopup from './interventions/TurnConfirmationPopup';

type TurnManagementProps = {
  activeSpeaker: string | null;
  onChangeTurn: (speaker: string) => void;
  hasRecordedContent: boolean;
  onSend: (content: string) => void;
  onDiscard: () => void;
  isAIGenerating?: boolean;
  userMessage?: string;
  setUserMessage?: (message: string) => void;
};

export default function TurnManagement({ 
  activeSpeaker,
  onChangeTurn,
  hasRecordedContent,
  onSend,
  onDiscard,
  isAIGenerating = false,
  userMessage = '',
  setUserMessage = () => {}
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
  
  // Si es el turno del usuario, mostrar el área de entrada de texto
  if (activeSpeaker === 'user') {
    return (
      <div className="flex flex-col w-full max-w-xl gap-3">
        {/* Campo de texto para el mensaje del usuario */}
        <textarea
          ref={textareaRef}
          className="w-full p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 
                   bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                   focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600"
          placeholder="Escribe tu argumento aquí..."
          rows={3}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          disabled={isAIGenerating}
        />
        
        <div className="flex items-center gap-3 self-end">
          {/* Botón de descartar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 rounded-md text-xs border border-gray-200 dark:border-gray-700 
                      text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/70 
                      focus:outline-none"
            onClick={onDiscard}
            disabled={isAIGenerating}
            aria-label="Descartar"
          >
            Descartar
          </motion.button>
          
          {/* Botón de enviar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-1.5 rounded-md text-xs 
                        text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 
                        focus:outline-none disabled:opacity-50 disabled:pointer-events-none 
                        flex items-center gap-2`}
            onClick={() => onSend(userMessage)}
            disabled={!userMessage.trim() || isAIGenerating}
            aria-label="Enviar mensaje"
          >
            {isAIGenerating ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>Enviar</>  
            )}
          </motion.button>
        </div>
      </div>
    );
  }
  
  // Función para manejar el cambio de turno
  const handleTurnChangeClick = () => {
    // Si el turno activo es del usuario, mostrar el popup de confirmación
    if (activeSpeaker === 'user') {
      setShowConfirmation(true);
    } else {
      // Si el turno es de la IA, cambiar directamente
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
            {activeSpeaker === 'ai' ? opponentName || 'AI' : 'La IA'} está pensando...
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
            aria-label="Tomar turno"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4"></path>
              <path d="M3 11V9a4 4 0 014-4h14"></path>
              <path d="M7 23l-4-4 4-4"></path>
              <path d="M21 13v2a4 4 0 01-4 4H3"></path>
            </svg>
            Tomar turno
          </motion.button>
          
          <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
            Turno actual: {currentTurnName}
          </span>
        </>
      )}
      
      {/* Popup de confirmación para cambio de turno */}
      <TurnConfirmationPopup
        isVisible={showConfirmation}
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
        text="¿Estás seguro de que deseas ceder tu turno? Tu turno quedará vacío y esto contará en las estadísticas del debate."
      />
    </div>
  );
}
