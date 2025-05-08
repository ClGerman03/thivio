'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getDebatesByLearningId, getSavedDebates } from '@/services/debateService';

type Summary = {
  id: string;
  title: string;
  excerpt: string;
  type: 'debate' | 'structure' | 'weakpoints';
  createdAt: string;
};

interface ContentSummariesProps {
  // El documentId se mantiene en la interfaz, pero se comentará en la función
  documentId: string;
}

export default function ContentSummaries({ documentId }: ContentSummariesProps) {
  const router = useRouter();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  
  // Cargar los debates relacionados con este learning cuando el componente se monta
  useEffect(() => {
    // Agregar depuración para ver el ID del documento que estamos buscando
    console.log('ContentSummaries: Buscando debates para el learning ID:', documentId);
    
    // Obtener todos los debates para depuración
    const allDebates = getSavedDebates();
    console.log('ContentSummaries: Todos los debates guardados:', allDebates);
    
    // Obtener debates relacionados con este learning
    const relatedDebates = getDebatesByLearningId(documentId);
    console.log('ContentSummaries: Debates relacionados encontrados:', relatedDebates);
    
    // Convertir los debates al formato de Summary para mostrarlos
    const debateSummaries = relatedDebates.map(debate => ({
      id: debate.id,
      title: debate.debateName || `Debate: ${debate.topics[0] || ''}`,
      excerpt: `Topics: ${debate.topics.join(', ')}`,
      type: 'debate' as const,
      createdAt: new Date(debate.timestamp || Date.now()).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }));
    
    console.log('ContentSummaries: Resúmenes de debate creados:', debateSummaries);
    setSummaries(debateSummaries);
  }, [documentId]);
  
  // Ya no necesitamos crear debates de ejemplo
  // Ahora confiamos en los debates reales guardados en localStorage

  if (summaries.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-light text-gray-800 dark:text-white mb-4">
          Analysis & Insights
        </h2>
        
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50/30 dark:bg-gray-800/20 rounded-lg border border-gray-100/50 dark:border-gray-800/50">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-700 mb-4">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <line x1="9" y1="2" x2="9" y2="4"></line>
            <line x1="15" y1="2" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="22"></line>
            <line x1="15" y1="20" x2="15" y2="22"></line>
            <line x1="20" y1="9" x2="22" y2="9"></line>
            <line x1="20" y1="14" x2="22" y2="14"></line>
            <line x1="2" y1="9" x2="4" y2="9"></line>
            <line x1="2" y1="14" x2="4" y2="14"></line>
          </svg>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-light">
            No analysis available yet
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 max-w-md text-center">
            Add content and start the analysis to see insights and summaries here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-light text-gray-800 dark:text-white mb-4">
        Previous Analyses
      </h2>
      
      <div className="space-y-2">
        {summaries.map((summary, index) => (
          <motion.div
            key={summary.id}
            className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden hover:border-gray-200 dark:hover:border-gray-700 transition-colors cursor-pointer group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.005 }}
            onClick={() => {
              // Navegar a la página de debate con el ID de learning como queryParam
              router.push(`/debates/${summary.id}?learningId=${documentId}`);
            }}
          >
            <div className="flex items-center p-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  {summary.type === 'debate' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
                      </svg>
                      Debate
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                    {summary.createdAt}
                  </span>
                </div>
                
                <h3 className="text-xs font-medium text-gray-800 dark:text-white truncate">
                  {summary.title}
                </h3>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {summary.excerpt}
                </p>
              </div>
              
              <div className="ml-2 p-1 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
