/**
 * Utility functions for detecting and parsing media URLs (YouTube, Images, Videos).
 */

export type MediaType = 'youtube' | 'image' | 'video';

/**
 * Extracts the 11-character YouTube video ID from various YouTube URL formats.
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Detects the media type of a URL string.
 */
export function getMediaType(url: string): MediaType {
  if (!url) return 'video';

  // 1. YouTube check
  if (getYouTubeId(url) !== null) {
    return 'youtube';
  }

  // 2. Image check (check extension or Base64 image formats)
  const imgExtensions = /\.(jpeg|jpg|gif|png|webp|svg|bmp|ico)$/i;
  if (imgExtensions.test(url) || url.startsWith('data:image/') || url.includes('firebasestorage.googleapis.com/v0/b/for-her-33ea9.appspot.com/o/gallery') || url.includes('/images/')) {
    // Note: Some firebase storage tokens or local paths might not end with extensions but are images.
    // If it contains gallery or testimonials folder path, let's treat it as image unless verified otherwise.
    if (url.includes('posters') || url.includes('testimonials') || url.includes('gallery') || url.includes('divisions')) {
      return 'image';
    }
    return 'image';
  }

  // Fallback to video
  return 'video';
}
