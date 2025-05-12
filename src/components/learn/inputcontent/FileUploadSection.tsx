'use client';

import { useState, useRef, useEffect } from 'react';
import { StoredFile, getFilesForLearning, getFile } from '@/services/fileStorageService';

interface FileUploadSectionProps {
  selectedFiles: File[];
  existingFiles: string[];
  learningId?: string;
  onFilesChange: (files: File[]) => void;
  onExistingFilesChange: (files: string[]) => void;
  maxFiles?: number;
}

export default function FileUploadSection({
  selectedFiles,
  existingFiles,
  learningId,
  onFilesChange,
  onExistingFilesChange,
  maxFiles = 5
}: FileUploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [storedFiles, setStoredFiles] = useState<Array<Omit<StoredFile, 'content'>>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cargar los metadatos de archivos almacenados cuando cambia el learningId
  useEffect(() => {
    async function loadStoredFiles() {
      if (learningId) {
        try {
          const files = await getFilesForLearning(learningId);
          setStoredFiles(files);
        } catch (error) {
          console.error('Error loading stored files:', error);
        }
      }
    }
    
    loadStoredFiles();
  }, [learningId]);
  
  // File handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) {
      setDragActive(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMessage('');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Convert FileList to array
      const newFiles = Array.from(e.dataTransfer.files);
      
      // Check if exceeding maximum file limit
      if (selectedFiles.length + existingFiles.length + newFiles.length > maxFiles) {
        setErrorMessage(`Maximum ${maxFiles} files allowed`);
        return;
      }
      
      onFilesChange([...selectedFiles, ...newFiles]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array
      const newFiles = Array.from(e.target.files);
      
      // Check if exceeding maximum file limit
      if (selectedFiles.length + existingFiles.length + newFiles.length > maxFiles) {
        setErrorMessage(`Maximum ${maxFiles} files allowed`);
        return;
      }
      
      onFilesChange([...selectedFiles, ...newFiles]);
      
      // Clear input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };
  
  const handleRemoveExistingFile = (index: number) => {
    const newFiles = [...existingFiles];
    newFiles.splice(index, 1);
    onExistingFilesChange(newFiles);
  };
  
    const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Función para visualizar un archivo almacenado
  const handleViewStoredFile = async (fileId: string) => {
    try {
      const file = await getFile(fileId);
      if (!file) {
        console.error('Archivo no encontrado');
        return;
      }
      
      // Crear un objeto URL para el contenido
      let dataUrl = file.content;
      
      // Si el contenido no es una URL de datos, conviértelo
      if (!dataUrl.startsWith('data:')) {
        // Es texto plano, convertirlo a blob
        const blob = new Blob([dataUrl], { type: 'text/plain' });
        dataUrl = URL.createObjectURL(blob);
      }
      
      // Abrir en una nueva pestaña
      window.open(dataUrl, '_blank');
    } catch (error) {
      console.error('Error al abrir el archivo:', error);
    }
  };
  
  // Función para previsualizar un archivo que se está subiendo
  const handlePreviewFile = (file: File) => {
    try {
      // Crear una URL temporal para el archivo
      const objectUrl = URL.createObjectURL(file);
      
      // Abrir en una nueva pestaña
      window.open(objectUrl, '_blank');
      
      // Limpiar la URL cuando se cierre (aunque los navegadores suelen limpiarla automáticamente)
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (error) {
      console.error('Error al previsualizar el archivo:', error);
    }
  };
  
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Upload Files
      </p>

      {/* Existing files - from both legacy existingFiles and new storedFiles */}
      {(existingFiles.length > 0 || storedFiles.length > 0) && (
        <div className="mb-3">
          <div className="space-y-2">
            {/* Show stored files from IndexedDB */}
            {storedFiles.map((file, index) => (
              <div key={`stored-${file.id}`} className="p-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                onClick={() => handleViewStoredFile(file.id)}
                title="Click para visualizar el archivo"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{file.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</div>
                    </div>
                  </div>
                  {/* Botón para eliminar */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar que el click se propague al contenedor
                      handleRemoveExistingFile(index);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Legacy files from fileNames (for compatibility) */}
            {storedFiles.length === 0 && existingFiles.map((fileName, index) => (
              <div key={`existing-${index}`} className="p-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{fileName}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveExistingFile(index)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="mb-3">
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={`selected-${index}`} className="p-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handlePreviewFile(file)}
                title="Click para visualizar el archivo"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{file.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</div>
                    </div>
                  </div>
                  {/* Botón para eliminar el archivo */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar que el click se propague al contenedor
                      handleRemoveFile(index);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mb-3 text-center">
          <p className="text-sm text-red-500 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Drag and drop area - more compact */}
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors
                   ${dragActive 
                     ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-800/30' 
                     : 'border-gray-200 dark:border-gray-700'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-2">
          <div className="flex items-center gap-2 mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag files or
            </p>
            <button
              onClick={handleFileButtonClick} 
              className="text-sm text-gray-700 dark:text-gray-300 underline hover:text-gray-900 dark:hover:text-gray-100"
            >
              browse
            </button>
          </div>
          
          {/* File limit info */}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {`${selectedFiles.length + existingFiles.length}/${maxFiles} files (PDF, Word, TXT, Markdown)`}
          </p>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md"
        multiple
      />
    </div>
  );
}
