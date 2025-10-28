import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'

// Extract the actual path from ffprobe-static (it exports an object with path property)
const ffprobePath = ffprobeStatic.path

// Set FFmpeg and FFprobe paths
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

export interface AudioExtractionOptions {
  inputPath: string
  outputPath?: string
  format?: 'wav' | 'mp3' | 'aac' | 'pcm'
  sampleRate?: number
  channels?: number
}

/**
 * Extract audio from video file
 */
export async function extractAudio(
  options: AudioExtractionOptions
): Promise<string> {
  const {
    inputPath,
    outputPath,
    format = 'wav',
    sampleRate = 16000,
    channels = 1
  } = options

  const defaultOutputPath = getDefaultAudioPath(inputPath, format)
  const finalOutputPath = outputPath || defaultOutputPath

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .outputOptions([
        '-vn', // No video
        '-acodec', getAudioCodec(format),
        '-ar', sampleRate.toString(),
        '-ac', channels.toString()
      ])
      .output(finalOutputPath)

    command
      .on('start', (commandLine) => {
        console.log('Audio extraction command:', commandLine)
      })
      .on('end', () => {
        console.log('Audio extraction completed')
        resolve(finalOutputPath)
      })
      .on('error', (err) => {
        console.error('Audio extraction failed:', err)
        reject(new Error(`Audio extraction failed: ${err.message}`))
      })
      .run()
  })
}

/**
 * Extract audio for speech-to-text processing
 */
export async function extractAudioForSTT(
  inputPath: string,
  outputPath?: string
): Promise<string> {
  const defaultOutputPath = getDefaultAudioPath(inputPath, 'wav')
  const finalOutputPath = outputPath || defaultOutputPath

  return extractAudio({
    inputPath,
    outputPath: finalOutputPath,
    format: 'wav',
    sampleRate: 16000, // Optimal for speech recognition
    channels: 1 // Mono for better STT accuracy
  })
}

/**
 * Get audio duration in seconds
 */
export async function getAudioDuration(inputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get audio duration: ${err.message}`))
        return
      }
      
      const duration = metadata.format.duration
      resolve(duration || 0)
    })
  })
}

/**
 * Convert audio to different format
 */
export async function convertAudio(
  inputPath: string,
  outputPath: string,
  format: 'wav' | 'mp3' | 'aac' | 'pcm'
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-acodec', getAudioCodec(format),
        '-ar', '16000',
        '-ac', '1'
      ])
      .output(outputPath)
      .on('end', () => {
        console.log(`Audio converted to ${format}`)
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('Audio conversion failed:', err)
        reject(new Error(`Audio conversion failed: ${err.message}`))
      })
      .run()
  })
}

/**
 * Get audio codec for format
 */
function getAudioCodec(format: string): string {
  switch (format) {
    case 'wav':
      return 'pcm_s16le'
    case 'mp3':
      return 'libmp3lame'
    case 'aac':
      return 'aac'
    case 'pcm':
      return 'pcm_s16le'
    default:
      return 'pcm_s16le'
  }
}

/**
 * Get default audio output path
 */
function getDefaultAudioPath(inputPath: string, format: string): string {
  const path = require('path')
  const dir = path.dirname(inputPath)
  const name = path.basename(inputPath, path.extname(inputPath))
  
  return path.join(dir, `${name}_audio.${format}`)
}

/**
 * Check if file has audio track
 */
export async function hasAudio(inputPath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to check audio: ${err.message}`))
        return
      }
      
      const hasAudioTrack = metadata.streams.some(stream => stream.codec_type === 'audio')
      resolve(hasAudioTrack)
    })
  })
}
