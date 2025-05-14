/**
 * Cliente base para comunicación con la API de Gemini
 * Este módulo contiene funciones básicas para interactuar con la API de Gemini,
 * incluyendo configuraciones comunes y manejo de errores.
 */

// La URL base para la API de Gemini
// Utilizando el modelo Gemini 2.0 Flash (versión más reciente a mayo 2024)
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Realiza una solicitud a la API de Gemini
 * 
 * @param apiKey La clave API para Gemini
 * @param requestBody El cuerpo de la solicitud según la documentación de Gemini
 * @returns Los datos de respuesta de la API
 */
// Definir tipo para el cuerpo de la solicitud a Gemini
type GeminiRequestBody = {
  contents: Array<{
    role?: string;
    parts: Array<{ text: string } | { [key: string]: unknown }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

// Definir tipo para la respuesta de Gemini
type GeminiResponseData = {
  candidates?: Array<{
    content: {
      parts: Array<{ text?: string; [key: string]: unknown }>;
      role?: string;
      [key: string]: unknown;
    };
    finishReason?: string;
    [key: string]: unknown;
  }>;
  promptFeedback?: {
    blockReason?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export async function callGeminiAPI(
  apiKey: string,
  requestBody: GeminiRequestBody
): Promise<GeminiResponseData> {
  if (!apiKey) {
    throw new Error('No se proporcionó una clave API para Gemini');
  }

  try {
    console.log('==================== ENVIANDO REQUEST A GEMINI API ====================');
    // No mostramos la API key por seguridad
    console.log(`URL: ${GEMINI_API_URL}?key=API_KEY_OCULTA`);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error al parsear respuesta de error' }));
      console.error('Error en solicitud a Gemini API:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Error en solicitud a Gemini API: ${response.status} ${response.statusText}`);
    }
    
    // Obtener la respuesta completa
    const responseData = await response.json();
    
    console.log('==================== RESPUESTA COMPLETA DE GEMINI API ====================');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('=========================================================================');
    
    return responseData;
  } catch (error) {
    console.error('Error al comunicarse con Gemini API:', error);
    throw error;
  }
}

/**
 * Extrae el texto del contenido de la respuesta de Gemini
 * 
 * @param responseData Los datos devueltos por la API de Gemini
 * @returns El texto extraído de la respuesta
 */
export function extractTextFromGeminiResponse(responseData: GeminiResponseData): string {
  if (responseData.candidates && responseData.candidates.length > 0) {
    const candidateContent = responseData.candidates[0].content;
    
    if (candidateContent && candidateContent.parts && candidateContent.parts.length > 0) {
      const textParts = candidateContent.parts
        .filter(part => part.text)
        .map(part => part.text);
      return textParts.join(' ');
    }
  }

  throw new Error('Formato de respuesta inesperado de Gemini API');
}

/**
 * Intenta extraer y parsear JSON de la respuesta de Gemini
 * 
 * @param responseData Los datos devueltos por la API de Gemini
 * @returns El objeto JSON parseado de la respuesta
 */
// Usamos Record<string, unknown> como tipo por defecto más seguro que 'any'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractJsonFromGeminiResponse<T = Record<string, unknown>>(responseData: GeminiResponseData): T {
  if (responseData.candidates && responseData.candidates.length > 0) {
    const candidateContent = responseData.candidates[0].content;
    
    if (candidateContent && candidateContent.parts && candidateContent.parts.length > 0) {
      const jsonText = candidateContent.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');
      
      // Log para mostrar la respuesta COMPLETA de Gemini
      console.log('==================== RESPUESTA COMPLETA DE GEMINI ====================');
      console.log(jsonText);
      console.log('==================================================================');
      
      // Procesar texto para extraer JSON
      let processedText = jsonText.trim();
      
      // 1. Eliminar markdown code blocks si existen
      processedText = processedText.replace(/```(?:json)?([\s\S]*?)```/g, '$1').trim();
      
      // 2. Buscar el primer '{' y el último '}' para extraer solo el JSON
      const firstBrace = processedText.indexOf('{');
      const lastBrace = processedText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        processedText = processedText.substring(firstBrace, lastBrace + 1);
      }
      
      // 3. Verificar si ahora el texto parece un JSON válido
      if (!processedText.startsWith('{') || !processedText.endsWith('}')) {
        console.error('La respuesta procesada no parece ser un JSON válido:', processedText.substring(0, 100) + '...');
        throw new Error('La respuesta de la API no tiene formato JSON');
      }
      
      // Log del texto procesado
      console.log('Texto procesado para JSON (primeros 100 caracteres):', processedText.substring(0, 100) + '...');
      
      try {
        // Intento de parsing estándar
        return JSON.parse(processedText) as T;
      } catch (initialError) {
        console.warn('Error en primer intento de parsing JSON, intentando reparación:', initialError);
        
        try {
          // Intento de reparación: escapar comillas dentro de valores de string
          // Esta expresión regular encuentra valores entre comillas con comillas sin escapar dentro
          const fixedText = processedText.replace(/"([^"\\]*?)":\s*"(.*?)([^\\])"([,}])/g, '"$1":"$2$3\\"$4');
          
          // Intento de sustitución de single quotes por double quotes (común en respuestas de LLMs)
          const alternativeText = processedText.replace(/'/g, '"');
          
          // Intentar todas las variantes de reparación
          try { return JSON.parse(fixedText) as T; } catch {}
          try { return JSON.parse(alternativeText) as T; } catch {}
          
          console.error('Todos los intentos de reparación de JSON fallaron');
          console.error('Texto recibido:', processedText.substring(0, 200));
          throw new Error('No se pudo parsear la respuesta como JSON válido después de intentos de reparación');
        } catch (repairError) {
          console.error('Error en intento de reparación de JSON:', repairError);
          throw new Error('Error en la conversión de la respuesta a formato JSON válido');
        }
      }
    }
  }

  throw new Error('Formato de respuesta inesperado de Gemini API');
}
