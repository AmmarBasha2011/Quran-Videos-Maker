import { useState, useCallback } from 'react';
import { AppState, BackgroundAsset, TextStyle } from '../types';
import { RESOLUTION_DIMENSIONS } from '../constants';

export const useVideoExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const generateVideo = useCallback(async (
    state: AppState, 
    audioBuffer: AudioBuffer | null,
    onComplete: (url: string) => void
  ) => {
    // Basic Validation
    if (state.selectedAssets.length === 0) {
        alert("يرجى اختيار وسائط (صور أو فيديو) من مكتبة الخلفيات");
        return;
    }
    if (!audioBuffer) {
        alert("يرجى اختيار ملف صوتي");
        return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // 1. Setup Canvas
    const canvas = document.createElement('canvas');
    const dimensions = RESOLUTION_DIMENSIONS[state.resolution] || RESOLUTION_DIMENSIONS['1080p'];
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d')!;

    // 2. Pre-load Assets (CRITICAL FOR CORS AND BLACK SCREEN FIX)
    const assetMap = new Map<string, HTMLImageElement | HTMLVideoElement>();
    
    try {
        for (const asset of state.selectedAssets) {
            if (asset.type === 'image') {
                const img = new Image();
                img.crossOrigin = "anonymous"; // CRITICAL
                img.src = asset.url;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = () => { console.warn("Failed image", asset.url); resolve(null); }; 
                });
                assetMap.set(asset.id, img);
            } else {
                const vid = document.createElement('video');
                vid.crossOrigin = "anonymous"; // CRITICAL
                vid.src = asset.url;
                vid.muted = true;
                vid.loop = true;
                vid.playsInline = true;
                vid.preload = "auto";
                // Wait for metadata/data to ensure it's ready to draw
                await new Promise((resolve) => {
                    vid.onloadeddata = resolve;
                    vid.onerror = () => { console.warn("Failed video", asset.url); resolve(null); };
                });
                assetMap.set(asset.id, vid);
            }
        }
    } catch (e) {
        console.error("Asset loading error", e);
    }

    setExportProgress(10);

    // 3. Setup Audio Output
    const offlineCtx = new OfflineAudioContext(2, audioBuffer.length, audioBuffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    
    // Reverb Logic
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
    const renderedAudioBuffer = await offlineCtx.startRendering();
    setExportProgress(20);

    // 4. Setup Media Recorder
    const fps = Math.max(1, Math.min(60, state.fps));
    const canvasStream = canvas.captureStream(fps);
    const audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    const sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = renderedAudioBuffer;
    sourceNode.connect(dest);
    
    const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
    ]);

    const recorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: state.resolution === '4K' ? 25000000 : 8000000
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
        // Cleanup
        assetMap.forEach((el) => {
            if (el instanceof HTMLVideoElement) {
                el.pause();
                el.removeAttribute('src');
                el.load();
            }
        });
    };

    // 5. Animation Loop
    const duration = renderedAudioBuffer.duration;
    const totalAssetDuration = state.selectedAssets.reduce((acc, cur) => acc + cur.duration, 0);

    recorder.start();
    sourceNode.start(0);

    const startTime = performance.now();
    let currentVideoElement: HTMLVideoElement | null = null;

    const drawFrame = async () => {
        const currentTime = (performance.now() - startTime) / 1000;
        
        if (currentTime >= duration) {
            recorder.stop();
            sourceNode.stop();
            return;
        }

        // --- Determine Current Asset ---
        const loopTime = totalAssetDuration > 0 ? currentTime % totalAssetDuration : 0;
        
        let foundAsset = state.selectedAssets[0];
        let assetStartTime = 0;
        let accumulator = 0;

        for (const asset of state.selectedAssets) {
            if (loopTime >= accumulator && loopTime < accumulator + asset.duration) {
                foundAsset = asset;
                assetStartTime = accumulator;
                break;
            }
            accumulator += asset.duration;
        }

        const assetElement = assetMap.get(foundAsset.id);
        const assetLocalTime = loopTime - assetStartTime;

        // --- Draw Background ---
        if (assetElement) {
            if (foundAsset.type === 'video' && assetElement instanceof HTMLVideoElement) {
                const vid = assetElement;
                if (currentVideoElement !== vid) {
                     if (currentVideoElement) currentVideoElement.pause();
                     currentVideoElement = vid;
                     // Safe time setting
                     if (Number.isFinite(vid.duration) && vid.duration > 0) {
                        vid.currentTime = assetLocalTime % vid.duration; 
                     } else {
                        vid.currentTime = 0;
                     }
                     try { vid.play(); } catch(e) {}
                }
                
                // Keep syncing roughly to prevent drift, though 'loop' handles most
                // For export, we might need to manually ensure it's playing
                if (vid.paused) vid.play().catch(() => {});

                const vScale = Math.max(canvas.width / vid.videoWidth, canvas.height / vid.videoHeight);
                const vx = (canvas.width / 2) - (vid.videoWidth / 2) * vScale;
                const vy = (canvas.height / 2) - (vid.videoHeight / 2) * vScale;
                ctx.drawImage(vid, vx, vy, vid.videoWidth * vScale, vid.videoHeight * vScale);

            } else if (foundAsset.type === 'image' && assetElement instanceof HTMLImageElement) {
                if (currentVideoElement) {
                    currentVideoElement.pause();
                    currentVideoElement = null;
                }
                
                const img = assetElement;
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;

                // Ken Burns
                const zoom = 1 + (assetLocalTime / foundAsset.duration) * 0.05; 
                ctx.save();
                ctx.translate(canvas.width/2, canvas.height/2);
                ctx.scale(zoom, zoom);
                ctx.translate(-canvas.width/2, -canvas.height/2);
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                ctx.restore();
            }
        } else {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // --- Overlay ---
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- Text Rendering (New Logic) ---
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const drawText = (text: string, xPct: number, yPct: number, style: TextStyle, baseSize: number) => {
            const x = (xPct / 100) * canvas.width;
            const y = (yPct / 100) * canvas.height;
            const finalSize = baseSize * style.fontSizeScale;
            
            ctx.font = `bold ${finalSize}px "${style.font}", "Amiri", sans-serif`;
            ctx.fillStyle = style.color;
            
            if (style.hasShadow) {
                ctx.shadowColor = 'rgba(0,0,0,0.9)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
            } else {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }
            
            ctx.fillText(text, x, y);
            
            // Reset
            ctx.shadowBlur = 0;
        };

        const ratio = canvas.height / 1080;

        drawText(
            state.surahName, 
            state.surahPosition.x, 
            state.surahPosition.y, 
            state.surahStyle,
            120 * ratio
        );

        drawText(
            state.readerName, 
            state.readerPosition.x, 
            state.readerPosition.y, 
            state.readerStyle,
            60 * ratio
        );

        setExportProgress(20 + ((currentTime / duration) * 80));
        requestAnimationFrame(drawFrame);
    };

    requestAnimationFrame(drawFrame);

  }, []);

  return { isExporting, exportProgress, generateVideo };
};