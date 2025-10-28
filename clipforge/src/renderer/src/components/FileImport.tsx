import React, { useCallback, useState } from 'react'
import { useVideoImport } from '../hooks/useVideoImport'
import { formatFileSize } from '../utils/fileUtils'

interface FileImportProps {
  onImportComplete?: (clipId: string) => void
  onImportError?: (error: string) => void
  className?: string
}

export default function FileImport({
  onImportComplete,
  onImportError,
  className = ''
}: FileImportProps) {
  const { isImporting, error, importFromFilePicker, clearError } = useVideoImport()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = useCallback(async () => {
    const result = await importFromFilePicker()
    
    if (result.success && result.clipId) {
      onImportComplete?.(result.clipId)
    } else {
      onImportError?.(result.error || 'Import failed')
    }
  }, [importFromFilePicker, onImportComplete, onImportError])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find(file => 
      file.type.startsWith('video/') || 
      ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'].some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )
    )

    if (!videoFile) {
      onImportError?.('Please select a valid video file')
      return
    }

    // For drag & drop, we need to handle it differently since we can't access file.path
    // For now, we'll use the file picker approach
    await handleFileSelect()
  }, [handleFileSelect, onImportError])

  return (
    <div className={`file-import ${className}`}>
      <button
        className={`import-button ${isImporting ? 'importing' : ''}`}
        onClick={handleFileSelect}
        disabled={isImporting}
      >
        {isImporting ? (
          <div className="importing-content">
            <div className="import-spinner"></div>
            <span>Importing...</span>
          </div>
        ) : (
          <>
            <span className="import-icon">📁</span>
            <span className="import-text">Import media</span>
          </>
        )}
      </button>

      {error && (
        <div className="import-error">
          <span>{error}</span>
          <button onClick={clearError} className="import-clear-error-btn">
            ×
          </button>
        </div>
      )}
    </div>
  )
}
