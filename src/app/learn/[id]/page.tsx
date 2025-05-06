'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
  
  // Efecto para cargar los datos guardados de localStorage (simulando persistencia)
  useEffect(() => {
    // Al usar el ID del documento, cada documento tendrá su propio título/subtítulo, archivos y contexto
    const savedTitle = localStorage.getItem(`doc_title_${id}`);
    const savedSubtitle = localStorage.getItem(`doc_subtitle_${id}`);
    const savedFileName = localStorage.getItem(`doc_file_${id}`);
    const savedText = localStorage.getItem(`doc_text_${id}`);
    
    if (savedTitle) setTitle(savedTitle);
    if (savedSubtitle) setSubtitle(savedSubtitle);
    if (savedText) setLearningContext(savedText);
    
    // Si hay un archivo o texto guardado, simular que tenemos contenido generado
    if (savedFileName || savedText) {
      setHasGeneratedContent(true);
    }
  }, [id]);
  
  // Manejadores para guardar los cambios
  const handleTitleSave = (newTitle: string) => {
    setTitle(newTitle);
    localStorage.setItem(`doc_title_${id}`, newTitle);
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
    
    // Simulate content generation after file upload
    setTimeout(() => {
      setHasGeneratedContent(true);
    }, 1000);
  };
  
  // Manejar la adición de texto
  const handleTextAdded = (text: string) => {
    console.log('Texto agregado:', text.substring(0, 50) + '...');
    setLearningContext(text);
    
    // Simulate content generation after text added
    setTimeout(() => {
      setHasGeneratedContent(true);
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
