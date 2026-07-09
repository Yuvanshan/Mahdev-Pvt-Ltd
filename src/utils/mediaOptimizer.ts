/**
 * Client-Side Browser Image Compression, WebP Conversion and Thumbnail Generator
 * This optimizes images directly in the browser before they are uploaded over the network,
 * saving bandwidth, ensuring global compatibility, and removing native backend dependencies.
 */

interface CompressionResult {
  optimizedFile: File;
  optimizedDataUrl: string;
  width: number;
  height: number;
  thumbnailFile?: File;
  thumbnailDataUrl?: string;
}

/**
 * Optimizes an image: Compresses, resizes, converts to WebP and generates a WebP thumbnail.
 */
export async function optimizeImageBeforeUpload(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    thumbnailSize?: number;
    thumbnailQuality?: number;
  } = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.82,
    thumbnailSize = 250,
    thumbnailQuality = 0.70,
  } = options;

  // If not an image, return early (for PDFs, docs, etc.)
  if (!file.type.startsWith("image/")) {
    throw new Error("File is not an image");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // 1. Calculate main image dimensions preserving aspect ratio
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = width / height;
            if (width > height) {
              width = maxWidth;
              height = Math.round(maxWidth / ratio);
            } else {
              height = maxHeight;
              width = Math.round(maxHeight * ratio);
            }
          }

          // Create canvas for optimized image
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Could not get canvas 2D context");
          }

          // Draw and compress main image (EXIF metadata is stripped automatically here)
          ctx.drawImage(img, 0, 0, width, height);
          
          // Generate high quality WebP
          const outputType = "image/webp";
          const mainDataUrl = canvas.toDataURL(outputType, quality);

          // Convert main dataUrl to File
          const mainBlob = dataURLToBlob(mainDataUrl);
          const optimizedFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const optimizedFile = new File([mainBlob], optimizedFileName, {
            type: outputType,
            lastModified: Date.now(),
          });

          // 2. Generate thumbnail proportionally
          let thumbWidth = img.width;
          let thumbHeight = img.height;
          const thumbRatio = thumbWidth / thumbHeight;
          if (thumbWidth > thumbnailSize || thumbHeight > thumbnailSize) {
            if (thumbWidth > thumbHeight) {
              thumbWidth = thumbnailSize;
              thumbHeight = Math.round(thumbnailSize / thumbRatio);
            } else {
              thumbHeight = thumbnailSize;
              thumbWidth = Math.round(thumbnailSize * thumbRatio);
            }
          }

          const thumbCanvas = document.createElement("canvas");
          thumbCanvas.width = thumbWidth;
          thumbCanvas.height = thumbHeight;
          const thumbCtx = thumbCanvas.getContext("2d");
          if (thumbCtx) {
            thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
            const thumbDataUrl = thumbCanvas.toDataURL("image/webp", thumbnailQuality);
            const thumbBlob = dataURLToBlob(thumbDataUrl);
            const thumbnailFile = new File([thumbBlob], `thumb_${optimizedFileName}`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve({
              optimizedFile,
              optimizedDataUrl: mainDataUrl,
              width,
              height,
              thumbnailFile,
              thumbnailDataUrl: thumbDataUrl,
            });
          } else {
            resolve({
              optimizedFile,
              optimizedDataUrl: mainDataUrl,
              width,
              height,
            });
          }
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to convert dataURL to standard Blob
 */
function dataURLToBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/webp";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
