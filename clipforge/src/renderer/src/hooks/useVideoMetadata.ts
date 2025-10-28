import { useState, useCallback } from 'react'

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

export interface MetadataResult {
  success: boolean
  metadata?: VideoMetadata
  error?: string
}

export function useVideoMetadata() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getMetadata = useCallback(async (inputPath: string): Promise<MetadataResult> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await window.clipForgeAPI.getVideoMetadata(inputPath)
      
      if (result.success) {
        const metadata = result.metadata
        const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video')
        const audioStream = metadata.streams.find((stream: any) => stream.codec_type === 'audio')
        
        const videoMetadata: VideoMetadata = {
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          fps: videoStream?.r_frame_rate ? eval(videoStream.r_frame_rate) : 0,
          bitrate: metadata.format.bit_rate || 0,
          codec: videoStream?.codec_name || 'unknown',
          hasAudio: !!audioStream,
          audioCodec: audioStream?.codec_name,
          audioChannels: audioStream?.channels,
          audioSampleRate: audioStream?.sample_rate
        }
        
        setIsLoading(false)
        return { success: true, metadata: videoMetadata }
      } else {
        setError(result.error)
        setIsLoading(false)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get metadata'
      setError(errorMessage)
      setIsLoading(false)
      return { success: false, error: errorMessage }
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    getMetadata,
    clearError
  }
}
