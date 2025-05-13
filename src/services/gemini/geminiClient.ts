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

  // Construir la URL con la clave API
  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  // Realizar la solicitud a la API de Gemini
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en la API de Gemini: ${response.status} ${errorText}`);
  }

  return await response.json();
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
export function extractJsonFromGeminiResponse<T>(responseData: GeminiResponseData): T {
  if (responseData.candidates && responseData.candidates.length > 0) {
    const candidateContent = responseData.candidates[0].content;
    
    if (candidateContent && candidateContent.parts && candidateContent.parts.length > 0) {
      const jsonText = candidateContent.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');
      
      try {
        return JSON.parse(jsonText) as T;
      } catch (parseError) {
        console.error('Error al parsear la respuesta JSON:', parseError);
        throw new Error('No se pudo parsear la respuesta como JSON válido');
      }
    }
  }

  throw new Error('Formato de respuesta inesperado de Gemini API');
}
