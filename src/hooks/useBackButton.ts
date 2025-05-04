import { useEffect, useRef } from 'react';

/**
 * Hook para controlar el comportamiento del botón "Volver" nativo en dispositivos móviles.
 * En lugar de navegar hacia atrás, ejecuta la función onBack proporcionada.
 * 
 * @param isActive - Determina si el hook está activo
 * @param onBack - Función a ejecutar cuando se presiona el botón "Volver"
 */
export function useBackButton(isActive: boolean, onBack: () => void) {
  // Usar un ref para evitar recrear el listener en cada render
  const stateIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Creamos un ID único solo cuando se activa el hook
    if (!stateIdRef.current) {
      stateIdRef.current = Date.now().toString();
    }

    // Limitamos la cantidad de estados que añadimos al historial
    // Solo añadimos un nuevo estado si no hay uno previo con nuestro ID
    if (!window.history.state || window.history.state.id !== stateIdRef.current) {
      window.history.pushState({ id: stateIdRef.current }, '', window.location.href);
    }

    // Manejador para el evento popstate (botón "Volver")
    const handlePopState = (event: PopStateEvent) => {
      // Prevenimos la navegación hacia atrás añadiendo otro estado al historial
      // pero solo si estamos activos
      if (isActive) {
        window.history.pushState({ id: stateIdRef.current }, '', window.location.href);
        // Ejecutamos la función proporcionada
        onBack();
      }
    };

    // Añadimos el event listener
    window.addEventListener('popstate', handlePopState);

    // Limpieza al desmontar el componente o cuando isActive cambia a false
    return () => {
      window.removeEventListener('popstate', handlePopState);
      
      // Si hay un estado en el historial con nuestro ID y ya no estamos activos,
      // lo eliminamos para evitar múltiples entradas duplicadas
      if (!isActive && stateIdRef.current) {
        const state = window.history.state;
        if (state && state.id === stateIdRef.current) {
          window.history.back();
          // Reiniciamos el ID para que se genere uno nuevo en la próxima activación
          stateIdRef.current = null;
        }
      }
    };
  }, [isActive, onBack]);
}
