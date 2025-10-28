import React, { useRef, useState } from 'react'
import useVideoStore from '../stores/videoStore'
import TimelineClip from './TimelineClip'
import { formatTime } from '../utils/timeUtils'
import './Timeline.css'

interface TimelineProps {
  className?: string
}

export default function Timeline({ className = '' }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const {
    timelineClips,
    currentTime,
    pixelsPerSecond = 20, // Fixed: 20px per second for consistent timeline width
    setCurrentTime,
    addToTimeline,
    resetTrim
  } = useVideoStore()

  // Handle timeline click to seek video
  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const newTime = clickX / pixelsPerSecond

    setCurrentTime(newTime)
  }

  // Handle drag over
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }

  // Handle drag leave
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  // Handle drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    const clipId = event.dataTransfer.getData('text/plain')
    if (clipId) {
      addToTimeline(clipId)
    }
  }

  // Calculate total timeline duration
  const totalDuration = timelineClips.reduce((total, clip) => {
    return total + (clip.duration || 0)
  }, 0)

  // Generate time ruler markers
  const generateTimeMarkers = () => {
    const markers: React.ReactElement[] = []
    const maxTime = Math.max(totalDuration, 30) // At least 30 seconds
    const interval = maxTime > 60 ? 10 : 5 // 10s intervals for long videos, 5s for short

    for (let time = 0; time <= maxTime; time += interval) {
      markers.push(
        <div
          key={time}
          className="time-marker"
          style={{
            left: `${time * pixelsPerSecond}px`
          }}
        >
          <div className="time-marker-line" />
          <div className="time-marker-label">
            {formatTime(time)}
          </div>
        </div>
      )
    }

    return markers
  }


  // Debug logging
  // console.log('🎬 Timeline: Rendering with clips:', {
  //   count: timelineClips.length,
  //   clips: timelineClips.map(clip => ({
  //     id: clip.id,
  //     name: clip.name,
  //     duration: clip.duration,
  //     path: clip.path
  //   })),
  //   pixelsPerSecond: pixelsPerSecond
  // })

  return (
    <div className={`timeline-container ${className}`}>
      <div className="timeline-header">
        <h3>Timeline</h3>
        <div className="timeline-info">
          {timelineClips.length} clip{timelineClips.length !== 1 ? 's' : ''} • {formatTime(totalDuration)}
        </div>
      </div>

      {/* Timeline Controls */}
      {timelineClips.length > 0 && (
        <div className="timeline-controls">
          <div className="timeline-controls-header">
            <h4>Controls:</h4>
            <button 
              className="timeline-btn reset-btn"
              onClick={() => {
                console.log('🎬 Timeline: Resetting all trim points')
                timelineClips.forEach(clip => {
                  resetTrim(clip.id)
                })
              }}
              title="Reset All Trim Points (R)"
            >
              <span className="timeline-btn-icon">🔄</span>
              <span className="timeline-btn-text">Reset All</span>
            </button>
          </div>
          
          <div className="timeline-controls-actions">
            <div className="timeline-help">
              <span>💡 Drag the handles on clips to trim them</span>
            </div>
          </div>
        </div>
      )}

      <div className="timeline-wrapper">
        <div className="timeline-ruler">
          {generateTimeMarkers()}
        </div>

        <div
          ref={timelineRef}
          className={`timeline-track ${isDragOver ? 'drag-over' : ''}`}
          onClick={handleTimelineClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Playhead */}
          <div
            className="timeline-playhead"
            style={{
              left: `${currentTime * pixelsPerSecond}px`
            }}
          />

          {/* Timeline clips */}
          <div className="timeline-clips">
            {timelineClips.map((clip) => {
              return (
                <TimelineClip
                  key={clip.id}
                  clip={clip}
                  pixelsPerSecond={pixelsPerSecond}
                />
              )
            })}
          </div>

          {/* Empty state */}
          {timelineClips.length === 0 && (
            <div className="timeline-empty">
              <div className="timeline-empty-icon">🎬</div>
              <div className="timeline-empty-text">
                <h4>No clips on timeline</h4>
                <p>Import videos and add them to the timeline to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
