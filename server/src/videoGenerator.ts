import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { createCanvas, registerFont, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';
import { PassThrough } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get dimensions
const getDimensions = (resolution: string, aspectRatio: string) => {
  let width = 1920;
  let height = 1080;

  switch (resolution) {
    case '360p': width = 640; height = 360; break;
    case '480p': width = 854; height = 480; break;
    case '720p': width = 1280; height = 720; break;
    case '1080p': width = 1920; height = 1080; break;
    case '2K': width = 2560; height = 1440; break;
    case '4K': width = 3840; height = 2160; break;
    case '8K': width = 7680; height = 4320; break;
  }

  if (aspectRatio === '9:16') {
    [width, height] = [height, width];
  } else if (aspectRatio === '1:1') {
    height = width;
  } else if (aspectRatio === '4:5') {
    height = width * 1.25;
  }

  return { width: Math.round(width), height: Math.round(height) };
};

// Register font
const fontsDir = path.join(__dirname, '../fonts');
if (!fs.existsSync(fontsDir)) fs.mkdirSync(fontsDir, { recursive: true });
const fontPath = path.join(fontsDir, 'Amiri-Regular.ttf');

export async function generateVideo(
  audioPath: string,
  state: any,
  onProgress?: (percent: number) => void
): Promise<string> {
  const dimensions = getDimensions(state.resolution, state.aspectRatio);
  const outputDir = path.join(__dirname, '../temp/output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${Date.now()}-output.mp4`);

  // Ensure font exists
  if (!fs.existsSync(fontPath)) {
    console.log('Downloading Amiri font...');
    try {
      const fontResponse = await axios.get('https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf', { responseType: 'arraybuffer' });
      fs.writeFileSync(fontPath, fontResponse.data);
    } catch (e) {
      console.error('Failed to download font');
    }
  }
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'Amiri' });
  }

  // 1. Prepare Background Assets
  const assetsDir = path.join(__dirname, '../temp/assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  const assetMap = new Map<string, any>();
  for (const asset of state.selectedAssets) {
    const assetPath = path.join(assetsDir, `${asset.id}-${path.basename(asset.url.split('?')[0])}`);
    if (!fs.existsSync(assetPath)) {
      try {
        const response = await axios.get(asset.url, { responseType: 'arraybuffer' });
        fs.writeFileSync(assetPath, response.data);
      } catch (e) {
        continue;
      }
    }

    if (asset.type === 'image') {
      assetMap.set(asset.id, await loadImage(assetPath));
    } else {
      const thumbPath = `${assetPath}.jpg`;
      if (!fs.existsSync(thumbPath)) {
        await new Promise((resolve, reject) => {
          ffmpeg(assetPath)
            .screenshots({
              timestamps: [0],
              filename: path.basename(thumbPath),
              folder: path.dirname(thumbPath),
              size: `${dimensions.width}x${dimensions.height}`
            })
            .on('end', resolve)
            .on('error', reject);
        });
      }
      assetMap.set(asset.id, await loadImage(thumbPath));
    }
  }

  // 2. Get Audio Duration
  const audioDuration = await new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata?.format?.duration || 0);
    });
  });

  const fps = Math.min(state.fps || 30, 120);
  const totalFrames = Math.ceil(audioDuration * fps);

  const canvas = createCanvas(dimensions.width, dimensions.height);
  const ctx = canvas.getContext('2d');
  const inputStream = new PassThrough();

  return new Promise((resolve, reject) => {
    let audioFilters = [];
    if (state.isNormalized) audioFilters.push('loudnorm');
    if (state.reverbAmount > 0) {
      const delay = 50 + (state.reverbAmount * 100);
      const decay = 0.3 + (state.reverbAmount * 0.4);
      audioFilters.push(`aecho=0.8:0.88:${delay}:${decay}`);
    }
    if (state.echoAmount > 0) {
      const delay = 200 + (state.echoAmount * 300);
      const decay = 0.2 + (state.echoAmount * 0.3);
      audioFilters.push(`aecho=0.8:0.9:${delay}:${decay}`);
    }

    const command = ffmpeg()
      .input(inputStream)
      .inputFormat('image2pipe')
      .inputFPS(fps)
      .input(audioPath)
      .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-preset ultrafast',
        '-crf 18',
        '-c:a aac',
        '-shortest',
        '-movflags +faststart'
      ]);

    if (audioFilters.length > 0) {
      command.audioFilters(audioFilters);
    }

    command
      .on('start', (cmd) => console.log('FFmpeg started:', cmd))
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .on('end', () => {
        console.log('FFmpeg finished');
        resolve(outputPath);
      })
      .save(outputPath);

    const totalAssetDuration = Math.max(0.1, state.selectedAssets.reduce((acc: number, cur: any) => acc + cur.duration, 0));

    const drawText = (text: string, xPct: number, yPct: number, style: any, baseSizeRef: number, scaleFactor: number) => {
      if (!text) return;
      const x = (xPct / 100) * dimensions.width;
      const y = (yPct / 100) * dimensions.height;
      const finalSize = baseSizeRef * style.fontSizeScale * scaleFactor;

      ctx.font = `bold ${finalSize}px Amiri`;
      ctx.fillStyle = style.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';

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

    const drawAssetToCtx = (assetId: string, assetType: string, assetDuration: number, localTime: number, opacity: number) => {
      const el = assetMap.get(assetId);
      if (!el) return;

      ctx.globalAlpha = opacity;

      const scale = Math.max(dimensions.width / el.width, dimensions.height / el.height);
      const x = (dimensions.width / 2) - (el.width / 2) * scale;
      const y = (dimensions.height / 2) - (el.height / 2) * scale;

      // Apply Ken Burns effect to all static backgrounds (including video thumbs)
      const zoom = 1 + (localTime / assetDuration) * 0.05;
      ctx.save();
      ctx.translate(dimensions.width / 2, dimensions.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-dimensions.width / 2, -dimensions.height / 2);
      ctx.drawImage(el, x, y, el.width * scale, el.height * scale);
      ctx.restore();
      ctx.globalAlpha = 1.0;
    };

    const renderFrames = async () => {
      const minDim = Math.min(dimensions.width, dimensions.height);
      const scaleFactor = minDim / 1080;

      for (let frame = 0; frame < totalFrames; frame++) {
        const currentTime = frame / fps;
        const loopTime = currentTime % totalAssetDuration;

        // Background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        // Asset Selection & Crossfade
        let accumulator = 0;
        let currentAsset = state.selectedAssets[0];
        let nextAsset = null;
        let currentAssetStartTime = 0;

        for (let i = 0; i < state.selectedAssets.length; i++) {
          const asset = state.selectedAssets[i];
          if (loopTime >= accumulator && loopTime < (accumulator + asset.duration)) {
            currentAsset = asset;
            currentAssetStartTime = accumulator;
            nextAsset = state.selectedAssets[(i + 1) % state.selectedAssets.length];
            break;
          }
          accumulator += asset.duration;
        }

        const assetLocalTime = loopTime - currentAssetStartTime;
        const timeRemainingInAsset = currentAsset.duration - assetLocalTime;
        const transDuration = 1.0;

        drawAssetToCtx(currentAsset.id, currentAsset.type, currentAsset.duration, assetLocalTime, 1.0);

        if (state.globalStyle.transitionType === 'fade' && timeRemainingInAsset <= transDuration && nextAsset) {
          const opacity = 1 - (timeRemainingInAsset / transDuration);
          drawAssetToCtx(nextAsset.id, nextAsset.type, nextAsset.duration, 0, opacity);
        }

        // Dark Overlay
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        if (!state.forceNoText) {
          // Titles
          drawText(state.surahName, state.surahPosition.x, state.surahPosition.y, state.surahStyle, 120, scaleFactor);
          drawText(state.readerName, state.readerPosition.x, state.readerPosition.y, state.readerStyle, 60, scaleFactor);

          // Quran Verses with Word Wrapping & Animations
          const qConfig = state.quranConfig;
          if (qConfig.isEnabled && qConfig.timings && qConfig.timings.length > 0) {
            // Find all active verses (usually just one, but handle multiple if they overlap)
            const activeVerses = qConfig.timings.filter((t: any) => currentTime >= t.startTime && currentTime < t.endTime);

            activeVerses.forEach((activeVerse: any) => {
                    const style = qConfig.style;
                    const x = (qConfig.position.x / 100) * dimensions.width;
                    const y = (qConfig.position.y / 100) * dimensions.height;
                    const fontSize = 140 * style.fontSizeScale * scaleFactor;

                    const animType = state.globalStyle.textAnimation;
                    const timeSinceStart = currentTime - activeVerse.startTime;
                    const timeUntilEnd = activeVerse.endTime - currentTime;
                    const animDuration = 0.6;

                    let opacity = 1.0;
                    if (animType === 'fade') {
                        if (timeSinceStart < animDuration) opacity = timeSinceStart / animDuration;
                        else if (timeUntilEnd < animDuration) opacity = timeUntilEnd / animDuration;
                    } else if (animType === 'slideUp') {
                        if (timeSinceStart < animDuration) opacity = timeSinceStart / animDuration;
                        else if (timeUntilEnd < animDuration) opacity = timeUntilEnd / animDuration;
                    }

                    if (opacity > 0) {
                        ctx.save();
                        ctx.globalAlpha = opacity;

                        ctx.font = `bold ${fontSize}px Amiri`;
                        ctx.direction = 'rtl';
                        if (style.hasShadow) {
                            ctx.shadowColor = 'rgba(0,0,0,0.9)';
                            ctx.shadowBlur = 4 * scaleFactor;
                            ctx.shadowOffsetX = 2 * scaleFactor;
                            ctx.shadowOffsetY = 2 * scaleFactor;
                        }

                        const words = activeVerse.text.split(' ');
                        const maxWidth = dimensions.width * 0.8;
                        const lines: any[] = [];
                        let currentLineWords: string[] = [];
                        let currentLineWidth = 0;
                        let lineStartWordIndex = 0;

                        for (const word of words) {
                            const wordWidth = ctx.measureText(word + ' ').width;
                            if (currentLineWidth + wordWidth < maxWidth) {
                                currentLineWords.push(word);
                                currentLineWidth += wordWidth;
                            } else {
                                lines.push({ text: currentLineWords.join(' '), words: currentLineWords, startIndex: lineStartWordIndex });
                                lineStartWordIndex += currentLineWords.length;
                                currentLineWords = [word];
                                currentLineWidth = wordWidth;
                            }
                        }
                        if (currentLineWords.length > 0) {
                            lines.push({ text: currentLineWords.join(' '), words: currentLineWords, startIndex: lineStartWordIndex });
                        }

                        const lineHeight = fontSize * 1.6;
                        const totalHeight = lines.length * lineHeight;
                        let startY = y - (totalHeight / 2) + (lineHeight / 2);

                        lines.forEach((line) => {
                            const lineWidth = ctx.measureText(line.text).width;
                            let cursorX = x + (lineWidth / 2);

                            line.words.forEach((word: string, localIndex: number) => {
                                const wWidth = ctx.measureText(word + ' ').width;
                                const actualWordIndex = line.startIndex + localIndex;

                                let highlight = qConfig.highlights.find((h: any) => h.verseIndex === activeVerse.verseIndex && h.wordIndex === actualWordIndex);
                                const cleanWord = word.replace(/[\u064B-\u065F]/g, '');
                                if (!highlight) {
                                    const autoH = state.globalStyle.autoHighlights.find((ah: any) => cleanWord.includes(ah.word) || word.includes(ah.word));
                                    if (autoH) highlight = { verseIndex: -1, wordIndex: -1, color: autoH.color };
                                }

                                ctx.fillStyle = highlight ? highlight.color : style.color;
                                ctx.textAlign = 'right';
                                ctx.direction = 'rtl';
                                ctx.fillText(word + ' ', cursorX, startY);
                                cursorX -= wWidth;
                            });
                            startY += lineHeight;
                        });

                        ctx.restore();
                    }
                });
          }
        }

        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });
        const success = inputStream.write(buffer);
        if (!success) {
          await new Promise(r => inputStream.once('drain', r));
        }

            if (frame % 100 === 0) {
              const percent = Math.round((frame / totalFrames) * 100);
              console.log(`Rendered frame ${frame}/${totalFrames} (${percent}%)`);
              if (onProgress) onProgress(percent);
        }
      }
      inputStream.end();
    };

    renderFrames().catch(reject);
  });
}
