import Versions from './components/Versions'
import ExportButton from './components/ExportButton'
import FileImport from './components/FileImport'
import VideoPlayer from './components/VideoPlayer'
import Timeline from './components/Timeline'
import TrimControls from './components/TrimControls'
import useVideoStore from './stores/videoStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { formatTime } from './utils/timeUtils'

function App(): React.JSX.Element {
  const { clips, selectedClipId, getSelectedClip, addToTimeline, timelineClips, isPlaying, currentTime, duration } = useVideoStore()
  const selectedClip = getSelectedClip()

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  // Debug: Check what APIs are available
  console.log('Window object:', window)
  console.log('window.electron:', window.electron)
  console.log('window.clipForgeAPI:', window.clipForgeAPI)

  const ipcHandle = (): void => {
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('ping')
    } else {
      console.error('window.electron.ipcRenderer is not available')
    }
  }
  
  const testClipForgeAPI = async (): Promise<void> => {
    console.log('Testing ClipForge API...')
    
    try {
      // Test file selection
      const fileResult = await window.clipForgeAPI.selectVideoFile()
      if (fileResult.success) {
        console.log('Selected file:', fileResult.filePath)
        
        // Test metadata
        const metadataResult = await window.clipForgeAPI.getVideoMetadata(fileResult.filePath)
        if (metadataResult.success) {
          console.log('Video metadata:', metadataResult.metadata)
        }
        
        // Test scene detection
        const sceneResult = await window.clipForgeAPI.detectScenes(fileResult.filePath)
        if (sceneResult.success) {
          console.log('Detected scenes:', sceneResult.scenes)
        }
      }
    } catch (error) {
      console.error('API test failed:', error)
    }
  }

  const handleImportComplete = (clipId: string): void => {
    console.log('Video imported successfully:', clipId)
    // Automatically add to timeline
    addToTimeline(clipId)
    console.log('🎬 App: Auto-added clip to timeline:', clipId)
  }

  const handleImportError = (error: string): void => {
    console.error('Import failed:', error)
  }

  const handleExportComplete = (outputPath: string): void => {
    console.log('Export completed:', outputPath)
  }

  const handleExportError = (error: string): void => {
    console.error('Export failed:', error)
  }

  return (
    <div className="clipforge-app">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <h1 className="app-title">🎬 ClipForge</h1>
          <div className="project-info">
            <span className="project-name">
              {timelineClips.length > 0 ? `Project (${timelineClips.length} clips)` : 'Untitled Project'}
            </span>
          </div>
        </div>
        <div className="top-bar-center">
          <div className="project-status">
            <span className="project-status-text">
              {timelineClips.length > 0 ? 
                `Ready to export • ${timelineClips.length} clips` : 
                'Import videos to get started'
              }
            </span>
          </div>
        </div>
        <div className="top-bar-right">
          <ExportButton
            inputPath={selectedClip?.path || ''}
            startTime={selectedClip?.trimStart}
            duration={selectedClip ? (selectedClip.trimEnd || selectedClip.duration) - (selectedClip.trimStart || 0) : undefined}
            quality="high"
            onExportComplete={handleExportComplete}
            onExportError={handleExportError}
            disabled={!selectedClip}
            className="export-btn-wrapper"
          />
          <button 
            className="help-btn" 
            title="Help"
            onClick={() => {
              alert('ClipForge Help:\n\n• Import videos using the Media panel\n• Add clips to timeline for editing\n• Use I/O keys to set trim points\n• Export your final video')
            }}
          >
            <span>❓</span>
          </button>
        </div>
      </header>

      <div className="app-layout">
        {/* Left Navigation Panel */}
        <nav className="left-nav">
          <div className="nav-sections">
            <div className="nav-section">
              <h3>Media</h3>
              <FileImport
                onImportComplete={handleImportComplete}
                onImportError={handleImportError}
                className="nav-file-import"
              />
              
              {clips.length > 0 && (
                <div className="nav-clips-list">
                  <div className="nav-clips-header">
                    <h4>Your media ({clips.length})</h4>
                    <button
                      className="nav-add-all-btn"
                      onClick={() => {
                        clips.forEach(clip => {
                          if (!timelineClips.some(tc => tc.id === clip.id)) {
                            addToTimeline(clip.id)
                          }
                        })
                      }}
                      title="Add All to Timeline"
                    >
                      Add All
                    </button>
                  </div>
                  {clips.map((clip) => {
                    const isOnTimeline = timelineClips.some(tc => tc.id === clip.id)
                    return (
                      <div 
                        key={clip.id} 
                        className={`nav-clip-item ${selectedClipId === clip.id ? 'selected' : ''}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', clip.id)
                          e.dataTransfer.effectAllowed = 'copy'
                        }}
                      >
                        <div 
                          className="nav-clip-info"
                          onClick={() => useVideoStore.getState().selectClip(clip.id)}
                        >
                                  <div className="nav-clip-header">
                                    <h5>{clip.name}</h5>
                                  </div>
                          <p>{clip.width}x{clip.height} • {clip.fps.toFixed(1)}fps</p>
                        </div>
                        <div className="nav-clip-actions">
                          <button
                            className="nav-clip-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              useVideoStore.getState().removeClip(clip.id)
                            }}
                            title="Delete Video"
                          >
                            🗑️
                          </button>
                          {!isOnTimeline ? (
                            <button
                              className="nav-clip-add-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                addToTimeline(clip.id)
                              }}
                              title="Add to Timeline"
                            >
                              ➕
                            </button>
                          ) : (
                            <div className="nav-clip-timeline-actions">
                              <span className="nav-clip-on-timeline" title="On Timeline">
                                ✅
                              </span>
                              <button
                                className="nav-clip-remove-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  useVideoStore.getState().removeFromTimeline(clip.id)
                                }}
                                title="Remove from Timeline"
                              >
                                ❌
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <div className="content-top">
            <VideoPlayer className="main-video-player" />
                    <div className="video-controls-bar">
                      <button className="control-btn" disabled={!selectedClip} title="Previous">
                        <span>⏮</span>
                      </button>
                      <button className="control-btn" disabled={!selectedClip} title="Rewind 5s">
                        <span>⏪</span>
                      </button>
                      <button 
                        className="control-btn play-pause-btn" 
                        disabled={!selectedClip} 
                        title={isPlaying ? "Pause" : "Play"}
                        onClick={() => {
                          if (selectedClip) {
                            const videoElement = document.querySelector('video')
                            if (videoElement) {
                              if (isPlaying) {
                                videoElement.pause()
                              } else {
                                videoElement.play()
                              }
                            }
                          }
                        }}
                      >
                        <span>{isPlaying ? "⏸️" : "▶️"}</span>
                      </button>
                      <button className="control-btn" disabled={!selectedClip} title="Forward 5s">
                        <span>⏩</span>
                      </button>
                      <button className="control-btn" disabled={!selectedClip} title="Next">
                        <span>⏭</span>
                      </button>
                      <div className="time-display">
                        <span>{formatTime(currentTime)} / {isFinite(duration) && duration > 0 ? formatTime(duration) : 'NaN:NaN'}</span>
                      </div>
                    </div>
          </div>
          <div className="content-bottom">
            <Timeline className="main-timeline" />
          </div>
        </main>

                {/* Right Panel - Removed Trim Controls (integrated into timeline) */}
      </div>

      <footer className="app-footer">
        <Versions />
        <p className="tip">
          Press <code>F12</code> to open DevTools
        </p>
      </footer>
    </div>
  )
}

export default App
