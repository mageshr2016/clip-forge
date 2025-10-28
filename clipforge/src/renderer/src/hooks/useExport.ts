import { useState, useCallback } from 'react'

export interface ExportOptions {
  inputPath: string
  outputPath: string
  startTime?: number
  duration?: number
  quality?: 'low' | 'medium' | 'high'
}

export interface ExportProgress {
  percent: number
  time: number
  speed: string
}

export interface ExportResult {
  success: boolean
  outputPath?: string
  error?: string
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const exportVideo = useCallback(async (options: ExportOptions): Promise<ExportResult> => {
    setIsExporting(true)
    setError(null)
    setProgress(null)

    try {
      const result = await window.clipForgeAPI.exportVideo(options)
      
      if (result.success) {
        setIsExporting(false)
        return { success: true, outputPath: result.outputPath }
      } else {
        setError(result.error)
        setIsExporting(false)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed'
      setError(errorMessage)
      setIsExporting(false)
      return { success: false, error: errorMessage }
    }
  }, [])

  const exportVideoWithProgress = useCallback(async (options: ExportOptions): Promise<ExportResult> => {
    setIsExporting(true)
    setError(null)
    setProgress(null)

    // Set up progress listener
    const progressCallback = (progressData: ExportProgress) => {
      setProgress(progressData)
    }

    window.clipForgeAPI.onExportProgress(progressCallback)

    try {
      const result = await window.clipForgeAPI.exportVideoWithProgress(options)
      
      // Clean up progress listener
      window.clipForgeAPI.removeExportProgressListener(progressCallback)
      
      if (result.success) {
        setIsExporting(false)
        setProgress(null)
        return { success: true, outputPath: result.outputPath }
      } else {
        setError(result.error)
        setIsExporting(false)
        setProgress(null)
        return { success: false, error: result.error }
      }
    } catch (err) {
      // Clean up progress listener
      window.clipForgeAPI.removeExportProgressListener(progressCallback)
      
      const errorMessage = err instanceof Error ? err.message : 'Export failed'
      setError(errorMessage)
      setIsExporting(false)
      setProgress(null)
      return { success: false, error: errorMessage }
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearProgress = useCallback(() => {
    setProgress(null)
  }, [])

  return {
    isExporting,
    progress,
    error,
    exportVideo,
    exportVideoWithProgress,
    clearError,
    clearProgress
  }
}
