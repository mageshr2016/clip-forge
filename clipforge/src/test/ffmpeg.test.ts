import { describe, it, expect, vi } from 'vitest'

// Mock the FFmpeg modules
vi.mock('fluent-ffmpeg', () => ({
  default: vi.fn(() => ({
    outputOptions: vi.fn().mockReturnThis(),
    output: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    run: vi.fn(),
    seekInput: vi.fn().mockReturnThis(),
    duration: vi.fn().mockReturnThis(),
    frames: vi.fn().mockReturnThis()
  })),
  ffprobe: vi.fn()
}))

vi.mock('ffmpeg-static', () => ({
  default: 'mocked-ffmpeg-path'
}))

describe('FFmpeg Integration', () => {
  it('should have FFmpeg modules available', () => {
    // Test that the modules can be imported without errors
    expect(() => {
      require('../main/ffmpeg/export')
      require('../main/ffmpeg/sceneDetection')
      require('../main/ffmpeg/audioExtraction')
    }).not.toThrow()
  })

  it('should export required functions from export module', async () => {
    const exportModule = await import('../main/ffmpeg/export')
    
    expect(exportModule.exportVideo).toBeDefined()
    expect(exportModule.getVideoMetadata).toBeDefined()
    expect(exportModule.getDefaultOutputPath).toBeDefined()
    expect(typeof exportModule.exportVideo).toBe('function')
    expect(typeof exportModule.getVideoMetadata).toBe('function')
    expect(typeof exportModule.getDefaultOutputPath).toBe('function')
  })

  it('should export required functions from sceneDetection module', async () => {
    const sceneModule = await import('../main/ffmpeg/sceneDetection')
    
    expect(sceneModule.detectScenes).toBeDefined()
    expect(sceneModule.detectScenesAdvanced).toBeDefined()
    expect(sceneModule.getFrameAtTime).toBeDefined()
    expect(sceneModule.splitVideoAtScenes).toBeDefined()
    expect(typeof sceneModule.detectScenes).toBe('function')
  })

  it('should export required functions from audioExtraction module', async () => {
    const audioModule = await import('../main/ffmpeg/audioExtraction')
    
    expect(audioModule.extractAudio).toBeDefined()
    expect(audioModule.extractAudioForSTT).toBeDefined()
    expect(audioModule.getAudioDuration).toBeDefined()
    expect(audioModule.convertAudio).toBeDefined()
    expect(audioModule.hasAudio).toBeDefined()
    expect(typeof audioModule.extractAudio).toBe('function')
  })
})
