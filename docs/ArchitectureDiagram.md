### System Architecture

graph TB
    subgraph "Electron Application"
        subgraph "Main Process (Node.js)"
            Main[main/index.js<br/>Main Process Entry]
            Preload[main/preload.js<br/>Context Bridge]
            
            subgraph "FFmpeg Services"
                ExportService[ffmpeg/export.js<br/>Video Export]
                SceneService[ffmpeg/sceneDetection.js<br/>Scene Analysis]
            end
            
            subgraph "Native APIs"
                FileSystem[File System Access<br/>fs, path modules]
                Dialog[Native Dialogs<br/>electron.dialog]
            end
        end
        
        subgraph "Renderer Process (Browser/React)"
            subgraph "React Application"
                App[App.jsx<br/>Root Component]
                
                subgraph "UI Components"
                    FileImport[FileImport.jsx<br/>Drag & Drop + Picker]
                    VideoPlayer[VideoPlayer.jsx<br/>HTML5 Video Element]
                    Timeline[Timeline.jsx<br/>Timeline Container]
                    TimelineClip[TimelineClip.jsx<br/>Individual Clip Block]
                    TrimControls[TrimControls.jsx<br/>In/Out Points UI]
                    ExportBtn[ExportButton.jsx<br/>Export Trigger]
                    SceneMarkers[SceneMarkers.jsx<br/>FFmpeg Scene Markers]
                    HighlightMarkers[HighlightMarkers.jsx<br/>TF.js Highlights]
                end
                
                subgraph "State Management"
                    Store[store/videoStore.js<br/>Zustand Store]
                end
                
                subgraph "AI/ML Processing"
                    TFLoader[utils/tfModelLoader.js<br/>Load COCO-SSD Model]
                    ObjectDetect[utils/objectDetection.js<br/>Analyze Video Frames]
                end
                
                subgraph "Utilities"
                    TimeUtils[utils/timeUtils.js<br/>Time Formatting]
                    FileUtils[utils/fileUtils.js<br/>File Validation]
                end
            end
        end
    end
    
    subgraph "External Dependencies"
        subgraph "FFmpeg Binary"
            FFmpegBinary[ffmpeg-static<br/>FFmpeg Executable]
        end
        
        subgraph "TensorFlow.js"
            TFJS[@tensorflow/tfjs<br/>Core ML Framework]
            COCOModel[@tensorflow-models/coco-ssd<br/>Pre-trained Object Detection]
        end
        
        subgraph "Node Modules"
            FluentFFmpeg[fluent-ffmpeg<br/>FFmpeg Node.js Wrapper]
            Electron[electron<br/>Desktop Framework]
            React[react + react-dom<br/>UI Framework]
            Zustand[zustand<br/>State Management]
        end
    end
    
    subgraph "File System"
        InputVideos[(User Video Files<br/>MP4, MOV)]
        OutputVideos[(Exported Videos<br/>MP4)]
    end
    
    %% Main Process Connections
    Main -->|Creates| Preload
    Main -->|Uses| FileSystem
    Main -->|Uses| Dialog
    Main -->|IPC Handler| ExportService
    Main -->|IPC Handler| SceneService
    
    ExportService -->|Spawns| FFmpegBinary
    SceneService -->|Spawns| FFmpegBinary
    
    ExportService -->|Wraps| FluentFFmpeg
    SceneService -->|Wraps| FluentFFmpeg
    
    FluentFFmpeg -->|Executes| FFmpegBinary
    
    %% IPC Communication
    Preload -.->|IPC Bridge<br/>contextBridge| App
    
    %% React Component Tree
    App -->|Renders| FileImport
    App -->|Renders| VideoPlayer
    App -->|Renders| Timeline
    App -->|Renders| TrimControls
    App -->|Renders| ExportBtn
    
    Timeline -->|Renders| TimelineClip
    Timeline -->|Renders| SceneMarkers
    Timeline -->|Renders| HighlightMarkers
    
    %% State Management Flow
    FileImport -->|Updates| Store
    VideoPlayer -->|Reads/Updates| Store
    Timeline -->|Reads| Store
    TrimControls -->|Updates| Store
    ExportBtn -->|Reads| Store
    
    Store -->|Notifies| FileImport
    Store -->|Notifies| VideoPlayer
    Store -->|Notifies| Timeline
    Store -->|Notifies| TrimControls
    
    %% AI Processing Flow
    FileImport -->|Triggers| ObjectDetect
    ObjectDetect -->|Loads| TFLoader
    TFLoader -->|Imports| TFJS
    TFLoader -->|Imports| COCOModel
    ObjectDetect -->|Analyzes Frames| VideoPlayer
    ObjectDetect -->|Returns Highlights| Store
    
    %% Scene Detection Flow
    FileImport -.->|IPC: detectScenes| Preload
    Preload -.->|Calls| SceneService
    SceneService -.->|Returns Timestamps| Preload
    Preload -.->|IPC Response| FileImport
    FileImport -->|Stores Scenes| Store
    
    %% Export Flow
    ExportBtn -.->|IPC: exportVideo| Preload
    Preload -.->|Calls| ExportService
    Store -->|Provides Clip Data| ExportBtn
    ExportService -->|Reads| InputVideos
    ExportService -->|Writes| OutputVideos
    ExportService -.->|Progress Events| Preload
    Preload -.->|IPC Events| ExportBtn
    
    %% File System Interactions
    FileImport -->|Uses| FileUtils
    Dialog -->|Selects| InputVideos
    FileSystem -->|Reads| InputVideos
    FileSystem -->|Writes| OutputVideos
    
    %% Video Player Interactions
    VideoPlayer -->|Loads| InputVideos
    VideoPlayer -->|Uses| TimeUtils
    
    %% Utilities
    Timeline -->|Uses| TimeUtils
    TrimControls -->|Uses| TimeUtils
    
    %% Styling
    classDef mainProcess fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    classDef renderer fill:#50C878,stroke:#2D7A4A,stroke-width:2px,color:#fff
    classDef component fill:#9B59B6,stroke:#6C3483,stroke-width:2px,color:#fff
    classDef state fill:#E67E22,stroke:#A04000,stroke-width:2px,color:#fff
    classDef ai fill:#E74C3C,stroke:#922B21,stroke-width:2px,color:#fff
    classDef external fill:#95A5A6,stroke:#5D6D7E,stroke-width:2px,color:#fff
    classDef storage fill:#F39C12,stroke:#935116,stroke-width:2px,color:#fff
    
    class Main,Preload,ExportService,SceneService,FileSystem,Dialog mainProcess
    class App,Timeline,VideoPlayer renderer
    class FileImport,TimelineClip,TrimControls,ExportBtn,SceneMarkers,HighlightMarkers component
    class Store state
    class TFLoader,ObjectDetect,TFJS,COCOModel ai
    class FFmpegBinary,FluentFFmpeg,Electron,React,Zustand external
    class InputVideos,OutputVideos storage
    
### User Workflows
sequenceDiagram
    participant User
    participant UI as React UI Components
    participant Store as Zustand Store
    participant Preload as Preload Script (IPC)
    participant Main as Main Process
    participant FFmpeg as FFmpeg Service
    participant TF as TensorFlow.js
    participant FS as File System
    
    Note over User,FS: 1. VIDEO IMPORT WORKFLOW
    
    User->>UI: Drag & Drop MP4 file
    UI->>UI: Validate file type (FileUtils)
    UI->>Store: addClip(clipData)
    Store-->>UI: State updated
    UI->>UI: Display in media list
    
    Note over UI,TF: 2. AI ANALYSIS (Automatic on Import)
    
    par Scene Detection (FFmpeg)
        UI->>Preload: IPC: detectScenes(videoPath)
        Preload->>Main: Handle detectScenes
        Main->>FFmpeg: analyzeScenes(videoPath)
        FFmpeg->>FS: Read video file
        FFmpeg->>FFmpeg: Run scene filter
        FFmpeg-->>Main: Return timestamps [2.5s, 8.3s, 15.1s]
        Main-->>Preload: IPC Response
        Preload-->>UI: Scene timestamps
        UI->>Store: setSceneMarkers(clipId, scenes)
        Store-->>UI: Update UI with markers
    and Object Detection (TensorFlow)
        UI->>TF: analyzeVideoForPeople(videoElement)
        TF->>TF: Load COCO-SSD model
        loop Every 2 seconds
            TF->>TF: Extract frame to canvas
            TF->>TF: Run object detection
            TF->>TF: Filter for "person" class
        end
        TF-->>UI: Return highlights [{time: 5s, conf: 0.87}]
        UI->>Store: setHighlights(clipId, highlights)
        Store-->>UI: Update UI with highlights
    end
    
    Note over User,Store: 3. TIMELINE EDITING WORKFLOW
    
    User->>UI: Click "Add to Timeline"
    UI->>Store: addToTimeline(clipId)
    Store-->>UI: timelineClips updated
    UI->>UI: Render Timeline component
    
    User->>UI: Click on timeline clip
    UI->>Store: setSelectedClip(clipId)
    Store-->>UI: selectedClip updated
    UI->>UI: Load video in player
    
    Note over User,Store: 4. TRIM WORKFLOW
    
    User->>UI: Play video to 5.2 seconds
    User->>UI: Click "Set In Point"
    UI->>Store: setTrimStart(clipId, 5.2)
    Store-->>UI: Clip trim updated
    UI->>UI: Show trim marker on timeline
    
    User->>UI: Play video to 18.7 seconds
    User->>UI: Click "Set Out Point"
    UI->>Store: setTrimEnd(clipId, 18.7)
    Store-->>UI: Clip trim updated
    UI->>UI: Gray out trimmed regions
    
    Note over User,FS: 5. VIDEO PLAYBACK WORKFLOW
    
    User->>UI: Click Play button
    UI->>UI: videoElement.play()
    
    loop During playback
        UI->>Store: setCurrentTime(videoTime)
        Store-->>UI: Update playhead position
        UI->>UI: Move playhead on timeline
        
        alt Reached trim end point
            UI->>UI: videoElement.pause()
            UI->>UI: Reset to trim start
        end
    end
    
    Note over User,FS: 6. EXPORT WORKFLOW
    
    User->>UI: Click "Export Video"
    UI->>Store: Get clip data (path, trim points)
    UI->>UI: Show "Exporting..." indicator
    
    UI->>Preload: IPC: exportVideo(exportConfig)
    Note over Preload,FFmpeg: exportConfig: {<br/>  inputPath: "video.mp4",<br/>  outputPath: "output.mp4",<br/>  trimStart: 5.2,<br/>  trimEnd: 18.7<br/>}
    
    Preload->>Main: Handle exportVideo
    Main->>FFmpeg: exportVideo(config)
    FFmpeg->>FS: Read input video
    FFmpeg->>FFmpeg: Apply trim (-ss 5.2 -t 13.5)
    FFmpeg->>FFmpeg: Encode to MP4
    FFmpeg->>FS: Write output.mp4
    
    loop Progress updates
        FFmpeg->>Main: Progress event (45%)
        Main->>Preload: IPC: export-progress
        Preload->>UI: Update progress bar
    end
    
    FFmpeg-->>Main: Export complete
    Main-->>Preload: IPC Response: success
    Preload-->>UI: Export finished
    UI->>UI: Show "Export Complete!"
    UI->>UI: Hide progress indicator
    
    Note over User,FS: 7. ERROR HANDLING
    
    alt Invalid video file
        UI->>UI: Validate file extension
        UI-->>User: Show error: "Unsupported format"
    else FFmpeg error
        FFmpeg-->>Main: Error: codec not supported
        Main-->>Preload: IPC Error
        Preload-->>UI: Error message
        UI-->>User: Show error dialog
    else TensorFlow model load fails
        TF-->>UI: Model load error
        UI->>UI: Fallback to FFmpeg only
        UI-->>User: Show warning: "AI highlights unavailable"
    end
    
    Note over User,FS: 8. SCENE MARKER INTERACTION
    
    User->>UI: Click scene marker on timeline
    UI->>Store: Get scene timestamp
    UI->>UI: Seek video to timestamp
    
    User->>UI: Click "Split at Scene"
    UI->>Store: splitClipAt(clipId, timestamp)
    Note over Store: Creates two new clips:<br/>- Clip A: 0s to timestamp<br/>- Clip B: timestamp to end
    Store-->>UI: Timeline updated
    UI->>UI: Render two separate clips
    
    Note over User,FS: 9. STATE PERSISTENCE (Optional)
    
    User->>UI: Edit video for 10 minutes
    loop Every 30 seconds
        Store->>Store: Auto-save state to localStorage
        Note over Store: Save: clips[], timeline,<br/>trim points, preferences
    end
    
    User->>UI: Close and reopen app
    UI->>Store: loadPersistedState()
    Store->>Store: Restore from localStorage
    Store-->>UI: State restored
    UI->>UI: Render previous session