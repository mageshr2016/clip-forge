import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Mock Electron APIs
Object.defineProperty(window, 'electron', {
  value: {
    ipcRenderer: {
      send: vi.fn(),
      invoke: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn()
    }
  }
})

Object.defineProperty(window, 'clipForgeAPI', {
  value: {
    exportVideo: vi.fn(),
    detectScenes: vi.fn(),
    detectObjects: vi.fn(),
    transcribeAudio: vi.fn(),
    selectVideoFile: vi.fn()
  }
})

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  loadLayersModel: vi.fn(),
  ready: vi.fn().mockResolvedValue(true),
  tensor: vi.fn(),
  dispose: vi.fn()
}))

vi.mock('@tensorflow-models/coco-ssd', () => ({
  load: vi.fn().mockResolvedValue({
    detect: vi.fn().mockResolvedValue([])
  })
}))

// Mock FFmpeg
vi.mock('fluent-ffmpeg', () => ({
  default: vi.fn(() => ({
    outputOptions: vi.fn().mockReturnThis(),
    output: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    run: vi.fn()
  }))
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
})
