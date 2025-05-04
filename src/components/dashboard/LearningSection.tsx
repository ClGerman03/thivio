'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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

// Define la interfaz para un Learning/Document
interface Learning {
  id: string;
  title: string;
  createdAt: string;
  status: 'analyzed' | 'processing' | 'pending';
}

// Mock data - In a real app, this would come from API
const mockLearnings: Learning[] = [];

export default function LearningSection() {
  // In a real app, we would use a hook to fetch data
  const learnings = mockLearnings;
  const isLoading = false;
  const router = useRouter();
  
  // Función para crear un nuevo aprendizaje y redirigir a la página de learn
  const createNewLearning = () => {
    // En desarrollo generamos un ID determinístico basado en el timestamp
    // En producción, esto sería manejado por el backend (por ejemplo, Supabase)
    const timestamp = Date.now();
    const documentId = `dev-${timestamp}`;
    
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
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* This would map through learnings in a real app */}
          {/* Example of how each learning card would be structured:
          {learnings.map(learning => (
            <Link href={`/learn/${learning.id}`} key={learning.id} className="...">
              <div className="...">
                <h3>{learning.title}</h3>
                <p>{learning.createdAt}</p>
                <span>{learning.status}</span>
              </div>
            </Link>
          ))} 
          */}
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
            You don't have any saved learnings
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
