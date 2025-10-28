# ClipForge - Product Requirements Document (PRD)
## Desktop Video Editor - Complete Requirements

---

## 1. Executive Summary

ClipForge is a desktop video editing application that enables users to import video clips, arrange them on a timeline, perform basic editing operations, and export final videos. The application features AI-powered scene detection, object detection, and speech-to-text auto-captions to streamline the video editing workflow.

**Core Value Proposition:** A streamlined, native desktop video editor focused on the essential workflow: Import → Edit → Export, enhanced with AI capabilities for automatic scene detection, highlight detection, and auto-captioning.

**Tech Stack:** Electron + React + Zustand + FFmpeg + TensorFlow.js + Web Speech API

**Target Platform:** Windows (primary), with potential Mac build

---

## 2. User Stories

### Primary User: Content Creator
- **As a content creator**, I want to import multiple video files into the app so that I can combine them into a single video
- **As a content creator**, I want to see a visual timeline of my clips so that I can understand my video structure
- **As a content creator**, I want to preview my video clips so that I can verify content before editing
- **As a content creator**, I want to trim unwanted sections from clips so that I can remove mistakes or unnecessary content
- **As a content creator**, I want the app to automatically find interesting moments (scene changes, when people appear) so I don't have to scrub through hours of footage
- **As a content creator**, I want automatic speech-to-text captions so that I can quickly add text overlays to my videos
- **As a content creator**, I want to export my edited video as MP4 so that I can share it on social platforms

### Secondary User: Educator/Professional
- **As an educator**, I want to quickly edit screen recordings so that I can create tutorial videos
- **As a professional**, I want a reliable export process so that I don't lose work during rendering
- **As an educator**, I want auto-generated captions so that my tutorial videos are accessible

### Technical User (You - The Developer)
- **As a developer**, I want to validate media handling works correctly so that I can build advanced features later
- **As a developer**, I want to package the app natively so that users can install and run it like professional software

---

## 3. Core Features

### 3.1 Application Launch ✓
- Desktop app launches successfully via double-click
- Built with Electron + React
- Packaged as native executable (not dev mode)
- Target: Windows .exe (Mac optional)

### 3.2 Video Import ✓
- **Drag & drop** video files (MP4, MOV) into app window
- **File picker** button to browse and select videos
- Supported formats: MP4, MOV (minimum)
- Visual confirmation when file is imported

### 3.3 Timeline View ✓
- Simple visual representation of imported clips
- Horizontal timeline layout showing clips in sequence
- Playhead indicator showing current position
- Basic clip representation (thumbnail or colored block with filename)

### 3.4 Video Preview Player ✓
- HTML5 video player displaying selected clip
- Play/Pause controls
- Shows current frame at playhead position
- Audio playback synchronized

### 3.5 Basic Trim Functionality ✓
- Set **in-point** (start trim) on a clip
- Set **out-point** (end trim) on a clip
- Visual markers showing trimmed regions
- Preview updates to show trimmed version

### 3.6 Export to MP4 ✓
- Export button triggers render process
- FFmpeg processes video with trim points applied
- Output saved to user-selected location
- Minimum requirement: Successfully export single trimmed clip
- Basic progress indicator (even just console logs)

### 3.7 Native Packaging ✓
- Electron app packaged with electron-builder
- Executable file (.exe for Windows, .dmg/.app for macOS)
- App can be distributed and run on clean machine

---

## 4. AI Feature Requirements

The project requires meaningful AI integration with **THREE complementary AI features**:

### 4.1 AI Feature #1: Smart Scene Detection (FFmpeg-based)
**Purpose:** Automatically detect when scenes change in video footage

**Technical Implementation:**
- Use FFmpeg's scene detection filter: `select='gt(scene,0.4)'`
- Parse FFmpeg output to extract timestamps of scene changes
- Display orange vertical markers on timeline at detected scenes
- User can click "Split at Scenes" to auto-split clip at all markers
- Or click individual markers to split at specific points

**User Value:**
- Saves time manually finding cut points in long recordings
- Automatically identifies natural breakpoints in footage
- One-click splitting at scene boundaries

**Code Example:**
```javascript
ffmpeg(videoPath)
  .outputOptions([
    '-filter:v', 'select=gt(scene\\,0.4),showinfo',
    '-f', 'null'
  ])
  .on('stderr', (line) => {
    const match = line.match(/pts_time:([0-9.]+)/);
    if (match) scenes.push(parseFloat(match[1]));
  })
```

**Time Estimate:** 2-3 hours

---

### 4.2 AI Feature #2: Smart Highlights (TensorFlow.js Object Detection)
**Purpose:** Detect when people/objects appear in video frames to identify "highlight moments"

**Technical Implementation:**
- Use TensorFlow.js with COCO-SSD pre-trained model
- Extract video frames every 1-2 seconds
- Run object detection to identify: person, face, etc.
- Mark timeline with confidence scores when people detected
- Visual indicators: Green highlights for "person detected" moments
- Bounding boxes preview (stretch goal)

**User Value:**
- Automatically finds moments with people (usually the interesting parts)
- Helps creators quickly jump to action/dialogue scenes
- Similar to CapCut's "smart tracking" feature
- Shows AI/ML capability beyond basic computer vision

**Code Example:**
```javascript
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const model = await cocoSsd.load();
const predictions = await model.detect(videoFrame);

predictions.forEach(prediction => {
  if (prediction.class === 'person' && prediction.score > 0.6) {
    highlights.push({ time, confidence: prediction.score });
  }
});
```

**Time Estimate:** 3-4 hours

---

### 4.3 AI Feature #3: Speech-to-Text Auto-Captions (CapCut-like)
**Purpose:** Transcribe audio and create text overlays automatically

**Technical Implementation:**
- Use Web Speech API or Whisper model for transcription
- Extract audio from video using FFmpeg
- Transcribe to text with timestamps
- Auto-generate caption clips on timeline
- Like CapCut's "auto captions" feature

**User Value:**
- Automatically generates captions for accessibility
- Saves time manually transcribing audio
- Creates professional-looking text overlays
- Improves video engagement and accessibility

**Implementation Options:**
```javascript
// Option 1: Web Speech API (Browser-based)
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

// Option 2: Whisper.js (More accurate)
import { Whisper } from 'whisper.js';
const whisper = new Whisper();
const transcription = await whisper.transcribe(audioBuffer);
```

**Time Estimate:** 4-5 hours

---

### 4.4 AI Features Combined User Experience

**Timeline Display:**
```
[========VIDEO CLIP=================]
    |      |        |      |
   🟠     🟠       🟠     🟠  ← Scene changes (FFmpeg)
    ████    ████    ████      ← Green highlights where people detected (TensorFlow)
    [CAP]  [CAP]   [CAP]      ← Caption overlays (Speech-to-Text)
```

**User Actions:**
1. Import video → All three AI analyses run automatically
2. Timeline shows scene markers, highlight regions, and caption overlays
3. User can:
   - Split at scene changes (FFmpeg markers)
   - Jump to highlights (TensorFlow detections)
   - Edit auto-generated captions
   - See confidence scores on hover

**Why All Three?**
- FFmpeg: Fast, reliable, always works (fallback)
- TensorFlow: Impressive ML, shows technical depth
- Speech-to-Text: Modern accessibility feature, high user value
- Combined: Comprehensive AI feature set that rivals professional tools

---

## 5. Tech Stack - CONFIRMED

### 5.1 Desktop Framework: Electron + React ✅

**Pros:**
- ✅ Mature ecosystem with extensive documentation
- ✅ Strong community support and tutorials
- ✅ React component libraries readily available
- ✅ Faster development velocity (familiar territory)
- ✅ `desktopCapturer` API for future screen recording
- ✅ Easier file system access via Node.js

**Cons:**
- ⚠️ Large bundle size (100-200MB base app)
- ⚠️ Higher memory consumption (~150MB idle)
- ⚠️ Slower startup time (2-4 seconds)

**Verdict:** ✅ **Confirmed** - Speed of development is critical

---

### 5.2 State Management: Zustand ✅

**Why Zustand:**
- ✅ Simpler than Redux (less boilerplate)
- ✅ No Context Provider wrapper needed
- ✅ Better performance than Context API
- ✅ Easier to debug
- ✅ Perfect for medium-complexity apps

**Usage:**
```javascript
import create from 'zustand';

const useStore = create((set) => ({
  clips: [],
  timelineClips: [],
  currentTime: 0,
  addClip: (clip) => set((state) => ({ 
    clips: [...state.clips, clip] 
  })),
}));
```

---

### 5.3 FFmpeg Integration: `fluent-ffmpeg` ✅

**Why fluent-ffmpeg:**
- ✅ Most mature and well-documented
- ✅ Works natively with Electron's Node.js environment
- ✅ Full FFmpeg command access
- ✅ Better performance for encoding/export
- ✅ Used for export, scene detection, and audio extraction

**Installation:**
```bash
npm install fluent-ffmpeg ffmpeg-static
```

**Binary Handling:**
```javascript
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
```

---

### 5.4 AI/ML: TensorFlow.js + COCO-SSD ✅

**Why TensorFlow.js:**
- ✅ Runs in Electron renderer process (browser context)
- ✅ Pre-trained models available (no training needed)
- ✅ COCO-SSD detects 90 object classes including people
- ✅ Real "machine learning" (not just algorithms)

**Installation:**
```bash
npm install @tensorflow/tfjs @tensorflow-models/coco-ssd
```

**Bundle Impact:**
- Adds ~50MB to app size
- Worth it for impressive AI demo

---

### 5.5 Speech-to-Text: Web Speech API + Whisper.js ✅

**Web Speech API:**
- ✅ Native browser support, no dependencies
- ✅ Real-time transcription
- ✅ Good for live captioning

**Whisper.js (Alternative):**
- ✅ More accurate offline transcription
- ✅ Better for pre-recorded audio
- ✅ Handles multiple languages

**Implementation:**
```bash
npm install whisper.js
```

---

### 5.6 Timeline UI: DOM-Based with React ✅

**Approach:**
- ✅ DOM-based using React components
- ✅ CSS Grid for track layout
- ✅ HTML5 drag-and-drop for interactions
- ✅ Faster to implement than Canvas
- ⚠️ May lag with 20+ clips (acceptable for MVP)

**Libraries:**
- React built-in drag-and-drop (HTML5 API)
- No additional dependencies needed for MVP

---

### 5.7 Video Player: HTML5 `<video>` Element ✅

**Why HTML5:**
- ✅ Native browser support, no dependencies
- ✅ Built-in controls available
- ✅ Seek, play, pause work out of box
- ✅ Lightweight and fast
- ✅ Easy to control via React refs

---

### 5.8 Build Tool: electron-vite ✅

**Why electron-vite:**
- ✅ Modern, fast HMR (hot reload)
- ✅ React already configured
- ✅ Clean project structure
- ✅ electron-builder integration ready

---

## 6. Out of Scope for MVP

The following features are **explicitly NOT required** for the initial MVP:

### Recording Features (Save for Full Submission)
- ❌ Screen recording
- ❌ Webcam capture
- ❌ Simultaneous screen + webcam
- ❌ Audio recording from microphone

### Advanced Editing
- ❌ Multiple timeline tracks (only single track for MVP)
- ❌ Clip splitting at playhead (only trim for MVP)
- ❌ Transitions between clips
- ❌ Text overlays (except auto-captions)
- ❌ Audio controls (volume, fade)
- ❌ Filters and effects

### Advanced Timeline Features
- ❌ Zoom in/out on timeline
- ❌ Snap-to-grid functionality
- ❌ Multiple clip selection
- ❌ Copy/paste clips
- ❌ Drag-to-reorder clips (static sequence for MVP)

### Export Options
- ❌ Multiple resolution options (720p, 1080p)
- ❌ Detailed progress bar (basic indicator OK)
- ❌ Cloud upload integration
- ❌ Platform-specific presets

### UI/UX Polish
- ❌ Keyboard shortcuts (nice-to-have, not required)
- ❌ Undo/redo
- ❌ Auto-save
- ❌ Thumbnail previews of clips (basic representation OK)
- ❌ Media library panel (simple list OK)

---

## 7. Technical Pitfalls & Risks

### 7.1 Critical Risks ⚠️

**1. FFmpeg Binary Bundling**
- **Risk:** App crashes because FFmpeg binary not found in production build
- **Mitigation:** 
  - Use `ffmpeg-static` package (bundles binary automatically)
  - Test packaged app early
  - Verify FFmpeg path resolution in production
- **Test:** Run `npm run build` and verify FFmpeg works in built app

**2. TensorFlow.js Model Loading**
- **Risk:** COCO-SSD model fails to load in Electron (CORS/path issues)
- **Mitigation:**
  - Test model loading in Electron early
  - Use local model files if CDN doesn't work
  - Have FFmpeg scene detection as fallback (always works)
- **Fallback:** If TensorFlow fails, FFmpeg scene detection alone satisfies AI requirement

**3. Speech-to-Text API Limitations**
- **Risk:** Web Speech API may not work in Electron or have accuracy issues
- **Mitigation:**
  - Test Web Speech API in Electron early
  - Implement Whisper.js as fallback
  - Show user-friendly error if both fail
- **Fallback:** Manual caption input if auto-transcription fails

**4. Video Codec Compatibility**
- **Risk:** Some MP4 files won't play due to codec issues (H.265, VP9)
- **Mitigation:** 
  - Test with multiple video sources
  - Add codec validation on import
  - Show user-friendly error for unsupported formats
- **Acceptable:** Document supported codecs (H.264 only for MVP)

**5. File Path Handling (Windows)**
- **Risk:** Backslash vs forward slash path issues
- **Mitigation:** 
  - Use Node.js `path` module consistently
  - Never hardcode paths
  - Test with spaces in filenames
- **Code:** Always use `path.join()` and `path.resolve()`

**6. Memory Leaks with Video Elements**
- **Risk:** Creating multiple `<video>` elements without cleanup causes memory bloat
- **Mitigation:** 
  - Use single video element, swap `src` attribute
  - Call `video.load()` to clear previous video
  - Remove event listeners on component unmount
- **Test:** Load 10+ videos in succession, monitor memory usage

**7. Timeline State Management**
- **Risk:** Clips get out of sync between timeline and preview
- **Mitigation:** 
  - Single source of truth in Zustand store
  - Immutable state updates
  - Derive all UI from store state

---

## 8. Success Criteria

Your MVP **MUST** demonstrate all of these:

### Functional Requirements:
1. ✅ **Launch:** App launches by double-clicking .exe file
2. ✅ **Import:** Import MP4/MOV file via drag-drop OR file picker
3. ✅ **Timeline:** Timeline shows imported clip visually (block/thumbnail)
4. ✅ **Preview:** Video player shows clip and can play it with audio
5. ✅ **Trim:** User can set trim in/out points on clip
6. ✅ **Export:** Export button creates new MP4 file with trim applied
7. ✅ **AI #1:** Scene detection shows markers on timeline
8. ✅ **AI #2:** Object detection highlights moments with people
9. ✅ **AI #3:** Speech-to-text generates captions automatically
10. ✅ **Package:** Distributed as native Windows .exe

### Quality Requirements:
- ✅ No crashes during normal workflow
- ✅ Export produces valid, playable MP4 file
- ✅ AI features run without blocking UI (show progress)
- ✅ Basic error handling (invalid files, export failures)

**Binary Test:** 
> "Can someone download your .exe, install it, import a video, trim it, see AI analysis, generate captions, and export — all without touching code or seeing errors?"

---

## 9. Deliverables Checklist

### Code Repository:
- [ ] GitHub repository with all source code
- [ ] Clean commit history with descriptive messages
- [ ] All PRs merged to main branch
- [ ] .gitignore properly configured

### Documentation:
- [ ] README.md with:
  - [ ] Project description
  - [ ] Installation instructions
  - [ ] How to run in dev mode
  - [ ] How to build/package
  - [ ] Features list with AI descriptions
  - [ ] Screenshots of app in action
  - [ ] Known limitations

### Packaged Application:
- [ ] Windows .exe uploaded to GitHub Releases or Google Drive
- [ ] Download link included in README
- [ ] Build instructions for building from source

### Demo (Optional but Recommended):
- [ ] 3-5 minute video showing:
  - [ ] Import workflow
  - [ ] Trim functionality
  - [ ] AI scene detection in action
  - [ ] AI object detection/highlights
  - [ ] Speech-to-text caption generation
  - [ ] Export process

---

## 10. AI Feature Implementation Details

### Scene Detection Implementation

**File:** `electron/ffmpeg/sceneDetection.js`

```javascript
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

function detectScenes(videoPath, threshold = 0.4) {
  return new Promise((resolve, reject) => {
    const scenes = [];
    
    ffmpeg(videoPath)
      .outputOptions([
        '-filter:v',
        `select='gt(scene\\,${threshold})',showinfo`,
        '-f', 'null'
      ])
      .output('-')
      .on('stderr', (stderrLine) => {
        // Parse: pts_time:12.345
        const match = stderrLine.match(/pts_time:([0-9.]+)/);
        if (match) {
          const timestamp = parseFloat(match[1]);
          scenes.push(timestamp);
        }
      })
      .on('end', () => {
        console.log(`Detected ${scenes.length} scenes`);
        resolve(scenes);
      })
      .on('error', (err) => {
        console.error('Scene detection error:', err);
        reject(err);
      })
      .run();
  });
}

module.exports = { detectScenes };
```

**IPC Exposure:** `window.electronAPI.detectScenes(videoPath)`

---

### Object Detection Implementation

**File:** `src/utils/objectDetection.js`

```javascript
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

let model = null;

export async function loadModel() {
  if (!model) {
    model = await cocoSsd.load();
    console.log('COCO-SSD model loaded');
  }
  return model;
}

export async function analyzeVideoForPeople(videoElement, interval = 2) {
  const model = await loadModel();
  const highlights = [];
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const duration = videoElement.duration;
  const frameCount = Math.floor(duration / interval);
  
  for (let i = 0; i < frameCount; i++) {
    const time = i * interval;
    
    // Seek to timestamp
    videoElement.currentTime = time;
    await new Promise(resolve => {
      videoElement.onseeked = resolve;
    });
    
    // Draw frame to canvas
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0);
    
    // Run detection
    const predictions = await model.detect(canvas);
    
    // Filter for people
    const people = predictions.filter(p => 
      p.class === 'person' && p.score > 0.6
    );
    
    if (people.length > 0) {
      highlights.push({
        time,
        count: people.length,
        confidence: Math.max(...people.map(p => p.score))
      });
    }
  }
  
  return highlights;
}
```

---

### Speech-to-Text Implementation

**File:** `src/utils/speechToText.js`

```javascript
// Option 1: Web Speech API
export function startTranscription(onResult, onError) {
  if (!('webkitSpeechRecognition' in window)) {
    throw new Error('Speech recognition not supported');
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const results = Array.from(event.results);
    const transcript = results
      .map(result => result[0].transcript)
      .join('');
    
    onResult({
      transcript,
      confidence: results[results.length - 1][0].confidence,
      isFinal: results[results.length - 1].isFinal
    });
  };

  recognition.onerror = onError;
  recognition.start();
  
  return recognition;
}

// Option 2: Whisper.js (for pre-recorded audio)
export async function transcribeAudioFile(audioBuffer) {
  const { Whisper } = await import('whisper.js');
  const whisper = new Whisper();
  
  const result = await whisper.transcribe(audioBuffer, {
    language: 'en',
    task: 'transcribe'
  });
  
  return result;
}
```

---

## 11. Final Recommendations

### DO These Things:
✅ Test packaging early
✅ Use `fluent-ffmpeg` with `ffmpeg-static`
✅ Implement FFmpeg scene detection first (reliable fallback)
✅ Add TensorFlow only after FFmpeg works
✅ Implement Speech-to-Text with fallback options
✅ Keep MVP scope minimal - resist feature creep
✅ Commit and push code every 2-3 hours
✅ Test export pipeline early
✅ Use simple DOM-based timeline
✅ Focus on "it works" over "it's pretty"
✅ Sample video frames (don't analyze every frame)
✅ Show progress indicators for AI processing

### DON'T Do These Things:
❌ Don't build recording features for MVP
❌ Don't try Canvas timeline until after MVP
❌ Don't add transitions/effects for MVP
❌ Don't wait until last minute to package
❌ Don't analyze every video frame (too slow)
❌ Don't block UI during AI processing
❌ Don't skip error handling
❌ Don't try to make it perfect - make it work

---

**Remember:** A simple, working video editor with three AI features beats a feature-rich app that crashes. Ship the MVP, then iterate.

Good luck! 🚀