import { app, shell, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { exportVideo, getVideoMetadata } from './ffmpeg/export'
import { detectScenes } from './ffmpeg/sceneDetection'
import { extractAudioForSTT, hasAudio } from './ffmpeg/audioExtraction'

// Declare mainWindow at module level so it's accessible to IPC handlers
let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'ClipForge - Video Editor',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Allow file:// protocol for video loading
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.clipforge.app')

  // Register custom protocol for video files (more secure approach)
  protocol.registerFileProtocol('clipforge-video', (request, callback) => {
    const filePath = request.url.replace('clipforge-video://', '')
    // Validate that the file exists and is a video
    if (filePath && filePath.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
      callback({ path: filePath })
    } else {
      callback({ error: -6 }) // FILE_NOT_FOUND
    }
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers for ClipForge functionality
  ipcMain.on('ping', () => console.log('pong'))
  
  // Video export handlers
  ipcMain.handle('export-video', async (_, options) => {
    try {
      const result = await exportVideo(options)
      return { success: true, outputPath: result }
    } catch (error) {
      console.error('Export error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' }
    }
  })

  // Video metadata handler
  ipcMain.handle('get-video-metadata', async (_, inputPath) => {
    try {
      const metadata = await getVideoMetadata(inputPath)
      return { success: true, metadata }
    } catch (error) {
      console.error('Metadata error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Metadata extraction failed' }
    }
  })

  // Scene detection handler
  ipcMain.handle('detect-scenes', async (_, inputPath, threshold = 0.4) => {
    try {
      const scenes = await detectScenes(inputPath, threshold)
      return { success: true, scenes }
    } catch (error) {
      console.error('Scene detection error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Scene detection failed' }
    }
  })

  // Audio extraction handler
  ipcMain.handle('extract-audio', async (_, inputPath, outputPath) => {
    try {
      const result = await extractAudioForSTT(inputPath, outputPath)
      return { success: true, outputPath: result }
    } catch (error) {
      console.error('Audio extraction error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Audio extraction failed' }
    }
  })

  // Check if video has audio
  ipcMain.handle('has-audio', async (_, inputPath) => {
    try {
      const hasAudioTrack = await hasAudio(inputPath)
      return { success: true, hasAudio: hasAudioTrack }
    } catch (error) {
      console.error('Audio check error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Audio check failed' }
    }
  })

  // File selection handler
  ipcMain.handle('select-video-file', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Video File',
        filters: [
          { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      })
      
      if (!result.canceled && result.filePaths.length > 0) {
        return { success: true, filePath: result.filePaths[0] }
      } else {
        return { success: false, error: 'No file selected' }
      }
    } catch (error) {
      console.error('File selection error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'File selection failed' }
    }
  })

  // Export progress handler
  ipcMain.handle('export-video-with-progress', async (event, options) => {
    try {
      const result = await exportVideo(options, (progress) => {
        // Send progress updates to renderer
        event.sender.send('export-progress', progress)
      })
      return { success: true, outputPath: result }
    } catch (error) {
      console.error('Export with progress error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Export with progress failed' }
    }
  })

  // Open file location handler
  ipcMain.handle('open-file-location', async (_, filePath) => {
    try {
      const { shell } = require('electron')
      await shell.showItemInFolder(filePath)
      return { success: true }
    } catch (error) {
      console.error('Open file location error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Open file location failed' }
    }
  })

  // Show save dialog handler
  ipcMain.handle('show-save-dialog', async (_, options) => {
    try {
      // Try with mainWindow first, then fallback to no window
      let result
      if (mainWindow && !mainWindow.isDestroyed()) {
        result = await dialog.showSaveDialog(mainWindow, options)
      } else {
        result = await dialog.showSaveDialog(options)
      }
      
      return result
    } catch (error) {
      console.error('Save dialog error:', error)
      return { canceled: true, error: error instanceof Error ? error.message : 'Save dialog failed' }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
