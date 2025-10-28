import React, { useState, useEffect, useCallback, useMemo } from 'react'
import useVideoStore from '../stores/videoStore'
import './Timeline.css'

interface TimelineClipProps {
  clip: {
    id: string
    name: string
    path: string
    duration: number
    width: number
    height: number
    frameRate: number
    fileSize: number
    trimStart?: number
    trimEnd?: number
  }
  pixelsPerSecond: number
}

const TimelineClip: React.FC<TimelineClipProps> = ({ clip, pixelsPerSecond }) => {
  const { setTrimStart, setTrimEnd } = useVideoStore()
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const { name, duration, trimStart = 0, trimEnd = duration } = clip
  
  // Memoized width calculation for consistency
  const clipWidth = useMemo(() => {
    return Math.max((trimEnd - trimStart) * pixelsPerSecond, 300)
  }, [trimEnd, trimStart, pixelsPerSecond])

  // Generate thumbnails only once
  useEffect(() => {
    if (isGenerating || thumbnails.length > 0) return
    
    setIsGenerating(true)
    const generateThumbnails = async () => {
      try {
        const video = document.createElement('video')
        video.muted = true
        video.playsInline = true
        video.preload = 'metadata'
        video.style.display = 'none'
        video.crossOrigin = 'anonymous'
        
        document.body.appendChild(video)
        
        video.src = `file://${clip.path.replace(/\\/g, '/')}`
        
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve
          video.onerror = reject
          video.load()
        })
        
        const thumbnailCount = 10
        const thumbnailUrls: string[] = []
        
        for (let i = 0; i < thumbnailCount; i++) {
          const seekTime = (i / (thumbnailCount - 1)) * duration
          video.currentTime = seekTime
          
          await new Promise(resolve => {
            video.onseeked = () => {
              const canvas = document.createElement('canvas')
              canvas.width = 100
              canvas.height = 56
              const ctx = canvas.getContext('2d')
              
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                thumbnailUrls.push(canvas.toDataURL('image/jpeg', 0.9))
              }
              resolve(void 0)
            }
          })
        }
        
        setThumbnails(thumbnailUrls)
        document.body.removeChild(video)
      } catch (error) {
        // Create fallback thumbnails
        const fallbackThumbnails = Array(10).fill('').map((_, i) => 
          `data:image/svg+xml;base64,${btoa(`
            <svg width="100" height="56" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="56" fill="#333"/>
              <text x="50" y="30" text-anchor="middle" fill="white" font-size="14">${i + 1}</text>
            </svg>
          `)}`
        )
        setThumbnails(fallbackThumbnails)
      } finally {
        setIsGenerating(false)
      }
    }
    
    generateThumbnails()
  }, [clip.path, duration, isGenerating, thumbnails.length])

  // Handle trim dragging with proper bounds
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingLeft && !isDraggingRight) return
    
    const clipElement = document.querySelector(`[data-clip-id="${clip.id}"]`) as HTMLElement
    if (!clipElement) return
    
    const rect = clipElement.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const newTime = percentage * duration
    
    if (isDraggingLeft) {
      const newTrimStart = Math.min(newTime, trimEnd - 0.1)
      setTrimStart(clip.id, Math.max(0, newTrimStart))
    } else if (isDraggingRight) {
      const newTrimEnd = Math.max(newTime, trimStart + 0.1)
      setTrimEnd(clip.id, Math.min(duration, newTrimEnd))
    }
  }, [isDraggingLeft, isDraggingRight, clip.id, duration, trimStart, trimEnd, setTrimStart, setTrimEnd])

  const handleMouseUp = useCallback(() => {
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  }, [])

  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingLeft, isDraggingRight, handleMouseMove, handleMouseUp])

  return (
    <div
      className="timeline-clip"
      data-clip-id={clip.id}
      style={{
        width: `${clipWidth}px`,
        height: '120px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        border: '2px solid #4a5568',
        borderRadius: '6px',
        overflow: 'hidden',
        flexShrink: 0
      }}
    >
      {/* Thumbnails */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative'
      }}>
        {thumbnails.map((thumbnail, index) => (
          <img
            key={index}
            src={thumbnail}
            alt={`Thumbnail ${index + 1}`}
            style={{
              width: `${100 / thumbnails.length}%`,
              height: '100%',
              objectFit: 'cover',
              borderRight: index < thumbnails.length - 1 ? '1px solid #555' : 'none',
              display: 'block'
            }}
          />
        ))}
      </div>

      {/* Left trim handle */}
      <div
        className="timeline-clip-handle timeline-clip-handle-left"
        onMouseDown={(e) => {
          e.preventDefault()
          setIsDraggingLeft(true)
        }}
        style={{
          position: 'absolute',
          left: `${(trimStart / duration) * 100}%`,
          top: 0,
          bottom: 0,
          width: '16px',
          backgroundColor: '#ff6b6b',
          cursor: 'ew-resize',
          zIndex: 30,
          border: '3px solid #ff4757',
          borderRadius: '3px',
          boxShadow: '0 0 10px rgba(255, 107, 107, 0.8)',
          display: 'block'
        }}
      />
      
      {/* Right trim handle */}
      <div
        className="timeline-clip-handle timeline-clip-handle-right"
        onMouseDown={(e) => {
          e.preventDefault()
          setIsDraggingRight(true)
        }}
        style={{
          position: 'absolute',
          left: `${(trimEnd / duration) * 100}%`,
          top: 0,
          bottom: 0,
          width: '16px',
          backgroundColor: '#ff6b6b',
          cursor: 'ew-resize',
          zIndex: 30,
          border: '3px solid #ff4757',
          borderRadius: '3px',
          boxShadow: '0 0 10px rgba(255, 107, 107, 0.8)',
          display: 'block'
        }}
      />

      {/* Clip info overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        color: 'white',
        padding: '4px 8px',
        fontSize: '11px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <span style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          maxWidth: '60%'
        }}>
          {name}
        </span>
        <span>
          {Math.round(trimStart)}s - {Math.round(trimEnd)}s
        </span>
      </div>
    </div>
  )
}

export default TimelineClip