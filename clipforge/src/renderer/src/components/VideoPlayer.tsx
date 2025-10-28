import React, { useRef, useEffect, useState } from 'react'
import useVideoStore from '../stores/videoStore'
import { formatDuration } from '../utils/fileUtils'
import { formatTime } from '../utils/timeUtils'

interface VideoPlayerProps {
  className?: string
}

export default function VideoPlayer({ className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  
  const { 
    selectedClipId, 
    clips, 
    timelineClips,
    isPlaying,
    setCurrentTime: setStoreCurrentTime,
    setIsPlaying: setStoreIsPlaying
  } = useVideoStore()

  const selectedClip = selectedClipId ? clips.find(clip => clip.id === selectedClipId) : null
  
  // Determine what to show: selected clip or timeline preview
  const displayMode = timelineClips.length > 0 ? 'timeline' : 'single'
  const currentClip = displayMode === 'timeline' ? timelineClips[0] : selectedClip
  
  // Track which clip in the timeline we're currently playing
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0)
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false)

  // Update video source when clip changes
  useEffect(() => {
    if (currentClip && videoRef.current) {
      // Use file:// protocol for local file access
      // On Windows, we need to handle backslashes properly
      const normalizedPath = currentClip.path.replace(/\\/g, '/')
      const videoSrc = `file:///${normalizedPath}`
      // Setting video source
      videoRef.current.src = videoSrc
      setIsLoaded(false)
    }
  }, [currentClip, displayMode, currentTimelineIndex])

  // Handle video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current && currentClip) {
      const fullDuration = videoRef.current.duration
      const trimStart = currentClip.trimStart || 0
      const trimEnd = currentClip.trimEnd || fullDuration
      
      
      if (isFinite(fullDuration) && fullDuration > 0) {
        // Set the trimmed duration for display
        const trimmedDuration = trimEnd - trimStart
        setDuration(trimmedDuration)
        setIsLoaded(true)
        
        // Set the video to start at trim point
        videoRef.current.currentTime = trimStart
        setCurrentTime(0) // Reset current time to 0 for trimmed view
      } else {
        setDuration(0)
        setIsLoaded(false)
      }
    }
  }

  // Handle video load start
  const handleLoadStart = () => {
    // Video load started
  }

  // Handle video can play
  const handleCanPlay = () => {
    // Video can play
  }

  // Handle video loaded data
  const handleLoadedData = () => {
    setIsLoaded(true)
  }

  // Handle video load error
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video load error:', e)
    const target = e.target as HTMLVideoElement
    console.error('Video error details:', {
      error: target.error,
      networkState: target.networkState,
      readyState: target.readyState
    })
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current && currentClip) {
      const fullCurrentTime = videoRef.current.currentTime
      const trimStart = currentClip.trimStart || 0
      const trimEnd = currentClip.trimEnd || videoRef.current.duration
      
      // Convert to trimmed time (0 to trimmed duration)
      const trimmedCurrentTime = Math.max(0, fullCurrentTime - trimStart)
      setCurrentTime(trimmedCurrentTime)
      setStoreCurrentTime(trimmedCurrentTime)
      
      // Check if we've reached the trim end point
      if (fullCurrentTime >= trimEnd) {
        videoRef.current.pause()
        setStoreIsPlaying(false)
        setIsPlayingTimeline(false)
        return
      }
      
      // If playing timeline and current clip ended, move to next clip
      if (isPlayingTimeline && displayMode === 'timeline') {
        const clipDuration = trimEnd - trimStart
        if (trimmedCurrentTime >= clipDuration) {
          // Move to next clip in timeline
          if (currentTimelineIndex < timelineClips.length - 1) {
            setCurrentTimelineIndex(currentTimelineIndex + 1)
          } else {
            // Reached end of timeline
            videoRef.current.pause()
            setStoreIsPlaying(false)
            setIsPlayingTimeline(false)
          }
        }
      }
    }
  }

  // Handle play/pause
  const handlePlayPause = () => {
    if (videoRef.current && currentClip) {
      if (videoRef.current.paused) {
        // Ensure we start at the trim point
        const trimStart = currentClip.trimStart || 0
        videoRef.current.currentTime = trimStart
        videoRef.current.play()
        setStoreIsPlaying(true)
      } else {
        videoRef.current.pause()
        setStoreIsPlaying(false)
      }
    }
  }

  // Handle seek
  const handleSeek = (time: number) => {
    if (videoRef.current && currentClip) {
      const trimStart = currentClip.trimStart || 0
      const trimEnd = currentClip.trimEnd || videoRef.current.duration
      
      // Clamp seek time to trimmed range
      const clampedTime = Math.max(0, Math.min(time, trimEnd - trimStart))
      
      // Convert to full video time
      const fullVideoTime = trimStart + clampedTime
      videoRef.current.currentTime = fullVideoTime
      
      setCurrentTime(clampedTime)
      setStoreCurrentTime(clampedTime)
    }
  }

  // Update currentClip when timeline index changes
  useEffect(() => {
    if (displayMode === 'timeline' && timelineClips.length > 0) {
      const newClip = timelineClips[currentTimelineIndex]
      if (newClip) {
        // Force video to reload with new clip
        if (videoRef.current) {
          const normalizedPath = newClip.path.replace(/\\/g, '/')
          const videoSrc = `file:///${normalizedPath}`
          videoRef.current.src = videoSrc
          setIsLoaded(false)
        }
      }
    }
  }, [currentTimelineIndex, displayMode, timelineClips])

  // Sync with store playing state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && videoRef.current.paused) {
        videoRef.current.play()
      } else if (!isPlaying && !videoRef.current.paused) {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  if (!currentClip) {
    return (
      <div className={`video-player no-video ${className}`}>
        <div className="no-video-message">
          <div className="video-icon">🎬</div>
          <h3>No Video Selected</h3>
          <p>Import a video file to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`video-player ${className}`}>
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-element"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => {
            // Ensure we start at trim point when using native controls
            if (videoRef.current && currentClip) {
              const trimStart = currentClip.trimStart || 0
              videoRef.current.currentTime = trimStart
            }
            setStoreIsPlaying(true)
          }}
          onPause={() => {
            setStoreIsPlaying(false)
          }}
          onEnded={() => setStoreIsPlaying(false)}
          onError={handleVideoError}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onLoadedData={handleLoadedData}
          controls={true} // Enable native controls
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        
        {!isLoaded && (
          <div className="video-loading">
            <div className="video-spinner"></div>
            <p>Loading video...</p>
          </div>
        )}
        
        {isLoaded && !isPlaying && (
          <div className="video-play-overlay">
            <button 
              className="video-play-btn"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.play()
                  setStoreIsPlaying(true)
                }
              }}
            >
              ▶️
            </button>
          </div>
        )}
      </div>

      <div className="video-controls">
        <button 
          className="play-pause-btn"
          onClick={handlePlayPause}
          disabled={!isLoaded}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <div className="time-display">
          <span>{formatDuration(currentTime)}</span>
          <span>/</span>
          <span>{formatDuration(duration)}</span>
        </div>
        
        <div className="video-progress-bar">
          <div 
            className="video-progress-fill"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          ></div>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="progress-slider"
            disabled={!isLoaded}
          />
        </div>
      </div>

      <div className="video-info">
        <h4>
          {displayMode === 'timeline' ? (
            <>Timeline: {currentTimelineIndex + 1} of {timelineClips.length}</>
          ) : (
            currentClip.name
          )}
        </h4>
        <div className="video-details">
          <span>{currentClip.width}x{currentClip.height}</span>
          <span>{currentClip.fps.toFixed(1)} fps</span>
          {displayMode === 'timeline' ? (
            <span>Total: {formatTime(timelineClips.reduce((sum, clip) => sum + (clip.trimEnd - clip.trimStart), 0))}</span>
          ) : (
            <span>{formatDuration(currentClip.duration)}</span>
          )}
        </div>
        {displayMode === 'timeline' && (
          <div className="timeline-mode-indicator">
            <span className="timeline-mode-badge">Timeline Preview</span>
            <span className="timeline-clips-count">{timelineClips.length} clips</span>
            <button 
              className="play-timeline-btn"
              onClick={() => {
                // Start playing merged timeline
                setCurrentTimelineIndex(0)
                setIsPlayingTimeline(true)
                if (videoRef.current) {
                  videoRef.current.currentTime = 0
                  videoRef.current.play()
                  setStoreIsPlaying(true)
                }
              }}
              title="Play Merged Timeline"
            >
              ▶️ Play Timeline
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
