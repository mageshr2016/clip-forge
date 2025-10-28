import { useState } from 'react'
import { useExport, ExportOptions } from '../hooks/useExport'

interface ExportButtonProps {
  inputPath: string
  startTime?: number
  duration?: number
  quality?: 'low' | 'medium' | 'high'
  onExportComplete?: () => void
  onExportError?: (error: string) => void
  className?: string
  disabled?: boolean
}

export default function ExportButton({
  inputPath,
  startTime,
  duration,
  quality = 'high',
  onExportComplete,
  onExportError,
  className = '',
  disabled = false
}: ExportButtonProps) {
  const { isExporting, progress, error, exportVideoWithProgress, clearError } = useExport()
  const [showProgress, setShowProgress] = useState(false)

  const handleExport = async () => {
    if (!inputPath) {
      onExportError?.('No input file selected')
      return
    }

    // Show file picker to let user choose save location
    try {
      const defaultPath = getDefaultOutputPath(inputPath)
      
      const dialogOptions = {
        title: 'Save Video As',
        defaultPath: defaultPath,
        filters: [
          { name: 'MP4 Video', extensions: ['mp4'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }
      
      const saveResult = await window.clipForgeAPI.showSaveDialog(dialogOptions)

      if (saveResult.canceled) {
        return
      }

      const selectedPath = saveResult.filePath

      clearError()
      setShowProgress(true)

      const options: ExportOptions = {
        inputPath,
        outputPath: selectedPath,
        startTime,
        duration,
        quality
      }

      const result = await exportVideoWithProgress(options)
      
      if (result.success && result.outputPath) {
        onExportComplete?.()
        setShowProgress(false)
        
        // Use browser alert for immediate visibility
        alert(`✅ Export Complete!\n\nVideo saved to:\n${result.outputPath}\n\nClick OK to open the folder.`)
        
        // Open folder automatically
        try {
          await window.clipForgeAPI.openFileLocation?.(result.outputPath)
        } catch (error) {
          // Could not open folder
        }
      } else {
        onExportError?.(result.error || 'Export failed')
        setShowProgress(false)
      }
    } catch (error) {
      onExportError?.(error instanceof Error ? error.message : 'Export failed')
      setShowProgress(false)
    }
  }

  const getDefaultOutputPath = (inputPath: string): string => {
    // Simple path manipulation without require
    const lastSlash = Math.max(inputPath.lastIndexOf('/'), inputPath.lastIndexOf('\\'))
    const lastDot = inputPath.lastIndexOf('.')
    
    if (lastSlash === -1) {
      // No directory separator found
      if (lastDot === -1) {
        return `${inputPath}_exported.mp4`
      } else {
        return `${inputPath.substring(0, lastDot)}_exported${inputPath.substring(lastDot)}`
      }
    }
    
    const dir = inputPath.substring(0, lastSlash + 1)
    const filename = inputPath.substring(lastSlash + 1)
    
    if (lastDot === -1 || lastDot <= lastSlash) {
      // No extension or extension is before directory separator
      return `${dir}${filename}_exported.mp4`
    } else {
      const nameWithoutExt = filename.substring(0, lastDot - lastSlash - 1)
      const ext = filename.substring(lastDot - lastSlash - 1)
      return `${dir}${nameWithoutExt}_exported${ext}`
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatProgress = (): string => {
    if (!progress) return ''
    
    const percent = Math.round(progress.percent || 0)
    const time = formatTime(progress.time || 0)
    const speed = progress.speed || '0x'
    
    return `${percent}% - ${time} - ${speed}`
  }

  return (
    <div className={`export-button-container ${className}`}>
      <button
        onClick={handleExport}
        disabled={disabled || isExporting || !inputPath}
        className={`export-button ${isExporting ? 'exporting' : ''}`}
      >
        {isExporting ? (
          <div className="export-loading">
            <div className="export-spinner"></div>
            <span>Exporting...</span>
          </div>
        ) : (
          'Export Video'
        )}
      </button>

      {showProgress && progress && (
        <div className="export-progress">
          <div className="export-progress-bar">
            <div 
              className="export-progress-fill" 
              style={{ width: `${progress.percent || 0}%` }}
            ></div>
          </div>
          <div className="export-progress-text">
            {formatProgress()}
          </div>
        </div>
      )}

      {error && (
        <div className="export-error">
          <span>Error: {error}</span>
          <button onClick={clearError} className="clear-error-btn">
            ×
          </button>
        </div>
      )}


    </div>
  )
}
