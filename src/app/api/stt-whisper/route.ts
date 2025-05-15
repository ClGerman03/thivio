import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import os from 'os';

// El modelo de Whisper en Replicate
const WHISPER_MODEL_VERSION = "openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e";

/**
 * API route para transcribir audio usando Whisper de OpenAI a través de Replicate
 */
export async function POST(request: NextRequest) {
  console.log('Recibida solicitud para transcribir audio con Whisper');
  
  try {
    // Verificar que la solicitud es multipart/form-data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    
    if (!audioFile) {
      console.error('No se proporcionó archivo de audio');
      return NextResponse.json(
        { error: 'No se proporcionó archivo de audio' },
        { status: 400 }
      );
    }
    
    console.log(`Archivo de audio recibido: ${audioFile.name}, tamaño: ${audioFile.size} bytes`);
    
    // Obtener opciones adicionales
    const language = formData.get('language') as string | null;
    const prompt = formData.get('prompt') as string | null;
    
    // Configurar Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN || '',
    });
    
    if (!process.env.REPLICATE_API_TOKEN) {
      console.warn('REPLICATE_API_TOKEN no está configurado');
      return NextResponse.json(
        { error: 'Servicio no configurado correctamente' },
        { status: 500 }
      );
    }
    
    // Guardar temporalmente el archivo para procesarlo
    const tempDir = os.tmpdir();
    const tempFilePath = join(tempDir, `whisper-${uuid()}.webm`);
    
    // Convertir el archivo a un Buffer y guardarlo
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(tempFilePath, audioBuffer);
    
    console.log(`Archivo guardado temporalmente en: ${tempFilePath}`);
    
    // Preparar input para Replicate
    const input: Record<string, string | boolean | number> = {
      audio: tempFilePath,
    };
    
    // Agregar opciones si están presentes
    if (language) {
      input.language = language;
    }
    
    if (prompt) {
      input.prompt = prompt;
    }
    
    console.log('Enviando a Replicate con input:', JSON.stringify(input));
    
    // Enviar a Replicate para transcripción
    const output = await replicate.run(WHISPER_MODEL_VERSION, { input });
    
    console.log('Respuesta recibida de Replicate:', JSON.stringify(output));
    
    // Comprobamos si la respuesta tiene el formato esperado
    if (!output || typeof output !== 'object') {
      throw new Error('Respuesta de Replicate inválida');
    }
    
    // Devolver la respuesta
    return NextResponse.json(output);
    
  } catch (error) {
    console.error('Error en la transcripción con Whisper:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
