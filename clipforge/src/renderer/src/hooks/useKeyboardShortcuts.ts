import { useEffect } from 'react'
import useVideoStore from '../stores/videoStore'

export function useKeyboardShortcuts() {
  const { 
    selectedClipId, 
    currentTime, 
    setTrimStart, 
    setTrimEnd, 
    resetTrim,
    getSelectedClip 
  } = useVideoStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when a clip is selected and no input is focused
      if (!selectedClipId || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const selectedClip = getSelectedClip()
      if (!selectedClip) return

      switch (event.key.toLowerCase()) {
        case 'i':
          // Set In Point
          event.preventDefault()
          setTrimStart(selectedClipId, currentTime)
          console.log(`Set In Point at ${currentTime}s`)
          break

        case 'o':
          // Set Out Point
          event.preventDefault()
          setTrimEnd(selectedClipId, currentTime)
          console.log(`Set Out Point at ${currentTime}s`)
          break

        case 'r':
          // Reset Trim
          event.preventDefault()
          resetTrim(selectedClipId)
          console.log('Reset trim points')
          break

        case ' ':
          // Play/Pause (only if not in input field)
          event.preventDefault()
          // This would need to be handled by the VideoPlayer component
          break

        default:
          break
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedClipId, currentTime, setTrimStart, setTrimEnd, resetTrim, getSelectedClip])
}
