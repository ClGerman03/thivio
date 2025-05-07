'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  getLearningById, 
  getAllLearnings,
  saveLearning,
  updateLearningContent, 
  markLearningAsAnalyzed,
  migrateLegacyData,
  Learning
} from '@/services/learningService';
import LearnOptions from '@/components/learn/LearnOptions';
import ContentSummaries from '@/components/learn/ContentSummaries';
import EditableText from '@/components/shared/EditableText';
import ContentOptions from '@/components/learn/inputcontent/ContentOptions';

export default function LearnPage() {
  const params = useParams();
  const id = params?.id as string;
  
  // Estados para controlar la UI y datos del learning
  const [currentLearning, setCurrentLearning] = useState<Learning | null>(null);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  // Estado para el contenido del learning, aunque no se usa directamente en la UI,
  // se utiliza en la actualización de datos
  const [, setLearningContext] = useState<string>('');
  
  // Estado para almacenar el título y subtítulo editables
  const [title, setTitle] = useState('Document Analysis Tools');
  const [subtitle, setSubtitle] = useState('Choose how you\'d like to enhance your understanding of this document');
  
  // Efecto para cargar los datos del learning específico
  useEffect(() => {
    console.log('[LearnPage] Intentando cargar learning con ID:', id);
    
    // Ver todos los learnings disponibles para depuración
    const allLearnings = getAllLearnings();
    console.log('[LearnPage] Todos los learnings disponibles:', allLearnings);
    
    // Primero intentamos obtener el learning directamente
    let learning = getLearningById(id);
    console.log('[LearnPage] Learning obtenido por ID:', learning);
    
    // Si no existe, intentamos migrar datos antiguos como fallback
    if (!learning) {
      console.log('[LearnPage] Learning no encontrado, intentando migrar datos antiguos...');
      learning = migrateLegacyData(id);
      console.log('[LearnPage] Resultado de migración:', learning);
    }
    
    if (learning) {
      console.log('[LearnPage] Learning encontrado, actualizando estados...');
      // Actualizamos el estado con el learning encontrado
      setCurrentLearning(learning);
      setTitle(learning.title);
      console.log('[LearnPage] Title actualizado:', learning.title);
      
      // Cargar el contenido del learning si existe
      if (learning.content) {
        // Cargar texto si existe
        if (learning.content.text) {
          setLearningContext(learning.content.text);
        }
        
        // Verificar si hay archivos
        const hasFiles = learning.content.fileNames && learning.content.fileNames.length > 0;
        
        // Si hay texto o archivos, marcar como contenido generado
        if (learning.content.text || hasFiles) {
          setHasGeneratedContent(true);
        }
      }
      
      // Cargar subtítulo desde localStorage (por compatibilidad)
      // En futuras versiones, esto debería integrarse en el objeto learning
      const savedSubtitle = localStorage.getItem(`doc_subtitle_${id}`);
      if (savedSubtitle) {
        setSubtitle(savedSubtitle);
      }
    } else {
      // Si no hay learning, crear uno nuevo con valores predeterminados
      const newLearning = {
        id,
        title: 'Document Analysis Tools',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending' as const,
        content: {}
      };
      
      setCurrentLearning(newLearning);
      saveLearning(newLearning);
    }
  }, [id]);
  
  // Manejador para guardar cambios en el título
  const handleTitleSave = (newTitle: string) => {
    setTitle(newTitle);
    
    // Actualizar el learning actual con el nuevo título
    if (currentLearning) {
      const updatedLearning = {
        ...currentLearning,
        title: newTitle,
        updatedAt: new Date().toISOString()
      };
      
      setCurrentLearning(updatedLearning);
      saveLearning(updatedLearning);
    } else {
      // Si por alguna razón no existe el learning actual, crear uno nuevo
      const newLearning: Learning = {
        id,
        title: newTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
        content: {}
      };
      
      setCurrentLearning(newLearning);
      saveLearning(newLearning);
    }
  };
  
  // Manejador para guardar cambios en el subtítulo
  const handleSubtitleSave = (newSubtitle: string) => {
    setSubtitle(newSubtitle);
    
    // Guardar en localStorage por compatibilidad con el sistema actual
    // TODO: En futuras versiones, integrar el subtítulo en el objeto learning
    localStorage.setItem(`doc_subtitle_${id}`, newSubtitle);
  };
  
  // Manejador para la carga de archivos
  const handleFileUploaded = (files: File[]) => {
    if (files.length === 0) return;
    
    console.log(`${files.length} archivos cargados`);
    // Actualizar el estado de archivos
    const newFiles = [...uploadedFiles, ...files];
    setUploadedFiles(newFiles);
    
    // Obtener nombres de archivos para guardar
    const fileNames = files.map(file => file.name);
    
    // Obtener nombres de archivos existentes si hay
    const existingFileNames = currentLearning?.content?.fileNames || [];
    const updatedFileNames = [...existingFileNames, ...fileNames];
    
    // Actualizar el contenido del learning con los nuevos archivos
    const updatedLearning = updateLearningContent(id, { fileNames: updatedFileNames });
    if (updatedLearning) {
      setCurrentLearning(updatedLearning);
    }
    
    // Simular generación de contenido después de la carga de archivos
    setTimeout(() => {
      setHasGeneratedContent(true);
      
      // Marcar como analizado después del procesamiento
      const analyzedLearning = markLearningAsAnalyzed(id);
      if (analyzedLearning) {
        setCurrentLearning(analyzedLearning);
      }
    }, 1000);
  };
  
  // Manejador para la adición de texto
  const handleTextAdded = (text: string) => {
    console.log('Texto agregado:', text.substring(0, 50) + '...');
    setLearningContext(text);
    
    // Actualizar el contenido del learning con el nuevo texto
    const updatedLearning = updateLearningContent(id, { text });
    if (updatedLearning) {
      setCurrentLearning(updatedLearning);
    }
    
    // Simular generación de contenido después de agregar texto
    setTimeout(() => {
      setHasGeneratedContent(true);
      
      // Marcar como analizado después del procesamiento
      const analyzedLearning = markLearningAsAnalyzed(id);
      if (analyzedLearning) {
        setCurrentLearning(analyzedLearning);
      }
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <motion.div 
        className="w-full max-w-3xl mx-auto p-6 pt-10 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-2">
          <Link 
            href="/dashboard" 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back to dashboard</span>
          </Link>
        </div>
        
        <div className="my-6">
          <EditableText
            as="h1"
            initialText={title}
            onSave={handleTitleSave}
            className="text-gray-800 dark:text-white mb-2" 
            placeholder="Enter document title"
          />
          <EditableText
            as="p"
            initialText={subtitle}
            onSave={handleSubtitleSave}
            className="text-gray-500 dark:text-gray-400 max-w-md mb-4"
            placeholder="Enter document description"
          />
          
          {/* Opciones de contenido */}
          <ContentOptions 
            documentId={id}
            onFileUploaded={handleFileUploaded}
            onTextAdded={handleTextAdded}
            initialText={currentLearning?.content?.text || ''}
            initialFileNames={currentLearning?.content?.fileNames || []}
          />
        </div>
        
        {hasGeneratedContent ? (
          <>
            {/* Learning Options */}
            <LearnOptions documentId={id} />
            
            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800 my-10"></div>
            
            {/* Content Summaries */}
            <ContentSummaries documentId={id} />
          </>
        ) : (
          <div className="mt-10 text-center py-10">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add content to start analyzing your document
            </p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
