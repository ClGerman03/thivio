import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import os from 'os';
import fs from 'fs/promises';

// El modelo de Whisper en Replicate (versión actualizada)
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
    
    // Validar que tenemos la variable de entorno para Replicate API
    const replicateApiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!replicateApiToken) {
      console.error('Falta la variable de entorno REPLICATE_API_TOKEN');
      return NextResponse.json(
        { error: 'Servicio no configurado correctamente' },
        { status: 500 }
      );
    }
    
    // Configurar Replicate con logging seguro
    const replicate = new Replicate({
      auth: replicateApiToken,
    });
    
    // Log seguro del token (solo los primeros caracteres)
    console.log('Cliente de Replicate inicializado con token (primeros 5 caracteres):', 
      replicateApiToken.substring(0, 5) + '...');
    
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
    
    // Usar el sistema de predicciones de Replicate en lugar del método run()
    console.log('Creando predicción en Replicate...');
    
    try {
      // Crear la predicción usando el sistema más robusto
      const prediction = await replicate.predictions.create({
        version: WHISPER_MODEL_VERSION,
        input: input,
        webhook: "", // No necesitamos webhook
        webhook_events_filter: [] // Sin filtros de eventos
      });
      
      console.log('Predicción creada con ID:', prediction.id);
      console.log('Estado inicial:', prediction.status);
      
      // Esperar a que se complete la predicción con polling
      let completedPrediction = prediction;
      let attempts = 0;
      const maxAttempts = 30; // Máximo 30 segundos de espera
      
      while (
        completedPrediction.status !== "succeeded" && 
        completedPrediction.status !== "failed" &&
        attempts < maxAttempts
      ) {
        console.log(`Verificando estado: ${completedPrediction.status}... (intento ${attempts + 1}/${maxAttempts})`);
        
        // Esperar 1 segundo entre comprobaciones
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Obtener estado actualizado
        completedPrediction = await replicate.predictions.get(prediction.id);
        attempts++;
      }
      
      console.log('Predicción completada con estado:', completedPrediction.status);
      
      // Comprobar si se ha superado el tiempo de espera
      if (attempts >= maxAttempts && completedPrediction.status !== "succeeded") {
        throw new Error(`Tiempo de espera superado para la transcripción después de ${maxAttempts} segundos`);
      }
      
      // Verificar si la predicción tuvo éxito
      if (completedPrediction.status !== "succeeded") {
        throw new Error(`La predicción falló con estado: ${completedPrediction.status}, error: ${completedPrediction.error}`);
      }
      
      // Extraer la respuesta
      const output = completedPrediction.output;
      console.log('Respuesta recibida de Replicate:', JSON.stringify(output));
      
      // Eliminar el archivo temporal después de usarlo
      try {
        await fs.unlink(tempFilePath);
        console.log(`Archivo temporal eliminado: ${tempFilePath}`);
      } catch (cleanupError) {
        console.warn(`No se pudo eliminar el archivo temporal (${tempFilePath}):`, cleanupError);
      }
      
      // Devolver la respuesta
      return NextResponse.json(output);
    } catch (replicateError) {
      console.error('Error en la transcripción con Replicate:', replicateError);
      throw replicateError; // Re-lanzar para manejo centralizado de errores
    }
    
  } catch (error) {
    console.error('Error en la transcripción con Whisper:', error);
    
    // Log detallado del error
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    // Devolver un error más informativo
    return NextResponse.json(
      { 
        error: 'Error al procesar la transcripción con Whisper', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
