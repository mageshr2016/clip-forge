import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'
import { join } from 'path'
import { app } from 'electron'

// Extract the actual path from ffprobe-static (it exports an object with path property)
const ffprobePath = ffprobeStatic.path

// Debug what we're getting from the static packages
console.log('ffmpegPath:', ffmpegPath, 'Type:', typeof ffmpegPath)
console.log('ffprobePath:', ffprobePath, 'Type:', typeof ffprobePath)

// Set FFmpeg and FFprobe paths
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

export interface ExportOptions {
  inputPath: string
  outputPath: string
  startTime?: number // in seconds
  duration?: number // in seconds
  quality?: 'low' | 'medium' | 'high'
}

export interface ExportProgress {
  percent: number
  time: number
  speed: string
}

/**
 * Export video with specified options
 */
export async function exportVideo(
  options: ExportOptions,
  onProgress?: (progress: ExportProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      inputPath,
      outputPath,
      startTime = 0,
      duration,
      quality = 'high'
    } = options

    // Quality settings
    const qualitySettings = {
      low: { crf: 28, preset: 'fast' },
      medium: { crf: 23, preset: 'medium' },
      high: { crf: 18, preset: 'slow' }
    }

    const settings = qualitySettings[quality]

    let command = ffmpeg(inputPath)
      .outputOptions([
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-crf', settings.crf.toString(),
        '-preset', settings.preset,
        '-movflags', '+faststart' // Optimize for web playback
      ])

    // Add start time if specified
    if (startTime > 0) {
      command = command.seekInput(startTime)
    }

    // Add duration if specified
    if (duration) {
      command = command.duration(duration)
    }

    command
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine)
      })
      .on('progress', (progress) => {
        if (onProgress) {
          onProgress({
            percent: progress.percent || 0,
            time: progress.timemark ? parseTimeToSeconds(progress.timemark) : 0,
            speed: progress.currentFps ? `${progress.currentFps}x` : '0x'
          })
        }
      })
      .on('end', () => {
        console.log('Export completed successfully')
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('Export failed:', err)
        reject(new Error(`Export failed: ${err.message}`))
      })
      .run()
  })
}

/**
 * Get video metadata (duration, resolution, etc.)
 */
export async function getVideoMetadata(inputPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Getting metadata for path:', inputPath, 'Type:', typeof inputPath)
      
      // Ensure inputPath is a string
      const pathString = String(inputPath)
      console.log('Converted path:', pathString)
      
      ffmpeg.ffprobe(pathString, (err, metadata) => {
        if (err) {
          console.error('FFprobe error:', err)
          reject(new Error(`Failed to get metadata: ${err.message}`))
          return
        }
        console.log('Video metadata extracted successfully')
        resolve(metadata)
      })
    } catch (error) {
      console.error('FFprobe setup error:', error)
      reject(new Error(`FFprobe not available: ${error.message}`))
    }
  })
}

/**
 * Extract audio from video
 */
export async function extractAudio(
  inputPath: string,
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-vn', '-acodec', 'pcm_s16le', '-ar', '16000'])
      .output(outputPath)
      .on('end', () => {
        console.log('Audio extraction completed')
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('Audio extraction failed:', err)
        reject(new Error(`Audio extraction failed: ${err.message}`))
      })
      .run()
  })
}

/**
 * Convert time string (HH:MM:SS.mmm) to seconds
 */
function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':')
  if (parts.length !== 3) return 0
  
  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  const seconds = parseFloat(parts[2]) || 0
  
  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Get default output path for exports
 */
export function getDefaultOutputPath(inputPath: string, suffix: string = '_exported'): string {
  const path = require('path')
  const dir = path.dirname(inputPath)
  const name = path.basename(inputPath, path.extname(inputPath))
  const ext = path.extname(inputPath)
  
  return path.join(dir, `${name}${suffix}${ext}`)
}
