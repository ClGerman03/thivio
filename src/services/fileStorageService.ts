/**
 * File Storage Service for Thivio
 * Handles file storage operations with IndexedDB using localforage
 */

import localforage from 'localforage';

// Configure a dedicated instance for file storage
const fileStore = localforage.createInstance({
  name: 'thivio',
  storeName: 'files',
  description: 'Storage for learning content files'
});

/**
 * Stored file metadata and content
 */
export interface StoredFile {
  id: string;      // Unique identifier for the file
  name: string;    // Original filename
  type: string;    // MIME type
  size: number;    // File size in bytes
  content: string; // File content (text or base64)
  learningId: string; // Associated learning ID
  createdAt: string;  // Timestamp
}

/**
 * Store a file in IndexedDB
 * @param file The file to store
 * @param learningId The ID of the associated learning
 * @returns The stored file metadata (without content)
 */
export async function storeFile(file: File, learningId: string): Promise<Omit<StoredFile, 'content'>> {
  try {
    // Generate a unique file ID
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Read file content
    const content = await readFileContent(file);
    
    // Create stored file object
    const storedFile: StoredFile = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      content,
      learningId,
      createdAt: new Date().toISOString()
    };
    
    // Store the file
    await fileStore.setItem(fileId, storedFile);
    
    // Return metadata without content to avoid large objects in memory
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content: _, ...metadata } = storedFile;
    return metadata;
  } catch (error) {
    console.error('Error storing file:', error);
    throw new Error('Failed to store file');
  }
}

/**
 * Retrieve a file from IndexedDB by its ID
 * @param fileId The ID of the file to retrieve
 * @returns The stored file including content
 */
export async function getFile(fileId: string): Promise<StoredFile | null> {
  try {
    return await fileStore.getItem<StoredFile>(fileId);
  } catch (error) {
    console.error('Error retrieving file:', error);
    return null;
  }
}

/**
 * Get all files associated with a learning
 * @param learningId The ID of the learning
 * @returns Array of file metadata (without content) associated with the learning
 */
export async function getFilesForLearning(learningId: string): Promise<Array<Omit<StoredFile, 'content'>>> {
  try {
    const files: Array<Omit<StoredFile, 'content'>> = [];
    
    // Iterate through all files in the store
    await fileStore.iterate<StoredFile, void>((value) => {
      if (value.learningId === learningId) {
        // Add metadata without content
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { content: _, ...metadata } = value;
        files.push(metadata);
      }
    });
    
    return files;
  } catch (error) {
    console.error('Error retrieving files for learning:', error);
    return [];
  }
}

/**
 * Get file contents for multiple files
 * @param fileIds Array of file IDs to retrieve
 * @returns Array of files with content
 */
export async function getFilesWithContent(fileIds: string[]): Promise<StoredFile[]> {
  try {
    const filePromises = fileIds.map(id => getFile(id));
    const files = await Promise.all(filePromises);
    // Filter out null values (files that weren't found)
    return files.filter((file): file is StoredFile => file !== null);
  } catch (error) {
    console.error('Error retrieving multiple files:', error);
    return [];
  }
}

/**
 * Delete a file from storage
 * @param fileId The ID of the file to delete
 * @returns Boolean indicating success
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    await fileStore.removeItem(fileId);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Delete all files associated with a learning
 * @param learningId The ID of the learning
 * @returns Boolean indicating success
 */
export async function deleteFilesForLearning(learningId: string): Promise<boolean> {
  try {
    const files = await getFilesForLearning(learningId);
    
    // Delete each file
    const deletePromises = files.map(file => deleteFile(file.id));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error deleting files for learning:', error);
    return false;
  }
}

/**
 * Read file content as text or base64 depending on file type
 * @param file The file to read
 * @returns Promise that resolves to the file content as string
 */
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    // Determine how to read the file based on its type
    const isTextFile = 
      file.type.includes('text') || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.txt');
    
    if (isTextFile) {
      // Read as text for text files
      reader.readAsText(file);
    } else {
      // Read as data URL (base64) for binary files
      reader.readAsDataURL(file);
    }
    
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
