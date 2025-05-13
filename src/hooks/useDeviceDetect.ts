'use client';

import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Hook personalizado para detectar el tipo de dispositivo basado en el ancho de la ventana
 * y el agente de usuario.
 */
export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
    const checkDevice = () => {
      // Comprobar si estamos en un entorno de navegador
      if (typeof window === 'undefined') {
        return { isMobile: false, isTablet: false, isDesktop: true };
      }

      const width = window.innerWidth;
      
      // Detección basada en ancho de pantalla
      const isMobileByWidth = width < 768;
      const isTabletByWidth = width >= 768 && width < 1024;
      const isDesktopByWidth = width >= 1024;

      // Detección basada en agente de usuario para mejor precisión
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileByAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Combinamos ambas detecciones
      const isMobile = isMobileByWidth || (isMobileByAgent && !isTabletByWidth);
      const isTablet = isTabletByWidth || (isMobileByAgent && isTabletByWidth);
      const isDesktop = isDesktopByWidth && !isMobileByAgent;

      return { isMobile, isTablet, isDesktop };
    };

    // Configurar la detección inicial
    setDeviceInfo(checkDevice());

    // Configurar el evento de cambio de tamaño
    const handleResize = () => {
      setDeviceInfo(checkDevice());
    };

    window.addEventListener('resize', handleResize);
    
    // Limpiar el evento al desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceInfo;
}
