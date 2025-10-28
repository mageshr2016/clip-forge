import { useState, useCallback } from 'react'
import useVideoStore from '../stores/videoStore'
import { validateVideoFile, getFileNameWithoutExtension, formatFileSize } from '../utils/fileUtils'
import { VideoMetadata } from '../utils/fileUtils'

// Safe frame rate parsing without eval()
function parseFrameRate(frameRate: string): number {
  try {
    // Handle formats like "30/1", "25/1", "29.97/1", etc.
    if (frameRate.includes('/')) {
      const [numerator, denominator] = frameRate.split('/').map(Number)
      return denominator !== 0 ? numerator / denominator : 0
    }
    // Handle direct number format
    return parseFloat(frameRate) || 0
  } catch {
    return 0
  }
}

export interface ImportResult {
  success: boolean
  clipId?: string
  error?: string
}

export function useVideoImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { addClip, setIsAnalyzing, setAnalysisProgress } = useVideoStore()

  const importVideoFile = useCallback(async (file: File, skipValidation = false): Promise<ImportResult> => {
    setIsImporting(true)
    setError(null)

    try {
      // Validate file (skip validation for file picker imports)
      if (!skipValidation) {
        const validation = validateVideoFile(file)
        if (!validation.isValid) {
          setError(validation.error || 'Invalid file')
          setIsImporting(false)
          return { success: false, error: validation.error }
        }
      }

      // Get video metadata
      setIsAnalyzing(true)
      setAnalysisProgress(10)
      
      // Ensure file path is a string
      const filePath = String(file.path)
      console.log('Getting metadata for file:', filePath, 'Type:', typeof filePath)
      
      const metadataResult = await window.clipForgeAPI.getVideoMetadata(filePath)
      if (!metadataResult.success) {
        setError(metadataResult.error || 'Failed to get video metadata')
        setIsAnalyzing(false)
        setIsImporting(false)
        return { success: false, error: metadataResult.error }
      }

      setAnalysisProgress(30)

      // Check if video has audio
      const audioResult = await window.clipForgeAPI.hasAudio(filePath)
      if (!audioResult.success) {
        console.warn('Failed to check audio:', audioResult.error)
      }

      setAnalysisProgress(50)

      // Create video clip object
      const metadata = metadataResult.metadata
      const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video')
      const audioStream = metadata.streams.find((stream: any) => stream.codec_type === 'audio')

      const clipData = {
        name: getFileNameWithoutExtension(file.name),
        path: filePath,
        duration: metadata.format.duration || 0,
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
        fps: videoStream?.r_frame_rate ? parseFrameRate(videoStream.r_frame_rate) : 0,
        bitrate: metadata.format.bit_rate || 0,
        codec: videoStream?.codec_name || 'unknown',
        hasAudio: audioResult.success ? audioResult.hasAudio : !!audioStream,
        audioCodec: audioStream?.codec_name,
        audioChannels: audioStream?.channels,
        audioSampleRate: audioStream?.sample_rate
      }

      setAnalysisProgress(70)

      // Add clip to store
      const clipId = addClip(clipData)

      setAnalysisProgress(100)
      setIsAnalyzing(false)
      setIsImporting(false)

      return { success: true, clipId }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Import failed'
      setError(errorMessage)
      setIsAnalyzing(false)
      setIsImporting(false)
      return { success: false, error: errorMessage }
    }
  }, [addClip, setIsAnalyzing, setAnalysisProgress])

  const importFromFilePicker = useCallback(async (): Promise<ImportResult> => {
    setIsImporting(true)
    setError(null)

    try {
      // Check if API is available
      if (!window.clipForgeAPI?.selectVideoFile) {
        setError('ClipForge API is not available. Please restart the application.')
        setIsImporting(false)
        return { success: false, error: 'ClipForge API is not available' }
      }

      // Open file picker
      const result = await window.clipForgeAPI.selectVideoFile()
      if (!result.success) {
        setError(result.error || 'No file selected')
        setIsImporting(false)
        return { success: false, error: result.error }
      }

      // Create a mock File object for the selected path
      const mockFile = {
        name: result.filePath.split('/').pop() || result.filePath.split('\\').pop() || 'video.mp4',
        path: result.filePath,
        size: 0 // We'll get this from metadata
      } as File & { path: string }

      return await importVideoFile(mockFile, true) // Skip validation for file picker
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'File selection failed'
      setError(errorMessage)
      setIsImporting(false)
      return { success: false, error: errorMessage }
    }
  }, [importVideoFile])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isImporting,
    error,
    importVideoFile,
    importFromFilePicker,
    clearError
  }
}
