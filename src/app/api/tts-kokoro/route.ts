import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

interface KokoroTTSRequestBody {
  text: string;
  speed?: number; // 0.5 = half speed, 2.0 = double speed
  voice?: string; // ID de la voz a usar
}

// Manejador para solicitudes POST a /api/tts-kokoro
export async function POST(request: NextRequest) {
  try {
    // Validar que tenemos la variable de entorno para Replicate API
    const replicateApiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!replicateApiToken) {
      console.error('Falta la variable de entorno REPLICATE_API_TOKEN');
      return NextResponse.json(
        { error: 'Falta la configuración para Replicate API' },
        { status: 500 }
      );
    }

    // Obtener el cuerpo de la solicitud
    const requestData: KokoroTTSRequestBody = await request.json();
    
    // Validar la solicitud
    if (!requestData.text) {
      return NextResponse.json(
        { error: 'Se requiere el texto para la síntesis de voz' },
        { status: 400 }
      );
    }

    // Log para depuración (sin mostrar el token)
    console.log('Solicitud Kokoro TTS:', {
      text: requestData.text.substring(0, 50) + (requestData.text.length > 50 ? '...' : ''),
      speed: requestData.speed || 1.0,
      voice: requestData.voice || 'af_bella'
    });

    // Inicializar el cliente de Replicate con la API key
    const replicate = new Replicate({
      auth: replicateApiToken,
    });
    
    // Log seguro del token (solo los primeros caracteres)
    console.log('Cliente de Replicate inicializado con token (primeros 5 caracteres):', 
      replicateApiToken.substring(0, 5) + '...');

    // No es necesario formatear el texto para Kokoro, lo procesa directamente
    // Configurar los parámetros de la solicitud para Kokoro según su esquema
    const kokoroInput = {
      text: requestData.text,
      speed: requestData.speed || 1.0, // Velocidad de habla (1.0 es normal)
      voice: requestData.voice || 'af_bella' // Voz por defecto
    };

    console.log('Enviando solicitud a Replicate Kokoro:', JSON.stringify(kokoroInput, null, 2));

    console.log('Creando predicción en Replicate...');

    // En lugar de usar run(), usaremos createPrediction() y getPrediction() para manejar el proceso async
    const prediction = await replicate.predictions.create({
      version: "f559560eb822dc509045f3921a1921234918b91739db4bf3daab2169b71c7a13",
      input: kokoroInput,
      webhook: "", // No necesitamos webhook para esta implementación
      webhook_events_filter: [] // Sin filtros de eventos
    });

    console.log('Predicción creada con ID:', prediction.id);
    console.log('Estado inicial:', prediction.status);

    // Esperar a que se complete la predicción
    let completedPrediction = prediction;
    while (completedPrediction.status !== "succeeded" && completedPrediction.status !== "failed") {
      console.log(`Verificando estado: ${completedPrediction.status}...`);
      
      // Esperar 1 segundo entre comprobaciones
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Obtener estado actualizado
      completedPrediction = await replicate.predictions.get(prediction.id);
    }

    console.log('Predicción completada con estado:', completedPrediction.status);
    
    // Verificar si la predicción tuvo éxito
    if (completedPrediction.status !== "succeeded") {
      throw new Error(`La predicción falló con estado: ${completedPrediction.status}, error: ${completedPrediction.error}`);
    }

    // Extraer la URL del audio de la respuesta
    const output = completedPrediction.output;
    console.log('Respuesta recibida de Replicate:', typeof output, Array.isArray(output) ? 'array' : '');

    let audioUrl;
    // La salida puede ser un string (URL) directamente o estar en alguna estructura
    if (typeof output === 'string') {
      audioUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      audioUrl = output[0];
    } else if (output && typeof output === 'object') {
      // Intentar encontrar una propiedad que pueda contener la URL
      const possibleUrlKeys = ['url', 'audio', 'output', 'file'];
      for (const key of possibleUrlKeys) {
        if (key in output && typeof output[key] === 'string') {
          audioUrl = output[key];
          break;
        }
      }
    }

    // Verificar que tenemos una URL válida
    if (!audioUrl || typeof audioUrl !== 'string') {
      throw new Error('No se pudo extraer una URL de audio válida de la respuesta');
    }
    
    if (!audioUrl) {
      throw new Error('No se recibió audio de Replicate');
    }

    // Descargar el audio desde la URL proporcionada por Replicate
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Error al descargar audio: ${audioResponse.status} ${audioResponse.statusText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    // Devolver el audio como respuesta
    return new NextResponse(Buffer.from(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav', // Kokoro por defecto devuelve audio en formato WAV
      },
    });
  } catch (error) {
    console.error('Error en API de Kokoro TTS:', error);
    
    // Log detallado del error
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    // Devolver un error apropiado
    return NextResponse.json(
      { 
        error: 'Error al generar audio con Kokoro TTS', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
