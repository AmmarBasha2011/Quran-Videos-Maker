import { useState, useCallback } from 'react';
import { AppState } from '../types';

export const useVideoExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const generateVideo = useCallback(async (
    state: AppState, 
    audioBuffer: AudioBuffer | null,
    onComplete: (url: string) => void
  ) => {
    if (!state.backgroundImage || !audioBuffer) return;

    setIsExporting(true);
    setExportProgress(0);

    // 1. Queue Simulation (as requested)
    // "Server can only process 1 video at same time"
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 100)); // 2s wait
        setExportProgress(prev => Math.min(prev + 1, 20));
    }

    // 2. Setup Canvas
    const canvas = document.createElement('canvas');
    const width = state.resolution === '1080p' ? 1920 : 1280;
    const height = state.resolution === '1080p' ? 1080 : 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // 3. Draw Background
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = state.backgroundImage;
    
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
    });

    // Draw image cover
    const scale = Math.max(width / img.width, height / img.height);
    const x = (width / 2) - (img.width / 2) * scale;
    const y = (height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    // Dark overlay for text readability
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, width, height);

    // 4. Draw Text
    ctx.fillStyle = '#ffffff';
    // Note: In RTL context on canvas, 'start' maps to right, but we calculate explicit X coordinates mostly.
    // However, explicitly setting direction helps with glyph shaping for mixed text.
    ctx.direction = 'rtl'; 
    
    // Surah (Rakkas - Thuluth Style)
    const surahSize = state.resolution === '1080p' ? 120 : 80;
    ctx.font = `bold ${surahSize}px "Rakkas", "Amiri", serif`; 
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 15;
    
    // Position parsing needs to account for RTL logic visually
    // In RTL UI "Left" usually means the "End" of the line, but `state.surahPosition` is string literal 'top-left'.
    // We stick to physical screen position for the canvas drawing to match the string keys.
    const parsePos = (pos: string) => {
        const p = { x: width/2, y: height/2, align: 'center' as CanvasTextAlign };
        if (pos.includes('left')) { p.x = 100; p.align = 'left'; }
        if (pos.includes('right')) { p.x = width - 100; p.align = 'right'; }
        if (pos.includes('top')) { p.y = 150; }
        if (pos.includes('bottom')) { p.y = height - 150; }
        return p;
    };

    const sPos = parsePos(state.surahPosition);
    ctx.textAlign = sPos.align;
    ctx.fillText(state.surahName, sPos.x, sPos.y);

    // Reader (Smaller - Scheherazade New)
    const readerSize = state.resolution === '1080p' ? 60 : 40;
    ctx.font = `${readerSize}px "Scheherazade New", serif`;
    const rPos = parsePos(state.readerPosition);
    ctx.textAlign = rPos.align;
    ctx.fillText(state.readerName, rPos.x, rPos.y);

    // 5. Create Stream
    const canvasStream = canvas.captureStream(2); // 2 FPS as requested

    // 6. Setup Audio Output (with effects applied)
    const offlineCtx = new OfflineAudioContext(2, audioBuffer.length, audioBuffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    
    const reverb = offlineCtx.createConvolver();
    const rate = offlineCtx.sampleRate;
    const length = rate * 2.5;
    const impulse = offlineCtx.createBuffer(2, length, rate);
    for (let i = 0; i < length; i++) {
        impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
    reverb.buffer = impulse;

    const dryGain = offlineCtx.createGain();
    const wetGain = offlineCtx.createGain();
    const masterGain = offlineCtx.createGain();

    const reverbAmt = state.reverbAmount;
    dryGain.gain.value = state.isNormalized ? 0.8 : (1 - reverbAmt * 0.5);
    wetGain.gain.value = reverbAmt * 2.0;

    source.connect(dryGain);
    dryGain.connect(masterGain);
    source.connect(reverb);
    reverb.connect(wetGain);
    wetGain.connect(masterGain);
    masterGain.connect(offlineCtx.destination);
    
    source.start(0);
    const renderedBuffer = await offlineCtx.startRendering();

    // 7. Combine into MediaRecorder
    const audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    const sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = renderedBuffer;
    sourceNode.connect(dest);
    
    const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
    ]);

    const recorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm; codecs=vp9' 
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onComplete(url);
        setIsExporting(false);
        setExportProgress(100);
        audioCtx.close();
        
        // No auto cleanup as requested
    };

    recorder.start();
    sourceNode.start(0);

    // Monitor progress
    const duration = renderedBuffer.duration;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const p = Math.min((elapsed / duration) * 100, 99);
        setExportProgress(20 + (p * 0.8)); // map remaining 80%
        
        if (elapsed >= duration) {
            recorder.stop();
            sourceNode.stop();
            clearInterval(interval);
        }
    }, 500);

  }, []);

  return { isExporting, exportProgress, generateVideo };
};