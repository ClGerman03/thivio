'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  getLearningById, 
  saveLearning,
  updateLearningContent, 
  markLearningAsAnalyzed,
  migrateLegacyData
} from '@/services/learningService';
import LearnOptions from '@/components/learn/LearnOptions';
import ContentSummaries from '@/components/learn/ContentSummaries';
import EditableText from '@/components/shared/EditableText';
import ContentOptions from '@/components/learn/inputcontent/ContentOptions';

export default function LearnPage() {
  const params = useParams();
  const id = params?.id as string;
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  // Retenemos la función setter pero comentamos la variable no utilizada
  const [, setUploadedFiles] = useState<File[]>([]);
  const [, setLearningContext] = useState<string>('');
  
  // Estado para almacenar el título y subtítulo editables
  const [title, setTitle] = useState('Document Analysis Tools');
  const [subtitle, setSubtitle] = useState('Choose how you&apos;d like to enhance your understanding of this document');
  
  // Efecto para cargar los datos guardados o migrar datos antiguos
  useEffect(() => {
    // Intentar migrar datos antiguos al nuevo formato
    const migratedLearning = migrateLegacyData(id);
    
    if (migratedLearning) {
      // Actualizar los estados con los datos del learning
      setTitle(migratedLearning.title);
      
      // Cargar subtítulo desde localStorage (por compatibilidad)
      const savedSubtitle = localStorage.getItem(`doc_subtitle_${id}`);
      if (savedSubtitle) {
        setSubtitle(savedSubtitle);
      }
      
      // Cargar contenido del learning
      if (migratedLearning.content) {
        if (migratedLearning.content.text) {
          setLearningContext(migratedLearning.content.text);
        }
        
        // Si hay contenido, mostrar que tenemos contenido generado
        if (migratedLearning.content.text || 
            (migratedLearning.content.fileNames && migratedLearning.content.fileNames.length > 0)) {
          setHasGeneratedContent(true);
        }
      }
    } else {
      // No se encontraron datos, cargar valores por defecto
      const defaultLearning = getLearningById(id);
      if (defaultLearning) {
        setTitle(defaultLearning.title);
      }
    }
  }, [id]);
  
  // Manejadores para guardar los cambios
  const handleTitleSave = (newTitle: string) => {
    setTitle(newTitle);
    
    // Actualizar el título en el learning
    const existingLearning = getLearningById(id);
    if (existingLearning) {
      existingLearning.title = newTitle;
      existingLearning.updatedAt = new Date().toISOString();
      saveLearning(existingLearning);
    } else {
      // Crear un nuevo learning si no existe
      const newLearning = {
        id,
        title: newTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending' as 'pending', // Especificar literal type
        content: {}
      };
      saveLearning(newLearning);
    }
  };
  
  const handleSubtitleSave = (newSubtitle: string) => {
    setSubtitle(newSubtitle);
    localStorage.setItem(`doc_subtitle_${id}`, newSubtitle);
  };
  
  // Manejar la carga de archivos
  const handleFileUploaded = (files: File[]) => {
    if (files.length === 0) return;
    
    console.log(`${files.length} archivos cargados`);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Obtener nombres de archivos para guardar
    const fileNames = files.map(file => file.name);
    
    // Actualizar el contenido del learning con los nuevos archivos
    updateLearningContent(id, { fileNames });
    
    // Simulate content generation after file upload
    setTimeout(() => {
      setHasGeneratedContent(true);
      
      // Marcar como analizado después del procesamiento
      markLearningAsAnalyzed(id);
    }, 1000);
  };
  
  // Manejar la adición de texto
  const handleTextAdded = (text: string) => {
    console.log('Texto agregado:', text.substring(0, 50) + '...');
    setLearningContext(text);
    
    // Actualizar el contenido del learning con el nuevo texto
    updateLearningContent(id, { text });
    
    // Simulate content generation after text added
    setTimeout(() => {
      setHasGeneratedContent(true);
      
      // Marcar como analizado después del procesamiento
      markLearningAsAnalyzed(id);
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
