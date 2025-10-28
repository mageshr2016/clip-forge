# 🎬 ClipForge - AI-Powered Video Editor

A modern desktop video editing application built with Electron, React, and TypeScript, featuring AI-powered capabilities for scene detection, object detection, and auto-captions.

## ✨ Features

### 🎥 Core Video Editing
- **Video Import & Management** - Import MP4, MOV, AVI, MKV, WebM files
- **Timeline Editing** - Drag & drop video clips on timeline
- **Trim & Cut** - Precise video trimming and cutting tools
- **Export Pipeline** - Export to MP4 with customizable quality settings

### 🤖 AI-Powered Features
- **Smart Scene Detection** - Automatically detect scene changes using FFmpeg
- **Object Detection** - Identify and highlight objects using TensorFlow.js + COCO-SSD
- **Speech-to-Text Auto-Captions** - Generate captions automatically with timestamps
- **Smart Highlights** - AI-powered highlight detection

### 🎨 Modern UI
- **Navigation-Based Layout** - Clean sidebar navigation with main video player
- **Responsive Design** - Works on different screen sizes
- **Real-time Preview** - Live video playback with custom controls
- **Progress Tracking** - Real-time export progress with detailed feedback

## 🛠️ Tech Stack

### Frontend
- **Electron** - Desktop application framework
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Zustand** - Lightweight state management
- **Vite** - Fast build tool and dev server

### Video Processing
- **FFmpeg** - Video processing and export
- **ffmpeg-static** - Pre-built FFmpeg binaries
- **ffprobe-static** - Video metadata extraction

### AI & Machine Learning
- **TensorFlow.js** - Client-side ML inference
- **COCO-SSD** - Object detection model
- **Web Speech API** - Speech-to-text transcription

### Development Tools
- **Vitest** - Unit testing framework
- **@testing-library/react** - React component testing
- **electron-vite** - Electron + Vite integration
- **electron-builder** - Application packaging

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clip-forge.git
   cd clip-forge
   ```

2. **Install dependencies**
   ```bash
   cd clipforge
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run package
   ```

## 📖 Usage

### Quick Start
1. **Import** - Drag & drop or click "Import Video" to add files
2. **Select** - Click on a video in the sidebar to load it
3. **Trim** - Press **I** to set start, **O** to set end point
4. **Export** - Click "Export Video" to save your trimmed video

### Importing Videos
1. Click the **"Import Video"** button in the left sidebar
2. Select your video file (MP4, MOV, AVI, MKV, WebM)
3. The video will appear in the "Imported Videos" list
4. Click on a video to load it in the main player

### Video Editing
1. **Playback Controls** - Use the play/pause button and timeline scrubber
2. **Trim Video** - Select start and end points for trimming (or use **I**/**O** keys)
3. **AI Features** - Use the tools in the sidebar for scene detection and object detection
4. **Export** - Click the export button to save your edited video

### Debug Tools
- **Test IPC** - Test communication between main and renderer processes
- **Test APIs** - Test all ClipForge video processing APIs
- **Debug** - Check API availability and system status

### Keyboard Shortcuts

#### Video Editing
- **I** - Set In Point at current playback time
- **O** - Set Out Point at current playback time
- **R** - Reset trim points to full video duration
- **Space** - Play/Pause video (when video player is focused)

#### General
- **F12** - Open/Close Developer Tools
- **Ctrl+O** - Open video file (via file picker)
- **Ctrl+E** - Export current video

> **Note:** Keyboard shortcuts only work when a video clip is selected and no input fields are focused.

## 🏗️ Project Structure

```
clipforge/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── ffmpeg/          # Video processing modules
│   │   └── index.ts         # Main process entry point
│   ├── preload/             # Preload scripts
│   │   └── index.ts         # API exposure
│   ├── renderer/            # React renderer process
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── stores/      # Zustand state management
│   │   │   └── utils/       # Utility functions
│   │   └── index.html       # HTML template
│   └── test/                # Test files
├── docs/                    # Documentation
├── resources/               # App icons and assets
└── package.json
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📦 Building & Packaging

```bash
# Build for development
npm run build

# Package for current platform
npm run package

# Package for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run package` - Package application

### Key Features Implemented
- ✅ **PR #1**: Project Setup & Initialization
- ✅ **PR #2**: FFmpeg Integration & Export Pipeline
- ✅ **PR #3**: Video Import & File Handling
- 🚧 **PR #4**: Timeline UI (In Progress)
- ⏳ **PR #5-11**: AI Features & Advanced Editing

## 🐛 Troubleshooting

### Video Not Loading
- Ensure the video file path is correct
- Check that the file format is supported (MP4, MOV, AVI, MKV, WebM)
- Verify file permissions

### Export Issues
- Check that FFmpeg is properly installed
- Ensure sufficient disk space for output file
- Verify input video file is not corrupted

### Keyboard Shortcuts Not Working
- Make sure a video clip is selected in the sidebar
- Ensure no input fields or text areas are focused
- Try clicking on the video player area first

### Debug Information
- Press `F12` to open DevTools
- Check console for error messages
- Use the Debug tools in the sidebar
- Check the Help section for keyboard shortcuts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Electron](https://electronjs.org/) - Desktop app framework
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning
- [React](https://reactjs.org/) - UI library
- [Zustand](https://github.com/pmndrs/zustand) - State management

---

**ClipForge** - Making video editing accessible with AI power! 🎬✨