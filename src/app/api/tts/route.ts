import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';

// Importamos los tipos necesarios
const { SsmlVoiceGender, AudioEncoding } = protos.google.cloud.texttospeech.v1;

interface TTSRequestBody {
  text: string;
  languageCode?: string;
  voiceName?: string;
  ssmlGender?: 'NEUTRAL' | 'MALE' | 'FEMALE';
  speakingRate?: number;
  pitch?: number;
}

// Manejador para solicitudes POST a /api/tts
// Función auxiliar para convertir string a enum SsmlVoiceGender
function getSsmlVoiceGender(gender?: string): protos.google.cloud.texttospeech.v1.SsmlVoiceGender {
  if (gender === 'MALE') return SsmlVoiceGender.MALE;
  if (gender === 'FEMALE') return SsmlVoiceGender.FEMALE;
  return SsmlVoiceGender.NEUTRAL;
}

export async function POST(request: NextRequest) {
  try {
    // Validar que tenemos todas las variables de entorno necesarias
    if (
      !process.env.GOOGLE_CLOUD_PROJECT_ID ||
      !process.env.GOOGLE_CLOUD_CLIENT_EMAIL ||
      !process.env.GOOGLE_CLOUD_PRIVATE_KEY
    ) {
      console.error('Faltan variables de entorno:', {
        hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
        hasClientEmail: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY
      });
      return NextResponse.json(
        { error: 'Faltan credenciales para Google Cloud TTS' },
        { status: 500 }
      );
    }
    
    // Verificamos el formato de la clave privada
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
      console.error('Formato de clave privada incorrecto');
      return NextResponse.json(
        { error: 'Formato de clave privada incorrecto' },
        { status: 500 }
      );
    }

    // Obtener el cuerpo de la solicitud
    const requestData: TTSRequestBody = await request.json();
    
    // Validar la solicitud
    if (!requestData.text) {
      return NextResponse.json(
        { error: 'Se requiere el texto para la síntesis de voz' },
        { status: 400 }
      );
    }

    // Log para depuración
    console.log('Credenciales de Google Cloud:', {
      project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      private_key_length: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.length || 0,
      private_key_start: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.substring(0, 20) || '',
    });
    
    // Crear el cliente de Text-to-Speech con credenciales de variables de entorno
    const client = new TextToSpeechClient({
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID
      }
    });

    // Preparar la solicitud para Google Cloud TTS
    // Usamos una voz estándar y eficiente (menos costosa)
    const ttsRequest = {
      input: { text: requestData.text },
      voice: {
        languageCode: requestData.languageCode || 'es-ES',
        // Mapear el string a enum
        ssmlGender: getSsmlVoiceGender(requestData.ssmlGender),
        // Usar una voz estándar en español (es-ES) - más económica
        name: requestData.voiceName || 'es-ES-Standard-A',
      },
      audioConfig: {
        // MP3 es 2 en el enum AudioEncoding
        audioEncoding: AudioEncoding.MP3,
        speakingRate: requestData.speakingRate || 1.0,
        pitch: requestData.pitch || 0,
      },
    };
    
    console.log('Solicitud TTS:', JSON.stringify(ttsRequest, null, 2));

    // Realizar la solicitud a Google Cloud TTS
    console.log('Enviando solicitud a Google Cloud TTS...');
    const [response] = await client.synthesizeSpeech(ttsRequest);
    
    // Verificar que tenemos contenido de audio
    if (!response.audioContent) {
      throw new Error('No se recibió contenido de audio de Google Cloud TTS');
    }

    // Crear respuesta con el audio
    return new NextResponse(Buffer.from(response.audioContent as Uint8Array), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mp3',
      },
    });
  } catch (error) {
    console.error('Error en API de TTS:', error);
    
    // Log detallado del error
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    // Devolver un error apropiado
    return NextResponse.json(
      { 
        error: 'Error al generar audio con TTS', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
