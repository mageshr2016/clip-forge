import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExport } from '../renderer/src/hooks/useExport'

// Mock the window.clipForgeAPI
const mockClipForgeAPI = {
  exportVideo: vi.fn(),
  exportVideoWithProgress: vi.fn(),
  onExportProgress: vi.fn(),
  removeExportProgressListener: vi.fn()
}

Object.defineProperty(window, 'clipForgeAPI', {
  value: mockClipForgeAPI
})

describe('useExport Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useExport())

    expect(result.current.isExporting).toBe(false)
    expect(result.current.progress).toBe(null)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.exportVideo).toBe('function')
    expect(typeof result.current.exportVideoWithProgress).toBe('function')
  })

  it('should handle successful export', async () => {
    const mockResult = { success: true, outputPath: '/path/to/output.mp4' }
    mockClipForgeAPI.exportVideo.mockResolvedValue(mockResult)

    const { result } = renderHook(() => useExport())

    await act(async () => {
      const exportResult = await result.current.exportVideo({
        inputPath: '/path/to/input.mp4',
        outputPath: '/path/to/output.mp4'
      })

      expect(exportResult.success).toBe(true)
      expect(exportResult.outputPath).toBe('/path/to/output.mp4')
    })

    expect(result.current.isExporting).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle export error', async () => {
    const mockError = { success: false, error: 'Export failed' }
    mockClipForgeAPI.exportVideo.mockResolvedValue(mockError)

    const { result } = renderHook(() => useExport())

    await act(async () => {
      const exportResult = await result.current.exportVideo({
        inputPath: '/path/to/input.mp4',
        outputPath: '/path/to/output.mp4'
      })

      expect(exportResult.success).toBe(false)
      expect(exportResult.error).toBe('Export failed')
    })

    expect(result.current.isExporting).toBe(false)
    expect(result.current.error).toBe('Export failed')
  })

  it('should handle export with progress', async () => {
    const mockResult = { success: true, outputPath: '/path/to/output.mp4' }
    mockClipForgeAPI.exportVideoWithProgress.mockResolvedValue(mockResult)

    const { result } = renderHook(() => useExport())

    await act(async () => {
      const exportResult = await result.current.exportVideoWithProgress({
        inputPath: '/path/to/input.mp4',
        outputPath: '/path/to/output.mp4'
      })

      expect(exportResult.success).toBe(true)
      expect(exportResult.outputPath).toBe('/path/to/output.mp4')
    })

    expect(mockClipForgeAPI.onExportProgress).toHaveBeenCalled()
    expect(mockClipForgeAPI.removeExportProgressListener).toHaveBeenCalled()
  })

  it('should clear error when clearError is called', () => {
    const { result } = renderHook(() => useExport())

    // Set an error first
    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBe(null)
  })

  it('should clear progress when clearProgress is called', () => {
    const { result } = renderHook(() => useExport())

    act(() => {
      result.current.clearProgress()
    })

    expect(result.current.progress).toBe(null)
  })
})
