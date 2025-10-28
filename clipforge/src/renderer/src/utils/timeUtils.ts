/**
 * Time formatting utilities for video editing
 */

/**
 * Format time in seconds to MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "1:23", "0:05")
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format time in seconds to HH:MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "1:23:45", "0:05:30")
 */
export function formatTimeLong(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
}

/**
 * Format time in seconds to decimal format
 * @param seconds - Time in seconds
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted time string (e.g., "1.5s", "23.7s")
 */
export function formatTimeDecimal(seconds: number, decimals: number = 1): string {
  return `${seconds.toFixed(decimals)}s`
}

/**
 * Parse time string to seconds
 * @param timeString - Time string in MM:SS or HH:MM:SS format
 * @returns Time in seconds
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(Number)
  
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  
  return 0
}

/**
 * Convert frames to time based on frame rate
 * @param frames - Number of frames
 * @param fps - Frames per second
 * @returns Time in seconds
 */
export function framesToTime(frames: number, fps: number): number {
  return frames / fps
}

/**
 * Convert time to frames based on frame rate
 * @param time - Time in seconds
 * @param fps - Frames per second
 * @returns Number of frames
 */
export function timeToFrames(time: number, fps: number): number {
  return Math.floor(time * fps)
}

/**
 * Snap time to frame boundary
 * @param time - Time in seconds
 * @param fps - Frames per second
 * @returns Snapped time in seconds
 */
export function snapToFrame(time: number, fps: number): number {
  return Math.round(time * fps) / fps
}

/**
 * Calculate time difference
 * @param startTime - Start time in seconds
 * @param endTime - End time in seconds
 * @returns Duration in seconds
 */
export function calculateDuration(startTime: number, endTime: number): number {
  return Math.max(0, endTime - startTime)
}

/**
 * Validate time range
 * @param startTime - Start time in seconds
 * @param endTime - End time in seconds
 * @param maxDuration - Maximum duration in seconds
 * @returns True if valid range
 */
export function isValidTimeRange(startTime: number, endTime: number, maxDuration: number): boolean {
  return startTime >= 0 && endTime <= maxDuration && startTime < endTime
}
