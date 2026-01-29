
import { RECITERS_MAP } from '../constants';
import { VerseTiming } from '../types';

/**
 * Downloads a single verse audio file from EveryAyah.com
 */
const downloadVerseAudio = async (reciterId: string, surah: number, ayah: number): Promise<ArrayBuffer> => {
    // Format: 001002.mp3 (3 digits surah, 3 digits ayah)
    const s = surah.toString().padStart(3, '0');
    const a = ayah.toString().padStart(3, '0');
    const filename = `${s}${a}.mp3`;
    const url = `https://everyayah.com/data/${reciterId}/${filename}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch audio for ${surah}:${ayah}`);
    }
    return await response.arrayBuffer();
};

/**
 * Detects silence at the start and end of an AudioBuffer and returns the trimmed duration and range.
 * Using a simple threshold logic (e.g., -16dB approx).
 */
const analyzeSilence = (buffer: AudioBuffer, threshold = 0.05) => {
    const channelData = buffer.getChannelData(0); // Analyze first channel
    const len = channelData.length;
    let start = 0;
    let end = len;

    // Detect Leading Silence
    for (let i = 0; i < len; i++) {
        if (Math.abs(channelData[i]) > threshold) {
            start = i;
            break;
        }
    }

    // Detect Trailing Silence
    for (let i = len - 1; i >= start; i--) {
        if (Math.abs(channelData[i]) > threshold) {
            end = i + 1; // +1 to include the last sample
            break;
        }
    }

    // If completely silent (unlikely for a verse)
    if (start >= end) {
        return { start: 0, end: len, duration: buffer.duration }; 
    }

    return { 
        start, 
        end, 
        duration: (end - start) / buffer.sampleRate 
    };
};

/**
 * Main function to prepare Reciter Mode Audio.
 * 1. Downloads all verses.
 * 2. Trims silence.
 * 3. Concatenates into one master AudioBuffer.
 * 4. Generates VerseTiming array.
 */
export const prepareReciterAudio = async (
    reciterId: string, 
    surah: number, 
    fromAyah: number, 
    toAyah: number,
    verseTexts: string[], // Pre-fetched texts
    onProgress: (msg: string, percent: number) => void
): Promise<{ masterBuffer: AudioBuffer, timings: VerseTiming[] }> => {
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const verseCount = toAyah - fromAyah + 1;
    const buffers: AudioBuffer[] = [];
    const trimInfos: { start: number; end: number; duration: number }[] = [];

    // 1. Download & Decode loop
    for (let i = 0; i < verseCount; i++) {
        const currentAyah = fromAyah + i;
        onProgress(`جاري تحميل الآية ${currentAyah}...`, 10 + Math.round((i / verseCount) * 20)); // 10% to 30%
        
        try {
            const rawData = await downloadVerseAudio(reciterId, surah, currentAyah);
            const audioBuffer = await audioContext.decodeAudioData(rawData);
            
            // 2. Analyze Silence
            const info = analyzeSilence(audioBuffer);
            buffers.push(audioBuffer);
            trimInfos.push(info);
            
        } catch (e) {
            console.error(e);
            throw new Error(`تعذر تحميل الصوت للآية ${currentAyah}`);
        }
    }

    // 3. Create Master Buffer
    onProgress("جاري دمج المقاطع الصوتية...", 35);
    const totalSamples = trimInfos.reduce((acc, curr) => acc + (curr.end - curr.start), 0);
    const masterBuffer = audioContext.createBuffer(
        1, // Mono is usually fine for speech, reduces processing. Or 2 if source is stereo.
        totalSamples,
        audioContext.sampleRate
    );
    const channelData = masterBuffer.getChannelData(0);

    // 4. Fill Master Buffer & Generate Timings
    const timings: VerseTiming[] = [];
    let currentSampleOffset = 0;
    let currentTimeOffset = 0;

    for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        const info = trimInfos[i];
        const verseText = verseTexts[i] || `آية ${fromAyah + i}`;
        
        // Copy trimmed data
        const originalData = buffer.getChannelData(0);
        // Optimized copy
        const segment = originalData.subarray(info.start, info.end);
        channelData.set(segment, currentSampleOffset);

        // Timing Logic (The "Magic" Sync)
        const duration = info.duration;
        timings.push({
            verseIndex: i,
            text: verseText,
            startTime: parseFloat(currentTimeOffset.toFixed(2)),
            endTime: parseFloat((currentTimeOffset + duration).toFixed(2))
        });

        currentSampleOffset += segment.length;
        currentTimeOffset += duration;
    }
    
    // Close context to free resources (we have the buffer now)
    // Note: In some browsers, closing might invalidate the buffer if created from it? 
    // Actually AudioBuffer is independent once created. But let's keep context open or close carefully. 
    // Standard practice: return buffer, let garbage collector handle context wrapper if needed.
    await audioContext.close();

    return { masterBuffer, timings };
};
