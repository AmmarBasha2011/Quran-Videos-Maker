
import { useState, useCallback, useRef } from 'react';
import { AppState, BackgroundAsset, TextStyle, Resolution, VerseTiming } from '../types';
import { getDimensions } from '../constants';
import { prepareReciterAudio } from '../services/audioService';

export const useVideoExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const offlineCtxRef = useRef<OfflineAudioContext | null>(null);

  const generateVideo = useCallback(async (
    state: AppState, 
    uploadAudioBuffer: AudioBuffer | null, 
    forceNoText: boolean = false, 
    onComplete: (url: string, extension: string) => void
  ) => {
    // Validation
    if (state.selectedAssets.length === 0) {
        alert("يرجى اختيار وسائط من مكتبة الخلفيات");
        return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
        // --- 1. Audio Preparation Strategy ---
        let finalAudioBuffer: AudioBuffer | null = null;
        let finalTimings: VerseTiming[] = state.quranConfig.timings;

        if (state.mode === 'upload') {
            if (!uploadAudioBuffer) { alert("يرجى اختيار ملف صوتي"); setIsExporting(false); return; }
            finalAudioBuffer = uploadAudioBuffer;
        } 
        else if (state.mode === 'reciter') {
             if (!state.selectedReciterId) { alert("القارئ غير محدد"); setIsExporting(false); return; }
             
             const texts = state.quranConfig.verses.map(v => v.text);
             const result = await prepareReciterAudio(
                 state.selectedReciterId,
                 state.quranConfig.surahNumber,
                 state.quranConfig.fromAyah,
                 state.quranConfig.toAyah,
                 texts,
                 (msg, pct) => {
                     setExportProgress(pct * 0.4); 
                 }
             );
             finalAudioBuffer = result.masterBuffer;
             finalTimings = result.timings; 
        }

        if (!finalAudioBuffer) throw new Error("Audio Buffer failed");
        
        setExportProgress(40);

        // --- 2. Canvas Setup ---
        const canvas = document.createElement('canvas');
        const dimensions = getDimensions(state.resolution, state.aspectRatio);
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })!; 
        
        // CRITICAL FIX: Paint black immediately so the stream has content
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- 3. Pre-load Assets ---
        const assetMap = new Map<string, HTMLImageElement | HTMLVideoElement>();
        for (const asset of state.selectedAssets) {
            if (asset.type === 'image') {
                const img = new Image();
                img.crossOrigin = "anonymous"; 
                img.src = asset.url;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = () => resolve(null); 
                });
                assetMap.set(asset.id, img);
            } else {
                const vid = document.createElement('video');
                vid.crossOrigin = "anonymous";
                vid.src = asset.url;
                vid.muted = true;
                vid.playsInline = true;
                vid.preload = "auto";
                await new Promise((resolve) => {
                    vid.onloadedmetadata = () => { vid.currentTime = 0; resolve(true); };
                    vid.onerror = () => resolve(null);
                });
                assetMap.set(asset.id, vid);
            }
        }

        setExportProgress(45);

        // --- 4. Offline Audio Rendering (Effects) ---
        const offlineCtx = new OfflineAudioContext(2, finalAudioBuffer.length, finalAudioBuffer.sampleRate);
        offlineCtxRef.current = offlineCtx;

        const source = offlineCtx.createBufferSource();
        source.buffer = finalAudioBuffer;
        
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
        
        setExportProgress(50);

        // --- 5. MediaRecorder Setup ---
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        
        const dest = audioCtx.createMediaStreamDestination();
        const sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = renderedAudioBuffer;
        sourceNode.connect(dest);
        
        const captureFps = Math.min(30, state.fps); 
        const canvasStream = canvas.captureStream(captureFps);
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
        ]);

        // DETECT SUPPORTED MIME TYPE
        // Priority to mp4 (h264), then webm (vp9), then standard webm
        const mimeTypes = [
            'video/mp4', 
            'video/webm; codecs=vp9', 
            'video/webm', 
            'video/webm;codecs=vp8' 
        ];
        let selectedMimeType = 'video/webm';
        for (const t of mimeTypes) {
            if (MediaRecorder.isTypeSupported(t)) { selectedMimeType = t; break; }
        }
        
        // Determine extension based on actual supported mime type, NOT user selection
        // This prevents the "Audio File" issue where a WebM is saved as .mp4
        const finalExtension = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';

        const baseBitrates: Record<Resolution, number> = {
            '360p': 1_500_000, '480p': 2_500_000, '720p': 4_000_000, 
            '1080p': 6_000_000, '2K': 10_000_000, '4K': 20_000_000, '8K': 30_000_000
        };
        const recorder = new MediaRecorder(combinedStream, {
            mimeType: selectedMimeType,
            videoBitsPerSecond: baseBitrates[state.resolution] || 5_000_000
        });
        recorderRef.current = recorder;

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: selectedMimeType });
            const url = URL.createObjectURL(blob);
            
            // Cleanup
            try {
                combinedStream.getTracks().forEach(track => track.stop());
                audioCtx.close();
                assetMap.forEach((el) => {
                    if (el instanceof HTMLVideoElement) { el.pause(); el.removeAttribute('src'); el.load(); }
                });
            } catch (e) {}
            
            setIsExporting(false);
            onComplete(url, finalExtension);
        };

        recorder.start(1000); 
        sourceNode.start(0);

        // --- 6. Animation Loop ---
        const duration = renderedAudioBuffer.duration;
        const totalAssetDuration = Math.max(0.1, state.selectedAssets.reduce((acc, cur) => acc + cur.duration, 0));
        const startTime = performance.now();
        let lastAssetId: string | null = null;
        
        // --- UNIFIED LAYOUT ENGINE (Cached) ---
        const calculateLayout = (context: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number, fontName: string) => {
            context.font = `bold ${fontSize}px ${fontName}`;
            const words = text.split(' ');
            const lines: { words: string[], startIndex: number }[] = [];
            
            let currentLineWords: string[] = [];
            let currentLineWidth = 0;
            let lineStartWordIndex = 0;

            for (const word of words) {
                const wordWidth = context.measureText(word + ' ').width;
                if (currentLineWidth + wordWidth < maxWidth) {
                    currentLineWords.push(word);
                    currentLineWidth += wordWidth;
                } else {
                    lines.push({ words: currentLineWords, startIndex: lineStartWordIndex });
                    lineStartWordIndex += currentLineWords.length;
                    currentLineWords = [word];
                    currentLineWidth = wordWidth;
                }
            }
            if (currentLineWords.length > 0) {
                lines.push({ words: currentLineWords, startIndex: lineStartWordIndex });
            }

            const lineHeight = fontSize * 1.8; 
            const totalHeight = lines.length * lineHeight;
            return { lines, lineHeight, totalHeight };
        };

        const layoutCache = new Map<string, { layout: any, fontSize: number, fontName: string }>();

        const draw = () => {
            const now = performance.now();
            const currentTime = (now - startTime) / 1000;

            const percentComplete = 50 + ((currentTime / duration) * 50);
            setExportProgress(Math.min(99, percentComplete));

            if (currentTime >= duration) {
                 setExportProgress(100);
                 try { sourceNode.stop(); } catch(e) {}
                 if (recorder.state === 'recording') recorder.stop();
                 cancelAnimationFrame(animationFrameRef.current);
                 return;
            }

            // Asset Logic
            const loopTime = currentTime % totalAssetDuration;
            let currentAsset = null;
            let nextAsset = null;
            let accumulator = 0;
            let currentAssetStartTime = 0;

            for (let i = 0; i < state.selectedAssets.length; i++) {
                const asset = state.selectedAssets[i];
                if (loopTime >= accumulator && loopTime < (accumulator + asset.duration)) { 
                    currentAsset = asset;
                    currentAssetStartTime = accumulator;
                    const nextIndex = (i + 1) % state.selectedAssets.length;
                    nextAsset = state.selectedAssets[nextIndex];
                    break;
                }
                accumulator += asset.duration;
            }
            if (!currentAsset) { currentAsset = state.selectedAssets[0]; currentAssetStartTime = 0; }

            if (currentAsset.id !== lastAssetId) {
                if (lastAssetId) {
                    const prev = assetMap.get(lastAssetId);
                    if (prev instanceof HTMLVideoElement) prev.pause();
                }
                const next = assetMap.get(currentAsset.id);
                if (next instanceof HTMLVideoElement) {
                    next.currentTime = 0;
                    next.play().catch(() => {});
                }
                lastAssetId = currentAsset.id;
            }

            // Draw Helper
            const drawAssetToCtx = (asset: BackgroundAsset, opacity: number, localTime: number) => {
                const el = assetMap.get(asset.id);
                if (!el) return;
                ctx.globalAlpha = opacity;
                
                if (asset.type === 'video' && el instanceof HTMLVideoElement) {
                    const vScale = Math.max(canvas.width / el.videoWidth, canvas.height / el.videoHeight);
                    const vx = (canvas.width / 2) - (el.videoWidth / 2) * vScale;
                    const vy = (canvas.height / 2) - (el.videoHeight / 2) * vScale;
                    ctx.drawImage(el, vx, vy, el.videoWidth * vScale, el.videoHeight * vScale);
                } else if (asset.type === 'image' && el instanceof HTMLImageElement) {
                    const zoom = 1 + (localTime / asset.duration) * 0.05; 
                    const scale = Math.max(canvas.width / el.width, canvas.height / el.height);
                    const x = (canvas.width / 2) - (el.width / 2) * scale;
                    const y = (canvas.height / 2) - (el.height / 2) * scale;
                    
                    ctx.save();
                    ctx.translate(canvas.width/2, canvas.height/2);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-canvas.width/2, -canvas.height/2);
                    ctx.drawImage(el, x, y, el.width * scale, el.height * scale);
                    ctx.restore();
                }
                ctx.globalAlpha = 1.0;
            };

            // BG
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const assetLocalTime = loopTime - currentAssetStartTime;
            const timeRemaining = currentAsset.duration - assetLocalTime;
            const transDuration = 1.0;

            drawAssetToCtx(currentAsset, 1.0, assetLocalTime);
            if (state.globalStyle.transitionType === 'fade' && timeRemaining <= transDuration && nextAsset) {
                 const opacity = 1 - (timeRemaining / transDuration);
                 drawAssetToCtx(nextAsset, opacity, 0);
            }

            // Overlay
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // TEXT
            if (!forceNoText) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const minDim = Math.min(canvas.width, canvas.height);
                const scaleFactor = minDim / 1080;

                const drawText = (text: string, xPct: number, yPct: number, style: TextStyle, baseSizeRef: number) => {
                    if (!text) return;
                    const x = (xPct / 100) * canvas.width;
                    const y = (yPct / 100) * canvas.height;
                    const finalSize = baseSizeRef * style.fontSizeScale * scaleFactor;
                    
                    let fontName: string = style.font;
                    if (fontName === 'Amiri Quran') fontName = '"Amiri Quran", serif';
                    else if (fontName === 'Scheherazade New') fontName = '"Scheherazade New", serif';
                    
                    ctx.font = `bold ${finalSize}px ${fontName}, "Amiri", sans-serif`;
                    ctx.fillStyle = style.color;
                    
                    if (style.hasShadow) {
                        ctx.shadowColor = 'rgba(0,0,0,0.9)';
                        ctx.shadowBlur = 4 * scaleFactor;
                        ctx.shadowOffsetX = 2 * scaleFactor;
                        ctx.shadowOffsetY = 2 * scaleFactor;
                    } else {
                        ctx.shadowColor = 'transparent';
                        ctx.shadowBlur = 0;
                    }
                    ctx.fillText(text, x, y);
                    ctx.shadowBlur = 0;
                };

                const qConfig = state.quranConfig;
                if (qConfig.isEnabled && finalTimings.length > 0) {
                    const activeVerse = finalTimings.find(t => currentTime >= t.startTime && currentTime < t.endTime);
                    if (activeVerse) {
                        const style = qConfig.style;
                        const x = (qConfig.position.x / 100) * canvas.width;
                        const y = (qConfig.position.y / 100) * canvas.height;
                        
                        let cachedLayout = layoutCache.get(activeVerse.text);
                        let layout, currentFontSize, fontName;

                        if (cachedLayout) {
                            layout = cachedLayout.layout;
                            currentFontSize = cachedLayout.fontSize;
                            fontName = cachedLayout.fontName;
                        } else {
                            const maxAllowedHeight = canvas.height * 0.65;
                            const maxWidth = canvas.width * 0.85;
                            
                            fontName = style.font;
                            if (fontName === 'Amiri Quran') fontName = '"Amiri Quran", serif';
                            else if (fontName === 'Scheherazade New') fontName = '"Scheherazade New", serif';
                            
                            currentFontSize = 140 * style.fontSizeScale * scaleFactor;
                            
                            let iterations = 0;
                            do {
                                layout = calculateLayout(ctx, activeVerse.text, maxWidth, currentFontSize, fontName);
                                if (layout.totalHeight > maxAllowedHeight && currentFontSize > 20) {
                                    currentFontSize *= 0.90; 
                                } else {
                                    break; 
                                }
                                iterations++;
                            } while (iterations < 15);
                            
                            layoutCache.set(activeVerse.text, { layout, fontSize: currentFontSize, fontName });
                        }

                        const animType = state.globalStyle.textAnimation;
                        const timeSinceStart = currentTime - activeVerse.startTime;
                        const animDuration = 0.6; 
                        const progress = Math.min(1, Math.max(0, timeSinceStart / animDuration));
                        
                        let opacity = 1;
                        let offsetY = 0;
                        let scale = 1;

                        if (animType === 'fade') { opacity = progress; }
                        else if (animType === 'slideUp') { opacity = progress; offsetY = (1 - progress) * (50 * scaleFactor); }
                        else if (animType === 'scale') { opacity = progress; scale = 0.8 + (0.2 * progress); }

                        if (opacity > 0) {
                            ctx.save(); 
                            ctx.globalAlpha = opacity;
                            ctx.translate(x, y + offsetY);
                            ctx.scale(scale, scale);
                            ctx.translate(-x, -(y + offsetY)); 
                            
                            ctx.font = `bold ${currentFontSize}px ${fontName}`;
                            if (style.hasShadow) {
                                ctx.shadowColor = `rgba(0,0,0,${0.9 * opacity})`;
                                ctx.shadowBlur = 4 * scaleFactor;
                                ctx.shadowOffsetX = 2 * scaleFactor;
                                ctx.shadowOffsetY = 2 * scaleFactor;
                            }

                            let startY = y - (layout.totalHeight / 2) + (layout.lineHeight / 2);
                            const minTopY = canvas.height * 0.15;
                            if (startY - (layout.lineHeight/2) < minTopY) {
                                startY = minTopY + (layout.lineHeight/2);
                            }

                            layout.lines.forEach((line) => {
                                const lineText = line.words.join(' ');
                                const lineWidth = ctx.measureText(lineText).width;
                                let cursorX = x + (lineWidth / 2); 

                                line.words.forEach((word, localIndex) => {
                                    const wWidth = ctx.measureText(word + ' ').width;
                                    const actualWordIndex = line.startIndex + localIndex;
                                    
                                    let highlight = qConfig.highlights.find(h => h.verseIndex === activeVerse.verseIndex && h.wordIndex === actualWordIndex);
                                    const cleanWord = word.replace(/[\u064B-\u065F]/g, ''); 
                                    if (!highlight) {
                                        const autoH = state.globalStyle.autoHighlights.find(ah => cleanWord.includes(ah.word) || word.includes(ah.word));
                                        if (autoH) highlight = { verseIndex: -1, wordIndex: -1, color: autoH.color };
                                    }
                                    
                                    ctx.fillStyle = highlight ? highlight.color : style.color;
                                    ctx.textAlign = 'right'; 
                                    ctx.fillText(word + ' ', cursorX, startY);
                                    cursorX -= wWidth;
                                });
                                startY += layout.lineHeight;
                            });
                            ctx.restore(); 
                        }
                    }
                }

                drawText(state.surahName, state.surahPosition.x, state.surahPosition.y, state.surahStyle, 120);
                drawText(state.readerName, state.readerPosition.x, state.readerPosition.y, state.readerStyle, 60);
            }

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);

    } catch (error: any) {
        console.error("Video Generation Error:", error);
        alert("حدث خطأ: " + (error.message || "Unknown error"));
        setIsExporting(false);
    }

  }, []);

  return { isExporting, exportProgress, generateVideo };
};
