import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'

// Extract the actual path from ffprobe-static (it exports an object with path property)
const ffprobePath = ffprobeStatic.path

// Set FFmpeg and FFprobe paths
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

export interface SceneChange {
  timestamp: number
  score: number
}

/**
 * Detect scene changes in video using FFmpeg
 */
export async function detectScenes(
  inputPath: string,
  threshold: number = 0.4
): Promise<SceneChange[]> {
  return new Promise((resolve, reject) => {
    const scenes: SceneChange[] = []
    
    ffmpeg(inputPath)
      .outputOptions([
        '-filter:v',
        `select='gt(scene\\,${threshold})',showinfo`,
        '-f', 'null'
      ])
      .output('-')
      .on('stderr', (stderrLine) => {
        // Parse FFmpeg output for scene detection
        // Format: [Parsed_showinfo_0 @ 0x...] n:123 pts:456 pts_time:12.345 score:0.678
        const match = stderrLine.match(/pts_time:([0-9.]+).*score:([0-9.]+)/)
        if (match) {
          const timestamp = parseFloat(match[1])
          const score = parseFloat(match[2])
          scenes.push({ timestamp, score })
        }
      })
      .on('end', () => {
        console.log(`Detected ${scenes.length} scene changes`)
        resolve(scenes)
      })
      .on('error', (err) => {
        console.error('Scene detection failed:', err)
        reject(new Error(`Scene detection failed: ${err.message}`))
      })
      .run()
  })
}

/**
 * Detect scene changes with custom filter
 */
export async function detectScenesAdvanced(
  inputPath: string,
  options: {
    threshold?: number
    minDuration?: number
    maxDuration?: number
  } = {}
): Promise<SceneChange[]> {
  const {
    threshold = 0.3,
    minDuration = 1.0,
    maxDuration = 10.0
  } = options

  return new Promise((resolve, reject) => {
    const scenes: SceneChange[] = []
    
    // More advanced scene detection filter
    const filter = `select='gt(scene\\,${threshold})',showinfo`
    
    ffmpeg(inputPath)
      .outputOptions([
        '-filter:v', filter,
        '-f', 'null'
      ])
      .output('-')
      .on('stderr', (stderrLine) => {
        const match = stderrLine.match(/pts_time:([0-9.]+).*score:([0-9.]+)/)
        if (match) {
          const timestamp = parseFloat(match[1])
          const score = parseFloat(match[2])
          
          // Filter by duration if specified
          if (timestamp >= minDuration && timestamp <= maxDuration) {
            scenes.push({ timestamp, score })
          }
        }
      })
      .on('end', () => {
        console.log(`Detected ${scenes.length} scene changes (filtered)`)
        resolve(scenes)
      })
      .on('error', (err) => {
        console.error('Advanced scene detection failed:', err)
        reject(new Error(`Advanced scene detection failed: ${err.message}`))
      })
      .run()
  })
}

/**
 * Get video frame at specific timestamp
 */
export async function getFrameAtTime(
  inputPath: string,
  timestamp: number,
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(timestamp)
      .frames(1)
      .output(outputPath)
      .on('end', () => {
        console.log(`Frame extracted at ${timestamp}s`)
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('Frame extraction failed:', err)
        reject(new Error(`Frame extraction failed: ${err.message}`))
      })
      .run()
  })
}

/**
 * Split video at scene changes
 */
export async function splitVideoAtScenes(
  inputPath: string,
  scenes: SceneChange[],
  outputDir: string
): Promise<string[]> {
  const outputPaths: string[] = []
  
  for (let i = 0; i < scenes.length; i++) {
    const startTime = i === 0 ? 0 : scenes[i - 1].timestamp
    const endTime = scenes[i].timestamp
    const duration = endTime - startTime
    
    if (duration > 0.5) { // Only split if duration is meaningful
      const outputPath = `${outputDir}/scene_${i + 1}.mp4`
      
      try {
        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .seekInput(startTime)
            .duration(duration)
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', reject)
            .run()
        })
        
        outputPaths.push(outputPath)
      } catch (error) {
        console.error(`Failed to create scene ${i + 1}:`, error)
      }
    }
  }
  
  return outputPaths
}
