import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    clipForgeAPI: {
  exportVideo: (options: any) => Promise<any>
  exportVideoWithProgress: (options: any) => Promise<any>
  getVideoMetadata: (inputPath: string) => Promise<any>
  detectScenes: (inputPath: string, threshold?: number) => Promise<any>
  detectObjects: () => void
  transcribeAudio: () => void
  selectVideoFile: () => Promise<any>
  extractAudio: (inputPath: string, outputPath?: string) => Promise<any>
  hasAudio: (inputPath: string) => Promise<any>
  onExportProgress: (callback: (progress: any) => void) => void
  removeExportProgressListener: (callback: (progress: any) => void) => void
  openFileLocation: (filePath: string) => Promise<any>
  showSaveDialog: (options: any) => Promise<any>
    }
  }
}
