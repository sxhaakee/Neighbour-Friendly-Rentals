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
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeMB = 0.5, // 500KB - more reasonable for large images
  } = options;

  try {
    const fileSizeMB = file.size / 1024 / 1024;
    console.log(`Starting compression for ${file.name}: ${fileSizeMB.toFixed(2)}MB`);
    
    // For very large files (>3MB), use more aggressive initial settings
    const isVeryLarge = fileSizeMB > 3;
    const initialQuality = isVeryLarge ? 0.6 : quality;
    const initialMaxSize = isVeryLarge ? 0.3 : maxSizeMB;
    
    // First pass compression with adaptive settings
    const compressionOptions = {
      maxSizeMB: initialMaxSize,
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
      initialQuality,
      fileType: 'image/jpeg' as const, // Always convert to JPEG for better compression
      alwaysKeepResolution: false, // Allow resolution reduction for better compression
    };

    let compressedFile = await imageCompression(file, compressionOptions);
    
    // Aggressive compression loop - ensure we meet the size target
    let attempts = 0;
    let currentQuality = initialQuality;
    let currentMaxWidth = Math.max(maxWidth, maxHeight);
    
    while (compressedFile.size > maxSizeMB * 1024 * 1024 && attempts < 6) {
      currentQuality = Math.max(0.3, currentQuality - 0.1); // Reduce quality
      currentMaxWidth = Math.floor(currentMaxWidth * 0.85); // Reduce dimensions more
      const newMaxSize = Math.max(0.1, maxSizeMB * 0.8); // Target smaller
      
      console.log(`Attempt ${attempts + 1}: quality=${currentQuality.toFixed(2)}, maxWidth=${currentMaxWidth}, targetSize=${newMaxSize}MB`);
      
      compressedFile = await imageCompression(file, {
        maxSizeMB: newMaxSize,
        maxWidthOrHeight: currentMaxWidth,
        useWebWorker: true,
        initialQuality: currentQuality,
        fileType: 'image/jpeg' as const,
        alwaysKeepResolution: false,
      });
      
      attempts++;
    }
    
    const finalSizeKB = compressedFile.size / 1024;
    const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    console.log(`✅ Compressed ${file.name}: ${fileSizeMB.toFixed(2)}MB → ${finalSizeKB.toFixed(2)}KB (${compressionRatio}% reduction)`);
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error(`Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

/**
 * Generate a quick preview/thumbnail for immediate display
 * This allows showing the image while compression happens in background
 * @param file - Image file
 * @returns Data URL for preview
 */
export const generatePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for thumbnail
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Calculate thumbnail size (max 400px)
        const maxSize = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Return as data URL with lower quality for quick preview
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
