import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

console.log('Preload script starting...')

// Custom APIs for ClipForge
const clipForgeAPI = {
  // Video processing APIs
  exportVideo: (options: any) => {
    return ipcRenderer.invoke('export-video', options)
  },
  
  exportVideoWithProgress: (options: any) => {
    return ipcRenderer.invoke('export-video-with-progress', options)
  },
  
  getVideoMetadata: (inputPath: string) => {
    return ipcRenderer.invoke('get-video-metadata', inputPath)
  },
  
  // AI feature APIs
  detectScenes: (inputPath: string, threshold?: number) => {
    return ipcRenderer.invoke('detect-scenes', inputPath, threshold)
  },
  
  detectObjects: () => {
    // TODO: Implement object detection (PR #8)
    console.log('Object detection API called')
  },
  
  transcribeAudio: () => {
    // TODO: Implement speech-to-text (PR #9)
    console.log('Speech-to-text API called')
  },
  
  // File handling APIs
  selectVideoFile: () => {
    return ipcRenderer.invoke('select-video-file')
  },
  
  extractAudio: (inputPath: string, outputPath?: string) => {
    return ipcRenderer.invoke('extract-audio', inputPath, outputPath)
  },
  
  hasAudio: (inputPath: string) => {
    return ipcRenderer.invoke('has-audio', inputPath)
  },
  
  // Progress event listeners
  onExportProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('export-progress', callback)
  },
  
  removeExportProgressListener: (callback: (progress: any) => void) => {
    ipcRenderer.removeListener('export-progress', callback)
  },
  
  // File system utilities
  openFileLocation: (filePath: string) => {
    return ipcRenderer.invoke('open-file-location', filePath)
  },
  
  showSaveDialog: (options: any) => {
    return ipcRenderer.invoke('show-save-dialog', options)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
console.log('Preload script running, contextIsolated:', process.contextIsolated)

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('clipForgeAPI', clipForgeAPI)
    console.log('APIs exposed via contextBridge')
  } catch (error) {
    console.error('Error exposing APIs:', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.clipForgeAPI = clipForgeAPI
  console.log('APIs exposed directly to window')
}
