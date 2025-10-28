export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export interface VideoMetadata {
  duration: number
  width: number
  height: number
  fps: number
  bitrate: number
  codec: string
  hasAudio: boolean
  audioCodec?: string
  audioChannels?: number
  audioSampleRate?: number
}

/**
 * Validate video file extension and basic properties
 */
export function validateVideoFile(file: File): FileValidationResult {
  const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v']
  const maxSize = 500 * 1024 * 1024 // 500MB limit for MVP
  
  // Check file extension
  const extension = getFileExtension(file.name)
  if (!allowedExtensions.includes(extension.toLowerCase())) {
    return {
      isValid: false,
      error: `Unsupported file format. Supported formats: ${allowedExtensions.join(', ')}`
    }
  }
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`
    }
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty'
    }
  }
  
  return { isValid: true }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : ''
}

/**
 * Get filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format duration in seconds to HH:MM:SS format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

/**
 * Format resolution string
 */
export function formatResolution(width: number, height: number): string {
  return `${width}x${height}`
}

/**
 * Format bitrate in human readable format
 */
export function formatBitrate(bitrate: number): string {
  if (bitrate === 0) return 'Unknown'
  
  const kbps = Math.round(bitrate / 1000)
  if (kbps < 1000) {
    return `${kbps} kbps`
  } else {
    return `${(kbps / 1000).toFixed(1)} Mbps`
  }
}

/**
 * Generate thumbnail filename
 */
export function getThumbnailPath(videoPath: string): string {
  const path = require('path')
  const dir = path.dirname(videoPath)
  const name = path.basename(videoPath, path.extname(videoPath))
  
  return path.join(dir, `${name}_thumb.jpg`)
}

/**
 * Check if file path is valid
 */
export function isValidFilePath(filePath: string): boolean {
  try {
    const path = require('path')
    path.resolve(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Get relative path from absolute path
 */
export function getRelativePath(absolutePath: string, basePath: string): string {
  const path = require('path')
  return path.relative(basePath, absolutePath)
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 255) // Limit length
}
