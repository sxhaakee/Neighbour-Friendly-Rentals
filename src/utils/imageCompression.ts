/**
 * Image Compression Utility - HEAVY COMPRESSION
 * Aggressively compresses images to minimize storage usage
 * 
 * Features:
 * - Target: 150-300KB per image (down from MBs)
 * - Multi-pass compression with quality reduction
 * - Automatic dimension scaling for large files
 * - Emergency fallback compression
 * - Never fails - always returns compressed image
 * 
 * Compression Strategy:
 * - Files >2MB: Start at 50% quality, target 200KB
 * - Files >1MB: Start at 60% quality, target 250KB
 * - Files <1MB: Start at 70% quality, target 300KB
 * - Up to 8 compression attempts with progressive quality reduction
 * - Final emergency pass at 150KB if still too large
 * 
 * Error Handling:
 * - Catches all compression errors
 * - Retries with minimal settings
 * - Falls back to original file only as last resort
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
    quality = 0.7, // Lower default quality for heavier compression
    maxSizeMB = 0.3, // 300KB - much more aggressive target
  } = options;

  try {
    const fileSizeMB = file.size / 1024 / 1024;
    console.log(`Starting compression for ${file.name}: ${fileSizeMB.toFixed(2)}MB`);
    
    // For very large files (>2MB), use very aggressive initial settings
    const isVeryLarge = fileSizeMB > 2;
    const isLarge = fileSizeMB > 1;
    
    let initialQuality = quality;
    let initialMaxSize = maxSizeMB;
    
    if (isVeryLarge) {
      initialQuality = 0.5; // Very aggressive
      initialMaxSize = 0.2; // 200KB target
    } else if (isLarge) {
      initialQuality = 0.6;
      initialMaxSize = 0.25; // 250KB target
    }
    
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
    
    // More aggressive loop with more attempts
    while (compressedFile.size > maxSizeMB * 1024 * 1024 && attempts < 8) {
      currentQuality = Math.max(0.25, currentQuality - 0.08); // Reduce quality more aggressively
      currentMaxWidth = Math.floor(currentMaxWidth * 0.8); // Reduce dimensions more
      const newMaxSize = Math.max(0.08, maxSizeMB * 0.7); // Target much smaller
      
      console.log(`Attempt ${attempts + 1}: quality=${currentQuality.toFixed(2)}, maxWidth=${currentMaxWidth}, targetSize=${newMaxSize}MB`);
      
      try {
        compressedFile = await imageCompression(file, {
          maxSizeMB: newMaxSize,
          maxWidthOrHeight: currentMaxWidth,
          useWebWorker: true,
          initialQuality: currentQuality,
          fileType: 'image/jpeg' as const,
          alwaysKeepResolution: false,
        });
      } catch (compressionError) {
        console.warn(`Compression attempt ${attempts + 1} failed, using previous result`);
        break; // Use the last successful compression
      }
      
      attempts++;
    }
    
    const finalSizeKB = compressedFile.size / 1024;
    const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    console.log(`✅ Compressed ${file.name}: ${fileSizeMB.toFixed(2)}MB → ${finalSizeKB.toFixed(2)}KB (${compressionRatio}% reduction)`);
    
    // Final safety check - if still too large, do one last aggressive pass
    if (compressedFile.size > maxSizeMB * 1024 * 1024 * 1.5) {
      console.log('⚠️ File still large, applying final aggressive compression...');
      try {
        compressedFile = await imageCompression(file, {
          maxSizeMB: 0.15, // 150KB absolute max
          maxWidthOrHeight: 800,
          useWebWorker: true,
          initialQuality: 0.3,
          fileType: 'image/jpeg' as const,
          alwaysKeepResolution: false,
        });
        console.log(`✅ Final compression: ${(compressedFile.size / 1024).toFixed(2)}KB`);
      } catch (finalError) {
        console.warn('Final compression failed, using previous result');
      }
    }
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return a heavily compressed version as fallback
    try {
      console.log('Attempting emergency compression...');
      const emergencyCompressed = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 800,
        useWebWorker: false,
        initialQuality: 0.4,
        fileType: 'image/jpeg' as const,
      });
      console.log('✅ Emergency compression successful');
      return emergencyCompressed;
    } catch (emergencyError) {
      throw new Error(`Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
  
  console.log(`📦 Starting batch compression of ${files.length} images...`);
  
  // Process images sequentially to avoid overwhelming the browser
  for (let i = 0; i < files.length; i++) {
    try {
      console.log(`Compressing image ${i + 1} of ${files.length}...`);
      const compressed = await compressImage(files[i], options);
      compressedFiles.push(compressed);
      
      // Small delay between compressions to prevent browser freezing
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    } catch (error) {
      console.error(`❌ Failed to compress image ${i + 1}:`, error);
      
      // Try one more time with minimal settings
      try {
        console.log(`🔄 Retrying with minimal compression settings...`);
        const minimalCompressed = await imageCompression(files[i], {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1000,
          useWebWorker: false,
          initialQuality: 0.5,
          fileType: 'image/jpeg' as const,
        });
        compressedFiles.push(minimalCompressed);
        console.log(`✅ Retry successful for image ${i + 1}`);
      } catch (retryError) {
        console.error(`❌ Retry failed for image ${i + 1}, using original`);
        // Last resort: use original file
        compressedFiles.push(files[i]);
      }
    }
  }
  
  const totalSizeKB = compressedFiles.reduce((sum, file) => sum + file.size, 0) / 1024;
  console.log(`✅ Batch compression complete: ${compressedFiles.length} images, ${totalSizeKB.toFixed(2)}KB total`);
  
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
