'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface EditableTextProps {
  initialText: string;
  placeholder?: string;
  className?: string;
  onSave?: (text: string) => void;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

export default function EditableText({
  initialText,
  placeholder = 'Enter text',
  className = '',
  onSave,
  as = 'p'
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Aplicar clases base según el elemento
  const getBaseClasses = () => {
    switch (as) {
      case 'h1':
        return 'text-xl font-light leading-tight';
      case 'p':
        return 'text-sm';
      default:
        return '';
    }
  };

  // Enfocar el input cuando se inicia la edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Seleccionar todo el texto
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    saveChanges();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveChanges();
    } else if (e.key === 'Escape') {
      // Cancelar la edición y volver al texto original
      setText(initialText);
      setIsEditing(false);
    }
  };

  const saveChanges = () => {
    setIsEditing(false);
    
    // Solo guardar si ha cambiado el texto y no está vacío
    if (text.trim() && text !== initialText && onSave) {
      onSave(text);
    }
    
    // Si está vacío, volver al texto original
    if (!text.trim()) {
      setText(initialText);
    }
  };

  // Renderizar el componente según si está en modo edición o no
  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-transparent border-b border-gray-200 dark:border-gray-700/30 px-0 py-0 outline-none focus:border-gray-400 dark:focus:border-gray-600 ${getBaseClasses()} ${className}`}
          aria-label="Edit text"
          style={{ minWidth: '100px' }}
        />
      </motion.div>
    );
  }

  // Renderizar elemento según tipo (h1, p, etc.)
  const Element = as;
  return (
    <Element
      className={`cursor-pointer hover:opacity-80 group ${getBaseClasses()} ${className}`}
      onClick={handleDoubleClick}
      title="Click to edit"
    >
      <span className="relative">
        {text || placeholder}
        <span className="absolute -right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-70 transition-opacity">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </span>
      </span>
    </Element>
  );
}
