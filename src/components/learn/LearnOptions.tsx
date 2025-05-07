'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Iconos para las diferentes opciones de debate
const SparringIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
    <path d="M8 9h8"></path>
    <path d="M8 13h6"></path>
  </svg>
);

const StructureIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const WeakPointsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

type LearnOptionsProps = {
  documentId: string;
};

export default function LearnOptions({ documentId }: LearnOptionsProps) {
  const router = useRouter();
  // Eliminamos el estado selectedOption ya que no lo estamos usando en el renderizado

  const handleOptionSelect = (optionId: string) => {
    
    // Solo el modo de debate/sparring está activo
    if (optionId === 'debate') {
      // Generar un ID único para el debate
      // Esto permite tener múltiples debates para un mismo learning
      const generateUniqueDebateId = () => {
        return `debate-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      };
      
      const debateId = generateUniqueDebateId();
      
      // Pasamos el ID del debate como parte de la ruta y el ID del learning como parámetro
      // Esto permite mantener una relación clara entre debate y learning sin usar el mismo ID
      router.push(`/debates/${debateId}?learningId=${documentId}`);
      
      console.log(`Created new debate session with ID: ${debateId} for learning: ${documentId}`);
    } else {
      // Para los otros dos botones, simplemente mostrar un mensaje en consola
      console.log(`Modo ${optionId} seleccionado pero no está disponible todavía`);
    }
  };

  const options = [
    {
      id: 'debate',
      title: 'Sparring Mode',
      description: 'Engage in a structured debate to explore different perspectives',
      icon: <SparringIcon />,
    },
    {
      id: 'structure',
      title: 'Structure Analysis',
      description: 'Break down complex arguments and identify underlying structure',
      icon: <StructureIcon />,
    },
    {
      id: 'weakpoints',
      title: 'Find Weak Points',
      description: 'Identify logical fallacies and vulnerabilities in arguments',
      icon: <WeakPointsIcon />,
    },
  ];

  // Loading state removed

  // Determinar si una opción está disponible (por ahora solo Sparring Mode)
  const isOptionAvailable = (optionId: string) => optionId === 'debate';
  
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {options.map((option) => {
        const isAvailable = isOptionAvailable(option.id);
        
        return (
          <motion.div
            key={option.id}
            className={`
              border border-gray-100 dark:border-gray-800 rounded-lg p-4
              ${isAvailable ? 'hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer' : 'opacity-70 cursor-default'}
              transition-colors flex flex-col items-center justify-center
              ${option.id === 'debate' ? 'shadow-[0_0_5px_rgba(59,130,246,0.3)]' : ''}
              relative
            `}
            whileHover={isAvailable ? { y: -2 } : {}} // Solo aplicar animación si está disponible
            onClick={() => isAvailable && handleOptionSelect(option.id)}
          >
            <div className="flex flex-col items-center text-center">
              {option.id === 'debate' ? (
                <span className="absolute top-1 right-1 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  Beta
                </span>
              ) : (
                <span className="absolute top-1 right-1 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  Coming Soon
                </span>
              )}
              <div className="text-gray-400 dark:text-gray-600 mb-2">
                {option.icon}
              </div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {option.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light max-w-[160px] line-clamp-2">
                {option.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
