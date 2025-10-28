import { useCallback } from 'react'
import { useVideoImport } from '../hooks/useVideoImport'

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

  const handleFileSelect = useCallback(async () => {
    const result = await importFromFilePicker()
    
    if (result.success && result.clipId) {
      onImportComplete?.(result.clipId)
    } else {
      onImportError?.(result.error || 'Import failed')
    }
  }, [importFromFilePicker, onImportComplete, onImportError])

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