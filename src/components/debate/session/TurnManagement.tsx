'use client';

import { motion } from 'framer-motion';
import { useDebateContext } from './DebateSession';

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
  // Eliminamos isRecording
  hasRecordedContent,
  onSend,
  onDiscard
}: TurnManagementProps) {
  // Acceder al contexto para obtener información sobre el turno actual
  const { currentTurnName } = useDebateContext(); // Solo necesitamos currentTurnName
  
  // Si el usuario ha terminado de grabar y tiene contenido, mostrar opciones de enviar/descartar
  if (activeSpeaker === 'user' && hasRecordedContent) {
    return (
      <div className="flex items-center gap-4">
        {/* Botón de enviar/confirmar */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400 focus:outline-none"
          onClick={onSend}
          aria-label="Send your intervention"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.button>
        
        {/* Botón de descartar */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 focus:outline-none"
          onClick={onDiscard}
          aria-label="Discard your intervention"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </motion.button>
      </div>
    );
  }
  
  // Si el usuario está grabando o en cualquier otro estado, mostrar el botón de cambio de turno normal
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 focus:outline-none"
          onClick={() => onChangeTurn(activeSpeaker === 'ai' ? 'user' : 'ai')}
          aria-label="Change turn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4"></path>
            <path d="M3 11V9a4 4 0 014-4h14"></path>
            <path d="M7 23l-4-4 4-4"></path>
            <path d="M21 13v2a4 4 0 01-4 4H3"></path>
          </svg>
        </motion.button>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
          {activeSpeaker === 'ai' ? 'AI' : 'Your'} turn • {currentTurnName}
        </span>
      </div>
    </div>
  );
}
