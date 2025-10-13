/**
 * Image Compression Utility
 * Compresses images to reduce storage usage on Supabase free tier
 * Target: Keep images under 100KB each for optimal storage (supports 1000+ items)
 */

import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Compress an image file to reduce size using browser-image-compression
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image as File
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.7,
    maxSizeMB = 0.1, // 100KB for better storage optimization
  } = options;

  try {
    // First pass compression
    const compressionOptions = {
      maxSizeMB,
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
      initialQuality: quality,
      fileType: 'image/jpeg' as const, // Always convert to JPEG for better compression
    };

    let compressedFile = await imageCompression(file, compressionOptions);
    
    // Aggressive compression loop - ensure we meet the size target
    let attempts = 0;
    let currentQuality = quality;
    
    while (compressedFile.size > maxSizeMB * 1024 * 1024 && attempts < 5) {
      currentQuality = Math.max(0.3, currentQuality - 0.15); // Reduce quality more aggressively
      const newMaxSize = maxSizeMB * 0.7; // Target even smaller
      
      compressedFile = await imageCompression(file, {
        maxSizeMB: newMaxSize,
        maxWidthOrHeight: Math.max(maxWidth, maxHeight) * 0.9, // Also reduce dimensions
        useWebWorker: true,
        initialQuality: currentQuality,
        fileType: 'image/jpeg' as const,
      });
      
      attempts++;
    }
    
    console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Compress multiple images sequentially to avoid memory issues
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed images as Files
 */
export const compressImages = async (
  files: File[],
  options?: CompressionOptions
): Promise<File[]> => {
  const compressedFiles: File[] = [];
  
  // Process images sequentially to avoid overwhelming the browser
  for (let i = 0; i < files.length; i++) {
    try {
      console.log(`Compressing image ${i + 1} of ${files.length}...`);
      const compressed = await compressImage(files[i], options);
      compressedFiles.push(compressed);
      
      // Small delay between compressions to prevent browser freezing
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Failed to compress image ${i + 1}:`, error);
      // Use original file if compression fails
      compressedFiles.push(files[i]);
    }
  }
  
  return compressedFiles;
};

/**
 * Get estimated storage size for images
 * @param files - Array of files
 * @returns Total size in MB
 */
export const getEstimatedSize = (files: (File | Blob)[]): number => {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  return totalBytes / 1024 / 1024;
};

/**
 * Convert Blob to File
 * @param blob - Blob to convert
 * @param fileName - Name for the file
 * @returns File object
 */
export const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};
