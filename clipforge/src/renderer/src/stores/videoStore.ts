import { create } from 'zustand'

export interface VideoClip {
  id: string
  name: string
  path: string
  duration: number
  width: number
  height: number
  fps: number
  bitrate: number
  codec: string
  hasAudio: boolean
  audioCodec?: string
  audioChannels?: number
  audioSampleRate?: number
  trimStart: number
  trimEnd: number
  timelineStartTime?: number
  sceneMarkers: SceneMarker[]
  highlights: Highlight[]
  captions: Caption[]
  thumbnail?: string
}

export interface SceneMarker {
  timestamp: number
  score: number
}

export interface Highlight {
  timestamp: number
  confidence: number
  count: number
}

export interface Caption {
  id: string
  startTime: number
  endTime: number
  text: string
  confidence?: number
}

export interface VideoState {
  clips: VideoClip[]
  selectedClipId: string | null
  timelineClips: VideoClip[]
  currentTime: number
  isPlaying: boolean
  isAnalyzing: boolean
  analysisProgress: number
  pixelsPerSecond: number
}

export interface VideoActions {
  // Clip management
  addClip: (clip: Omit<VideoClip, 'id' | 'trimStart' | 'trimEnd' | 'sceneMarkers' | 'highlights' | 'captions'>) => string
  removeClip: (id: string) => void
  updateClip: (id: string, updates: Partial<VideoClip>) => void
  getClip: (id: string) => VideoClip | undefined
  
  // Selection
  selectClip: (id: string | null) => void
  getSelectedClip: () => VideoClip | undefined
  
  // Timeline management
  addToTimeline: (clipId: string) => void
  removeFromTimeline: (clipId: string) => void
  reorderTimeline: (fromIndex: number, toIndex: number) => void
  setPixelsPerSecond: (pixels: number) => void
  
  
  // Playback
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  
  // Trim functionality
  setTrimStart: (clipId: string, time: number) => void
  setTrimEnd: (clipId: string, time: number) => void
  resetTrim: (clipId: string) => void
  
  // AI features
  setSceneMarkers: (clipId: string, markers: SceneMarker[]) => void
  setHighlights: (clipId: string, highlights: Highlight[]) => void
  setCaptions: (clipId: string, captions: Caption[]) => void
  
  // Analysis state
  setIsAnalyzing: (analyzing: boolean) => void
  setAnalysisProgress: (progress: number) => void
  
  // Utility functions
  clearAll: () => void
  getTimelineDuration: () => number
}

const useVideoStore = create<VideoState & VideoActions>((set, get) => ({
  // Initial state
  clips: [],
  selectedClipId: null,
  timelineClips: [],
  currentTime: 0,
  isPlaying: false,
  isAnalyzing: false,
  analysisProgress: 0,
  pixelsPerSecond: 20, // 20 pixels per second for consistent timeline width

  // Clip management
  addClip: (clipData) => {
    const id = `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newClip: VideoClip = {
      ...clipData,
      id,
      trimStart: 0,
      trimEnd: clipData.duration,
      sceneMarkers: [],
      highlights: [],
      captions: []
    }
    
    set((state) => ({
      clips: [...state.clips, newClip],
      selectedClipId: id
    }))
    
    return id
  },


  updateClip: (id, updates) => {
    set((state) => ({
      clips: state.clips.map(clip => 
        clip.id === id ? { ...clip, ...updates } : clip
      ),
      timelineClips: state.timelineClips.map(clip => 
        clip.id === id ? { ...clip, ...updates } : clip
      )
    }))
  },

  getClip: (id) => {
    return get().clips.find(clip => clip.id === id)
  },

  // Selection
  selectClip: (id) => {
    set({ selectedClipId: id })
  },

  getSelectedClip: () => {
    const { clips, selectedClipId } = get()
    return selectedClipId ? clips.find(clip => clip.id === selectedClipId) : undefined
  },

  // Timeline management
  addToTimeline: (clipId) => {
    const clip = get().clips.find(c => c.id === clipId)
    if (clip && !get().timelineClips.find(c => c.id === clipId)) {
      // Calculate timeline start time (end of last clip)
      const lastClip = get().timelineClips[get().timelineClips.length - 1]
      const timelineStartTime = lastClip ? 
        (lastClip.timelineStartTime || 0) + (lastClip.trimEnd - lastClip.trimStart) : 0
      
      const clipWithTimelineStart = { ...clip, timelineStartTime }
      
      set((state) => ({
        timelineClips: [...state.timelineClips, clipWithTimelineStart]
      }))
    }
  },

  removeFromTimeline: (clipId) => {
    set((state) => ({
      timelineClips: state.timelineClips.filter(clip => clip.id !== clipId)
    }))
  },

  reorderTimeline: (fromIndex, toIndex) => {
    set((state) => {
      const newTimelineClips = [...state.timelineClips]
      const [movedClip] = newTimelineClips.splice(fromIndex, 1)
      newTimelineClips.splice(toIndex, 0, movedClip)
      
      return { timelineClips: newTimelineClips }
    })
  },

  setPixelsPerSecond: (pixels) => {
    set({ pixelsPerSecond: pixels })
  },

  // Playback
  setCurrentTime: (time) => {
    set({ currentTime: time })
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing })
  },

  // Trim functionality
  setTrimStart: (clipId, time) => {
    const clip = get().getClip(clipId)
    if (clip) {
      const trimStart = Math.max(0, Math.min(time, clip.trimEnd - 0.1))
      get().updateClip(clipId, { trimStart })
    }
  },

  setTrimEnd: (clipId, time) => {
    const clip = get().getClip(clipId)
    if (clip) {
      const trimEnd = Math.min(clip.duration, Math.max(time, clip.trimStart + 0.1))
      get().updateClip(clipId, { trimEnd })
    }
  },

  resetTrim: (clipId) => {
    const clip = get().getClip(clipId)
    if (clip) {
      get().updateClip(clipId, { 
        trimStart: 0, 
        trimEnd: clip.duration 
      })
    }
  },

  // Clip management
  removeClip: (clipId) => {
    set((state) => ({
      clips: state.clips.filter(clip => clip.id !== clipId),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
      timelineClips: state.timelineClips.filter(clip => clip.id !== clipId)
    }))
  },

  // AI features
  setSceneMarkers: (clipId, markers) => {
    get().updateClip(clipId, { sceneMarkers: markers })
  },

  setHighlights: (clipId, highlights) => {
    get().updateClip(clipId, { highlights })
  },

  setCaptions: (clipId, captions) => {
    get().updateClip(clipId, { captions })
  },

  // Analysis state
  setIsAnalyzing: (analyzing) => {
    set({ isAnalyzing: analyzing })
  },

  setAnalysisProgress: (progress) => {
    set({ analysisProgress: Math.max(0, Math.min(100, progress)) })
  },

  // Utility functions
  clearAll: () => {
    set({
      clips: [],
      selectedClipId: null,
      timelineClips: [],
      currentTime: 0,
      isPlaying: false,
      isAnalyzing: false,
      analysisProgress: 0
    })
  },

  getTimelineDuration: () => {
    return get().timelineClips.reduce((total, clip) => {
      return total + (clip.trimEnd - clip.trimStart)
    }, 0)
  }
}))

export default useVideoStore
