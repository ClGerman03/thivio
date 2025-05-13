'use client';

import { useState, useEffect, ReactNode, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';

type CarouselProps<T> = {
  items: T[];
  selectedItem: T;
  onSelectItem: (item: T) => void;
  getItemId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  className?: string;
};

export default function Carousel<T>({
  items,
  selectedItem,
  onSelectItem,
  getItemId,
  renderItem,
  className = '',
}: CarouselProps<T>) {
  // Detección de dispositivo
  const { isMobile } = useDeviceDetect();
  
  // Estado para el índice actual en el carrusel
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Referencias para el deslizamiento táctil
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Actualizar el índice cuando cambia el item seleccionado
  useEffect(() => {
    const newIndex = items.findIndex(item => getItemId(item) === getItemId(selectedItem));
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
    }
  }, [selectedItem, items, getItemId]);
  
  // Funciones para navegación del carrusel
  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % items.length;
    onSelectItem(items[nextIndex]);
  };
  
  const goToPrevious = () => {
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    onSelectItem(items[prevIndex]);
  };
  
  // Manejo de deslizamiento táctil
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // Umbral para considerar un deslizamiento válido
    
    if (info.offset.x > threshold) {
      goToPrevious();
    } else if (info.offset.x < -threshold) {
      goToNext();
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={`carousel-item-${getItemId(selectedItem)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
          drag={isMobile ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
        >
          {/* Contenedor del carrusel */}
          <div className="flex flex-col items-center">
            {/* Item renderizado */}
            {renderItem(selectedItem)}

            {/* Indicadores de posición */}
            <div className="flex justify-center space-x-1 mt-2 mb-2">
              {items.map((item, index) => (
                <button
                  key={`indicator-${getItemId(item)}`}
                  className={`h-1.5 rounded-full transition-all ${index === currentIndex 
                    ? 'w-3 bg-gray-400 dark:bg-gray-500' 
                    : 'w-1.5 bg-gray-200 dark:bg-gray-700'}`}
                  onClick={() => onSelectItem(items[index])}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Espacio para el carrusel */}

      {/* Botones de navegación modernos pero minimalistas */}
      <div className="flex justify-between absolute top-[90px] left-0 right-0 px-2 md:px-4">
        <button 
          onClick={goToPrevious}
          className="w-7 h-7 flex items-center justify-center text-xs bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm"
          aria-label="Previous item"
        >
          <span className="transform -translate-x-px">◄</span>
        </button>
        
        <button 
          onClick={goToNext}
          className="w-7 h-7 flex items-center justify-center text-xs bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm"
          aria-label="Next item"
        >
          <span className="transform translate-x-px">►</span>
        </button>
      </div>
    </div>
  );
}
