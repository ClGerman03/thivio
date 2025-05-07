'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Learning, getAllLearnings, createLearning } from '@/services/learningService';

// Usando iconos similares a los de Lucide con SVG básico para no añadir dependencias
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

// Icono de libro para los learning cards
const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

// Interface definida ahora en learningService.ts

export default function LearningSection() {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Cargar los learnings desde localStorage al montar el componente
  useEffect(() => {
    // Pequeño timeout para simular carga desde una API
    const timer = setTimeout(() => {
      const savedLearnings = getAllLearnings();
      setLearnings(savedLearnings);
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Función para crear un nuevo aprendizaje y redirigir a la página de learn
  const createNewLearning = () => {
    // En desarrollo generamos un ID determinístico basado en el timestamp
    // En producción, esto sería manejado por el backend (por ejemplo, Supabase)
    const timestamp = Date.now();
    const documentId = `dev-${timestamp}`;
    
    // Crear un nuevo learning en localStorage con un título personalizado para identificarlo mejor
    const learningTitle = `Learning ${new Date().toLocaleDateString()}`;
    
    // Guardar el título también en el localStorage individual para asegurar consistencia
    localStorage.setItem(`doc_title_${documentId}`, learningTitle);
    
    // Crear el learning usando el servicio
    const newLearning = createLearning(documentId, learningTitle);
    console.log('Nuevo learning creado:', newLearning);
    
    // Redirigir al usuario a la página de learn con el nuevo ID
    router.push(`/learn/${documentId}`);
  };
  
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-gray-700 dark:text-gray-300">My Learnings</h2>
        <button 
          onClick={createNewLearning}
          className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <PlusIcon />
          <span className="font-light">New Learning</span>
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-5 h-5 border border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
        </div>
      ) : learnings.length > 0 ? (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {learnings.map(learning => (
            <Link 
              href={`/learn/${learning.id}`} 
              key={learning.id} 
              className="group block aspect-square bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Icono de libro */}
                  <div className="text-gray-400 dark:text-gray-600 mb-2">
                    <BookIcon />
                  </div>
                  <h3 className="text-sm font-light text-gray-700 dark:text-gray-200 mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {learning.title}
                  </h3>
                  
                  {/* Extracto de texto si existe */}
                  {learning.content?.text && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 mb-1 font-light">
                      {learning.content.text.substring(0, 100)}{learning.content.text.length > 100 ? '...' : ''}
                    </p>
                  )}
                  
                  {/* Indicador de archivos si existen */}
                  {learning.content?.fileNames && learning.content.fileNames.length > 0 && (
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <span>{learning.content.fileNames.length} {learning.content.fileNames.length === 1 ? 'archivo' : 'archivos'}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-2">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-light">
                    {new Date(learning.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </p>
                  {/* Punto de estado minimalista */}
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      learning.status === 'analyzed' 
                        ? 'bg-green-500 dark:bg-green-400' 
                        : learning.status === 'processing' 
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-amber-500 dark:bg-amber-400'
                    }`}
                    title={learning.status.charAt(0).toUpperCase() + learning.status.slice(1)}
                  />
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="bg-gray-50/70 dark:bg-gray-800/50 rounded-lg py-12 px-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4 text-gray-400 dark:text-gray-500">
            <ClipboardIcon />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2 font-light">
            You don&apos;t have any saved learnings
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-5 max-w-sm mx-auto">
            Upload your first document to enhance your understanding with AI assistance
          </p>
          <button 
            onClick={createNewLearning}
            className="px-5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm inline-flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <PlusIcon />
            <span className="font-light">New Learning</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
