# 🎬 ClipForge

A desktop video editor with AI-powered features for scene detection, object detection, and auto-captions.

## ✨ Features

- **🎥 Video Import & Timeline Editing** - Import MP4/MOV files and arrange them on a visual timeline
- **✂️ Trim & Cut Functionality** - Set in/out points to trim unwanted sections
- **🤖 AI Scene Detection** - Automatically detect scene changes using FFmpeg
- **👥 Smart Object Detection** - Detect people and objects using TensorFlow.js
- **🎤 Speech-to-Text Auto-Captions** - Generate captions automatically from audio
- **📤 Export to MP4** - Export your edited videos in high quality

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- FFmpeg (bundled with the app)

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/clipforge/clipforge.git
   cd clipforge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Package the app**
   ```bash
   npm run package
   ```

## 🛠️ Tech Stack

- **Framework:** Electron + React + TypeScript
- **State Management:** Zustand
- **Video Processing:** FFmpeg (fluent-ffmpeg)
- **AI/ML:** TensorFlow.js + COCO-SSD
- **Speech-to-Text:** Web Speech API + Whisper.js
- **Build Tool:** electron-vite
- **Testing:** Vitest + React Testing Library

## 📁 Project Structure

```
clipforge/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── index.ts         # Main process entry point
│   │   └── ffmpeg/          # FFmpeg integration modules
│   ├── preload/             # Preload scripts for IPC
│   │   ├── index.ts         # Context bridge setup
│   │   └── index.d.ts       # Type definitions
│   └── renderer/            # React frontend
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── hooks/       # Custom React hooks
│       │   ├── stores/      # Zustand stores
│       │   └── utils/       # Utility functions
│       └── index.html       # HTML template
├── src/test/                # Test files
├── resources/               # App icons and assets
└── build/                   # Built application
```

## 🧪 Testing

The project uses Vitest for unit testing and React Testing Library for component testing.

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📦 Building & Packaging

### Development Build
```bash
npm run build
```

### Package for Distribution
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# All platforms
npm run package
```

The packaged applications will be available in the `build/` directory.

## 🔧 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## 🎯 AI Features

### Scene Detection
Uses FFmpeg's built-in scene detection algorithm to automatically identify scene changes in video footage.

### Object Detection
Leverages TensorFlow.js with the COCO-SSD model to detect people and objects in video frames.

### Speech-to-Text
Implements both Web Speech API and Whisper.js for automatic audio transcription and caption generation.

## 🚧 Roadmap

- [ ] Multi-track timeline support
- [ ] Advanced transitions and effects
- [ ] Screen recording capabilities
- [ ] Webcam integration
- [ ] Cloud storage integration
- [ ] Advanced export options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Electron](https://electronjs.org/) for the desktop framework
- [React](https://reactjs.org/) for the UI library
- [FFmpeg](https://ffmpeg.org/) for video processing
- [TensorFlow.js](https://www.tensorflow.org/js) for machine learning
- [electron-vite](https://github.com/alex8088/electron-vite) for the build tooling

---

**Built with ❤️ by the ClipForge Team**