'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDebateContext } from '@/context/DebateContext';
import TurnConfirmationPopup from './interventions/TurnConfirmationPopup';

type TurnManagementProps = {
  activeSpeaker: string | null;
  onChangeTurn: (speaker: string) => void;
  // Eliminamos isRecording ya que no se usa en el componente
  hasRecordedContent: boolean;
  onSend: () => void;
  onDiscard: () => void;
};

export default function TurnManagement({ 
  activeSpeaker,
  onChangeTurn,
  hasRecordedContent,
  onSend,
  onDiscard
}: TurnManagementProps) {
  // Acceder al contexto para obtener información sobre el turno actual
  const { currentTurnName } = useDebateContext();
  
  // Si el usuario ha terminado de grabar y tiene contenido
  if (activeSpeaker === 'user' && hasRecordedContent) {
    return (
      <div className="flex items-center gap-3">
        {/* Botón de enviar */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-green-500/90 dark:text-green-400/90 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none"
          onClick={onSend}
          aria-label="Send your intervention"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.button>
        
        {/* Botón de descartar */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-red-500/80 dark:text-red-400/80 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none"
          onClick={onDiscard}
          aria-label="Discard your intervention"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </motion.button>
      </div>
    );
  }
  
  // Estado para controlar la visibilidad del popup de confirmación
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Función para mostrar el popup de confirmación
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
  
  // Botón de cambio de turno con estilo simplificado
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none"
        onClick={handleTurnChangeClick}
        aria-label="Change turn"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 1l4 4-4 4"></path>
          <path d="M3 11V9a4 4 0 014-4h14"></path>
          <path d="M7 23l-4-4 4-4"></path>
          <path d="M21 13v2a4 4 0 01-4 4H3"></path>
        </svg>
      </motion.button>
      
      <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
        {activeSpeaker === 'ai' ? 'AI' : 'Your'} turn • {currentTurnName}
      </span>
      
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
