import React from 'react'
import useVideoStore from '../stores/videoStore'
import { formatTime } from '../utils/timeUtils'

interface TrimControlsProps {
  className?: string
}

export default function TrimControls({ className = '' }: TrimControlsProps) {
  const { 
    selectedClipId, 
    getSelectedClip, 
    setTrimStart, 
    setTrimEnd, 
    resetTrim,
    currentTime 
  } = useVideoStore()

  const selectedClip = getSelectedClip()

  if (!selectedClip) {
    return (
      <div className={`trim-controls no-clip ${className}`}>
        <div className="trim-message">
          <span>📝</span>
          <p>Select a video clip to enable trim controls</p>
        </div>
      </div>
    )
  }

  const handleSetInPoint = () => {
    if (selectedClipId) {
      setTrimStart(selectedClipId, currentTime)
    }
  }

  const handleSetOutPoint = () => {
    if (selectedClipId) {
      setTrimEnd(selectedClipId, currentTime)
    }
  }

  const handleResetTrim = () => {
    if (selectedClipId) {
      resetTrim(selectedClipId)
    }
  }

  const trimDuration = selectedClip.trimEnd - selectedClip.trimStart
  const isTrimmed = selectedClip.trimStart > 0 || selectedClip.trimEnd < selectedClip.duration

  return (
    <div className={`trim-controls ${className}`}>
      <div className="trim-header">
        <h4>Trim Controls</h4>
        <div className="trim-clip-info">
          <span className="trim-clip-name">{selectedClip.name}</span>
          <span className="trim-clip-duration">
            {formatTime(selectedClip.duration)} total
          </span>
        </div>
      </div>

      <div className="trim-buttons">
        <button
          className="trim-btn trim-in-btn"
          onClick={handleSetInPoint}
          title={`Set In Point (I) - Current: ${formatTime(currentTime)}`}
        >
          <span className="trim-btn-icon">⏯️</span>
          <span className="trim-btn-text">Set In Point</span>
          <span className="trim-btn-time">{formatTime(currentTime)}</span>
        </button>

        <button
          className="trim-btn trim-out-btn"
          onClick={handleSetOutPoint}
          title={`Set Out Point (O) - Current: ${formatTime(currentTime)}`}
        >
          <span className="trim-btn-icon">⏯️</span>
          <span className="trim-btn-text">Set Out Point</span>
          <span className="trim-btn-time">{formatTime(currentTime)}</span>
        </button>

        <button
          className="trim-btn trim-reset-btn"
          onClick={handleResetTrim}
          disabled={!isTrimmed}
          title="Reset Trim (R)"
        >
          <span className="trim-btn-icon">🔄</span>
          <span className="trim-btn-text">Reset</span>
        </button>
      </div>

      <div className="trim-info">
        <div className="trim-times">
          <div className="trim-time-item">
            <span className="trim-time-label">In:</span>
            <span className="trim-time-value">{formatTime(selectedClip.trimStart)}</span>
          </div>
          <div className="trim-time-item">
            <span className="trim-time-label">Out:</span>
            <span className="trim-time-value">{formatTime(selectedClip.trimEnd)}</span>
          </div>
          <div className="trim-time-item trim-duration">
            <span className="trim-time-label">Duration:</span>
            <span className="trim-time-value">{formatTime(trimDuration)}</span>
          </div>
        </div>

        {isTrimmed && (
          <div className="trim-stats">
            <div className="trim-stat">
              <span className="trim-stat-label">Trimmed:</span>
              <span className="trim-stat-value">
                {formatTime(selectedClip.duration - trimDuration)} removed
              </span>
            </div>
            <div className="trim-stat">
              <span className="trim-stat-label">Remaining:</span>
              <span className="trim-stat-value">
                {((trimDuration / selectedClip.duration) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="trim-help">
        <p className="trim-help-text">
          <strong>Keyboard shortcuts:</strong> I = In Point, O = Out Point, R = Reset
        </p>
      </div>
    </div>
  )
}
