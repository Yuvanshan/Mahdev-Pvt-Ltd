/**
 * Image Compression & Optimization Utility
 * Automatically compresses images while maintaining visual quality
 */

import fs from 'fs';
import path from 'path';

// Check if sharp is available, if not provide fallback
let sharp: any;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('sharp not available - install with: npm install sharp');
  sharp = null;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  generateThumbnail?: boolean;
}

export interface OptimizedImage {
  original: Buffer;
  optimized: Buffer;
  thumbnail?: Buffer;
  metadata: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    format: string;
  };
}

/**
 * Compress and optimize a single image buffer
 */
export async function compressImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1440,
    quality = 80,
    format = 'jpeg',
    generateThumbnail = false
  } = options;

  if (!sharp) {
    console.warn('Sharp not available - returning original image');
    return {
      original: buffer,
      optimized: buffer,
      metadata: {
        originalSize: buffer.length,
        optimizedSize: buffer.length,
        compressionRatio: 1,
        format: 'unknown'
      }
    };
  }

  try {
    const originalSize = buffer.length;

    // Optimize main image
    let pipeline = sharp(buffer).resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
      position: 'center'
    });

    // Apply format-specific optimizations
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'png':
        pipeline = pipeline.png({ compressionLevel: 9 });
        break;
      case 'jpeg':
      default:
        pipeline = pipeline.jpeg({ quality, progressive: true });
    }

    const optimized = await pipeline.toBuffer();
    const optimizedSize = optimized.length;
    const compressionRatio = originalSize / optimizedSize;

    // Generate thumbnail if requested
    let thumbnail: Buffer | undefined;
    if (generateThumbnail) {
      thumbnail = await sharp(buffer)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toBuffer();
    }

    return {
      original: buffer,
      optimized,
      thumbnail,
      metadata: {
        originalSize,
        optimizedSize,
        compressionRatio,
        format
      }
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    return {
      original: buffer,
      optimized: buffer,
      metadata: {
        originalSize: buffer.length,
        optimizedSize: buffer.length,
        compressionRatio: 1,
        format: 'error'
      }
    };
  }
}

/**
 * Generate multiple optimized versions of an image
 */
export async function generateImageVariants(
  buffer: Buffer,
  basename: string
): Promise<Map<string, Buffer>> {
  if (!sharp) {
    return new Map([['original', buffer]]);
  }

  const variants = new Map<string, Buffer>();

  try {
    // Original (lightly optimized)
    const original = await compressImage(buffer, {
      maxWidth: 2400,
      maxHeight: 1800,
      quality: 85,
      format: 'jpeg'
    });
    variants.set('original', original.optimized);

    // Large (for desktop)
    const large = await compressImage(buffer, {
      maxWidth: 1920,
      maxHeight: 1440,
      quality: 80,
      format: 'jpeg'
    });
    variants.set('lg', large.optimized);

    // Medium (for tablets)
    const medium = await compressImage(buffer, {
      maxWidth: 1024,
      maxHeight: 768,
      quality: 78,
      format: 'jpeg'
    });
    variants.set('md', medium.optimized);

    // Small (for mobile)
    const small = await compressImage(buffer, {
      maxWidth: 640,
      maxHeight: 480,
      quality: 75,
      format: 'jpeg'
    });
    variants.set('sm', small.optimized);

    // WebP versions for modern browsers
    if (sharp) {
      const webpLarge = await sharp(buffer)
        .resize(1920, 1440, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toBuffer();
      variants.set('lg-webp', webpLarge);

      const webpSmall = await sharp(buffer)
        .resize(640, 480, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 75 })
        .toBuffer();
      variants.set('sm-webp', webpSmall);
    }

    return variants;
  } catch (error) {
    console.error('Error generating image variants:', error);
    variants.set('original', buffer);
    return variants;
  }
}

/**
 * Calculate compression savings
 */
export function calculateCompressionSavings(original: number, optimized: number): string {
  const saved = original - optimized;
  const percentage = ((saved / original) * 100).toFixed(1);
  const savedKB = (saved / 1024).toFixed(2);
  return `${percentage}% (${savedKB} KB saved)`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
