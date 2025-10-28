import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../renderer/src/App'

// Mock the window objects
const mockElectronAPI = {
  ipcRenderer: {
    send: vi.fn()
  }
}

const mockClipForgeAPI = {
  exportVideo: vi.fn(),
  detectScenes: vi.fn(),
  detectObjects: vi.fn(),
  transcribeAudio: vi.fn(),
  selectVideoFile: vi.fn()
}

Object.defineProperty(window, 'electron', {
  value: mockElectronAPI
})

Object.defineProperty(window, 'clipForgeAPI', {
  value: mockClipForgeAPI
})

describe('App Component', () => {
  it('renders ClipForge title and subtitle', () => {
    render(<App />)
    
    expect(screen.getByText('🎬 ClipForge')).toBeInTheDocument()
    expect(screen.getByText('AI-Powered Video Editor')).toBeInTheDocument()
  })

  it('renders welcome section', () => {
    render(<App />)
    
    expect(screen.getByText('Welcome to ClipForge')).toBeInTheDocument()
    expect(screen.getByText(/A desktop video editor with AI-powered features/)).toBeInTheDocument()
  })

  it('renders features list', () => {
    render(<App />)
    
    expect(screen.getByText('Coming Soon:')).toBeInTheDocument()
    expect(screen.getByText('🎥 Video Import & Timeline Editing')).toBeInTheDocument()
    expect(screen.getByText('✂️ Trim & Cut Functionality')).toBeInTheDocument()
    expect(screen.getByText('🤖 AI Scene Detection')).toBeInTheDocument()
    expect(screen.getByText('👥 Smart Object Detection')).toBeInTheDocument()
    expect(screen.getByText('🎤 Speech-to-Text Auto-Captions')).toBeInTheDocument()
    expect(screen.getByText('📤 Export to MP4')).toBeInTheDocument()
  })

  it('renders test buttons', () => {
    render(<App />)
    
    expect(screen.getByText('Test IPC Communication')).toBeInTheDocument()
    expect(screen.getByText('Test ClipForge APIs')).toBeInTheDocument()
  })

  it('calls electron IPC when IPC test button is clicked', () => {
    render(<App />)
    
    const ipcButton = screen.getByText('Test IPC Communication')
    fireEvent.click(ipcButton)
    
    expect(mockElectronAPI.ipcRenderer.send).toHaveBeenCalledWith('ping')
  })

  it('calls ClipForge APIs when API test button is clicked', () => {
    render(<App />)
    
    const apiButton = screen.getByText('Test ClipForge APIs')
    fireEvent.click(apiButton)
    
    expect(mockClipForgeAPI.exportVideo).toHaveBeenCalled()
    expect(mockClipForgeAPI.detectScenes).toHaveBeenCalled()
    expect(mockClipForgeAPI.detectObjects).toHaveBeenCalled()
    expect(mockClipForgeAPI.transcribeAudio).toHaveBeenCalled()
    expect(mockClipForgeAPI.selectVideoFile).toHaveBeenCalled()
  })

  it('renders versions component', () => {
    render(<App />)
    
    // The Versions component should be rendered in the footer
    expect(screen.getByText('Press F12 to open DevTools')).toBeInTheDocument()
  })
})
