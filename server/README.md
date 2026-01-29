# Quran Video Generator Backend API

This is the backend service for the Quran Recitation Video Generator. It handles heavy video processing using FFmpeg and Node-Canvas.

## Tech Stack
- **Node.js**: Runtime environment.
- **Express**: Web framework.
- **FFmpeg**: Video/Audio processing engine.
- **Node-Canvas**: Image/Text rendering (server-side implementation of the HTML5 Canvas API).
- **TypeScript**: Type safety.

## Installation

### System Requirements
You must have `ffmpeg` installed on your system.
For Ubuntu/Debian:
```bash
sudo apt update && sudo apt install -y ffmpeg libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
```

### Setup
```bash
npm install
npm run build
npm start
```

## API Endpoints

### `POST /api/generate`
Generates a video based on the provided configuration.

- **Request Type**: `multipart/form-data`
- **Fields**:
  - `audio`: The audio file to be used.
  - `config`: A stringified JSON object matching the `AppState` type (from the frontend).

- **Response**:
  - Returns the generated `.mp4` file.

### `GET /health`
Returns `OK` to indicate the server is running.

## Deployment on Koyeb

This project is Docker-ready. Koyeb will detect the `Dockerfile` in the `server` directory.

### Environment Variables
- `PORT`: (Optional) The port the server will listen on. Defaults to 3000.

## How it works
1. **Asset Preparation**: Downloads background images/videos from URLs provided in the config.
2. **Audio Processing**: Applies normalization, reverb, and echo filters using FFmpeg.
3. **Frame Rendering**: Iterates through each frame, drawing the background, dark overlay, and text (Surah name, Reader name, and Quran verses) using `canvas`.
4. **Encoding**: Pipes the rendered frames and processed audio into FFmpeg to produce the final MP4 file.

## Limitations
- Video background assets are currently used as static images in the frame loop for performance, but the FFmpeg backend can be extended to support full video background seeking.
- Frame-by-frame rendering is CPU-intensive. High-resolution videos (4K/8K) might take significant time and resources.
